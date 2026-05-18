# Backend: WebSocket Client & API Server

This backend module is responsible for all server communication, WebSocket connection management, and API endpoints. It handles sending messages, tracking responses, and verifying counter integrity.

## Overview

The backend is built with Node.js and Express, providing both a WebSocket client for real-time communication and a REST API for monitoring and control.

### Key Responsibilities

- **WebSocket Communication**: Maintains a persistent connection to the Nura WebSocket server
- **Message Transmission**: Sends exactly 30 messages and tracks responses
- **Real-time Logging**: Outputs detailed logs of server interactions
- **API Endpoints**: Provides REST endpoints for frontend integration
- **Counter Verification**: Validates that received message counters are monotonically increasing
- **Connection Management**: Handles reconnection attempts and error recovery

## Installation

Install all required dependencies:

```bash
npm install
```

Create `.env` file and add your token.

## Running the Server

Start the backend server:

```bash
npm start
```

The server will start on `http://localhost:5000` and automatically:

1. **Health Check**: Verifies the Nura server is reachable
2. **Counter Reset**: Resets the server counter to 0
3. **WebSocket Connection**: Establishes a secure connection to the WebSocket endpoint
4. **Message Transmission**: Sends 30 messages with a 100ms delay between each
5. **Response Logging**: Outputs each received message with its counter value
6. **Result Verification**: Confirms counters are in monotonically increasing order

## Server Interaction Logs

When you run the server, you'll see detailed logs showing the server interaction flow:

```
Server running on http://localhost:5000
Connecting to WS...
✅ WS connected
Connected to Nura WebSocket server

📩 { counter: 1, timestamp: '2026-05-17T10:30:45Z', ... }
📩 { counter: 2, timestamp: '2026-05-17T10:30:45Z', ... }
📩 { counter: 3, timestamp: '2026-05-17T10:30:46Z', ... }
...
📩 { counter: 30, timestamp: '2026-05-17T10:31:02Z', ... }

✅ All 30 messages received
✅ Counters are in monotonically increasing order: [1, 2, 3, ..., 30]
```

## API Endpoints

The backend provides the following REST API endpoints:

### GET /health
Check server health status

### GET /messages
Retrieve all received messages and counter verification status

**Response:**
```json
{
  "messages": [
    { "counter": 1, "timestamp": "...", ... },
    { "counter": 2, "timestamp": "...", ... }
  ],
  "isMonotonic": true,
  "total": 30
}
```

### POST /send
Trigger message transmission (count: 30 by default)

### POST /reset
Reset the server counter and clear message history

### GET /status
Get current connection and operation status
