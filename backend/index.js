require('dotenv').config();

// prevent crashes
process.on('uncaughtException', (err) => {
  console.log('Uncaught:', err.message);
});

process.on('unhandledRejection', (err) => {
  console.log('Unhandled:', err?.message || err);
});

const express = require('express');
const cors = require('cors');
const axios = require('axios');
const https = require('https');
const WebSocket = require('ws');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 5000;

const { TOKEN, WS_URL, SERVER_URL } = process.env;

const headers = {
  Authorization: `Bearer ${TOKEN}`,
};

const httpsAgent = new https.Agent({ rejectUnauthorized: false });

const api = axios.create({
  baseURL: SERVER_URL,
  httpsAgent,
});

// shared state
const state = {
  isSending: false,
  receivedMessages: [],
  reconnectAttempts: 0,
  messageQueue: [], 
  isProcessingQueue: false,
  lastQueueComplete: 0, 
  totalSentThisRound: 0, 
};

let ws = null;

// Process message queue when WS is connected
async function processMessageQueue() {
  if (state.isProcessingQueue || state.messageQueue.length === 0) return;
  if (!ws || ws.readyState !== 1) return;

  state.isProcessingQueue = true;
  const queueLength = state.messageQueue.length;
  console.log(`Processing queue: ${queueLength} messages`);

  try {
    while (state.messageQueue.length > 0) {
      if (!ws || ws.readyState !== 1) {
        console.log('WS disconnected while processing queue');
        break;
      }

      const message = state.messageQueue.shift();
      try {
        ws.send(message);
        console.log(`Queue sent: ${message}`);
        state.totalSentThisRound++;
        await new Promise(r => setTimeout(r, 100));
      } catch (err) {
        console.log('Queue send error:', err.message);
        state.messageQueue.unshift(message);
        break;
      }
    }
    
    if (state.messageQueue.length === 0) {
      state.lastQueueComplete = Date.now();
      console.log(`✓ Queue processing complete! Total sent this round: ${state.totalSentThisRound}`);
    }
  } finally {
    state.isProcessingQueue = false;
  }
}

// websocket
function connect() {
  console.log('Connecting to WS...');

  ws = new WebSocket(`${WS_URL}/ws?token=${TOKEN}`, {
    agent: httpsAgent,
  });

  ws.on('open', () => {
    console.log('WS connected');
    state.reconnectAttempts = 0;
    setTimeout(processMessageQueue, 500);
  });

  ws.on('message', (data) => {
    try {
      const msg = JSON.parse(data);
      console.log('📩', msg);
      state.receivedMessages.push(msg);
    } catch {
      console.log('Invalid message');
    }
  });

  ws.on('close', () => {
    console.log('WS closed');
    state.reconnectAttempts++;
    setTimeout(connect, 3000);
  });

  ws.on('error', (err) => {
    console.log('WS error:', err.message);
    try { ws.close(); } catch {}
  });
}

const routes = require('./routes/api')({
  api,
  headers,
  wsRef: () => ws,
  state,
  processMessageQueue,
  resetTotalSent: () => { state.totalSentThisRound = 0; state.lastQueueComplete = 0; },
});

app.use('/', routes);

app.listen(PORT, async () => {
  console.log(`Server running on http://localhost:${PORT}`);

  try {
    await api.get('/health', { headers });
    console.log('Server reachable');
    connect();
  } catch (err) {
    console.log('Server not reachable');
    console.log(err.response?.status);
    console.log(err.message);
    setInterval(connect, 5000);
  }
});