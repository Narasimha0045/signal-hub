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
};

let ws = null;

// websocket
function connect() {
  console.log('Connecting to WS...');

  ws = new WebSocket(`${WS_URL}/ws?token=${TOKEN}`, {
    agent: httpsAgent,
  });

  ws.on('open', () => {
    console.log('WS connected');
    state.reconnectAttempts = 0;
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