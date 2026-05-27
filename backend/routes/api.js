const express = require('express');

module.exports = function ({ api, headers, wsRef, state, processMessageQueue, resetTotalSent }) {
  const router = express.Router();

  // health check
  router.get('/health', async (req, res) => {
    try {
      const r = await api.get('/health', { headers });
      res.json(r.data);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  // messages 
  router.get('/messages', async (req, res) => {
    try {
      const r = await api.get('/messages', { headers });
      const data = r.data;
      const messages = data.messages || [];

      const isMonotonic =
        data.isMonotonic ??
        (messages.length < 2
          ? true
          : messages.every(
              (msg, i) => i === 0 || msg.counter > messages[i - 1].counter
            ));

      res.json({ ...data, messages, isMonotonic });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  // reset
  router.post('/reset', async (req, res) => {
    try {
      await api.post('/reset', {}, { headers });
      state.receivedMessages = [];
      resetTotalSent();
      res.json({ status: 'reset' });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  // send
  router.post('/send', async (req, res) => {
    if (state.isSending) {
      return res.status(400).json({ error: 'Already sending' });
    }

    const ws = wsRef();
    const { count = 30 } = req.body;
    state.isSending = true;
    resetTotalSent();
    let sentCount = 0;
    let queuedCount = 0;

    try {
      for (let i = 1; i <= count; i++) {
        const message = `ping ${i}`;

        if (ws && ws.readyState === 1) {
          try {
            ws.send(message);
            console.log(`Sent immediately: ${i}`);
            sentCount++;
            state.totalSentThisRound++;
          } catch (err) {
            console.log(`Failed to send ${i}, queueing:`, err.message);
            state.messageQueue.push(message);
            queuedCount++;
          }
        } else {
          console.log(`WS not connected, queueing: ${i}`);
          state.messageQueue.push(message);
          queuedCount++;
        }

        await new Promise(r => setTimeout(r, 50));
      }
      if (ws && ws.readyState === 1 && state.messageQueue.length > 0) {
        await processMessageQueue();
      }

      res.json({
        status: 'queued',
        count,
        sent: sentCount,
        queued: queuedCount,
        totalSentThisRound: state.totalSentThisRound,
        lastQueueComplete: state.lastQueueComplete,
        message: queuedCount > 0 
          ? `${sentCount} sent immediately, ${queuedCount} queued (will send on reconnect)`
          : `All ${sentCount} messages sent successfully`,
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    } finally {
      state.isSending = false;
    }
  });

  // status
  router.get('/status', (req, res) => {
    const ws = wsRef();

    res.json({
      wsConnected: ws?.readyState === 1,
      messages: state.receivedMessages.length,
      reconnectAttempts: state.reconnectAttempts,
      isSending: state.isSending,
      queuedMessages: state.messageQueue.length,
      isProcessingQueue: state.isProcessingQueue,
      totalSentThisRound: state.totalSentThisRound,
      lastQueueComplete: state.lastQueueComplete,
    });
  });

  return router;
};