const express = require('express');

module.exports = function ({ api, headers, wsRef, state }) {
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
      res.json({ status: 'reset' });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  // send (FIXED)
  router.post('/send', async (req, res) => {
    if (state.isSending) {
      return res.status(400).json({ error: 'Already sending' });
    }

    const ws = wsRef();
    if (!ws || ws.readyState !== 1) {
      return res.status(500).json({ error: 'WS not connected' });
    }

    const { count = 10 } = req.body;
    state.isSending = true;

    try {
      for (let i = 1; i <= count; i++) {
        try {
          if (!ws || ws.readyState !== 1) {
            console.log('WS disconnected during sending');
            break;
          }

          ws.send(`ping ${i}`);
          console.log(`Sent ${i}`);
        } catch (err) {
          console.log('Send error:', err.message);
          break;
        }

        await new Promise(r => setTimeout(r, 100));
      }

      res.json({ status: 'done', count });
    } catch (err) {
      res.status(500).json({ error: err.message });
    } finally {
      state.isSending = false; // FIXED (moved to finally)
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
    });
  });

  return router;
};