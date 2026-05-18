# Signal Hub: WebSocket Server Integration

A full-stack application that demonstrates WebSocket communication with a Nura server, message queuing, and real-time counter verification. The system sends 30 messages through the WebSocket protocol, logs detailed server interactions, and verifies that response counters are in monotonically increasing order.

## Project Overview

This project consists of two main components:

- **Backend**: A Node.js WebSocket client that handles server communication, message transmission, and response logging
- **Frontend**: A React UI for visualizing messages, monitoring connection status, and triggering operations

The application is designed to be self-contained and easy to run with minimal configuration.

## Project Structure

```
Assignment/
├── README.md                 # Project overview and instructions
│
├── backend/                  # WebSocket client & Express server
│   ├── index.js             # Main application entry point
│   ├── routes/
│   │   └── api.js           # API endpoints
│   ├── package.json         # Dependencies
│   ├── .env                 # Environment configuration (pre-configured)
│   └── README.md            # Backend-specific documentation
│
└── frontend/                 # React message viewer
    ├── src/
    │   ├── App.js           # Main React component
    │   ├── App.css          # Styling
    │   ├── index.js         # React entry point
    │   └── index.css        # Global styles
    ├── public/
    │   └── index.html       # HTML template
    ├── package.json         # Dependencies
    └── README.md            # Frontend-specific documentation
```

## Quick Start Guide

Get the project running in just a few commands:

### 1. Install Backend Dependencies

Navigate to the backend directory and install required packages:

```bash
cd backend
npm install
```

### 2. Start the Backend Server

In the backend directory, start the WebSocket client and API server:

```bash
npm start
```

**Expected output:**
```
Server running on http://localhost:5000
Server reachable
Connecting to WS...
✅ WS connected
📩 {counter: 1, ...}
📩 {counter: 2, ...}
... (continuing for 30 messages)
```

The backend will:
1. Check the Nura server health
2. Reset the server counter
3. Establish a WebSocket connection
4. Send 30 sequential messages
5. Log each received response with its counter value
6. Verify that all counters are in monotonically increasing order

### 3. (Optional) View Results in the Web UI

Open a new terminal and navigate to the frontend directory:

```bash
cd frontend
npm install
npm start
```

The app will open at `http://localhost:3000` and display a beautiful UI with all messages and counter verification.

## Features

### Backend
- Sends 30 messages to the WebSocket server
- Handles real-time message responses
- Uses `/reset` API to clear previous state
- Uses `/messages` API to fetch complete message history
- Verifies monotonically increasing counters
- Logs detailed interaction logs

### Frontend
- Beautiful React UI to visualize messages
- Real-time counter verification
- Sortable message table
- Refresh button to fetch latest data

## Requirements Met

✅ Send 30 messages to the server
✅ Print responses as they arrive
✅ Ensure counters are in monotonically increasing order
✅ Code and run instructions provided
✅ Detailed logs of server interaction
✅ Self-contained (token in .env)

## Server Interaction Flow

The application follows this sequence when you run it:

1. **Health Check** → Verify server is running and reachable
2. **Counter Reset** → Clear any previous messages and reset counter to 0
3. **WebSocket Connect** → Establish a persistent WebSocket connection
4. **Send 30 Messages** → Transmit messages to server (100ms delay between each)
5. **Log Responses** → Print each response with counter value to console
6. **Fetch History** → Retrieve complete message history via REST API
7. **Verify Order** → Validate that counters are monotonically increasing: [1, 2, 3, ..., 30]
8. **Display Results** → Output final summary with verification status

## Expected Console Output

When you run the backend, you'll see output like this:

```
Server running on http://localhost:5000
Connecting to WS...
✅ WS connected

📩 { counter: 1, timestamp: 2026-05-17T10:30:45.123Z, id: '...' }
📩 { counter: 2, timestamp: 2026-05-17T10:30:45.225Z, id: '...' }
📩 { counter: 3, timestamp: 2026-05-17T10:30:45.327Z, id: '...' }
[... more messages ...]
📩 { counter: 30, timestamp: 2026-05-17T10:31:02.987Z, id: '...' }

✅ All 30 messages received successfully
✅ Counters are in monotonically increasing order: [1, 2, 3, 4, ..., 28, 29, 30]
```

## Results Summary

After sending all 30 messages, you'll receive a summary containing:

- **Total Messages**: 30
- **Counter Status**: Each message number from 1-30 in order
- **Monotonic Verification**: Confirmed if all counters are strictly increasing
- **Timestamps**: Exact time each message was received
- **Message Details**: Full payload of each response from the server

## Environment

- **Node.js**: 14.0.0 or higher
- **npm**: 6.0.0 or higher
- **Browser**: Modern browser with JavaScript enabled (for React frontend)

## Token

Your authentication token is securely stored in `backend/.env`:
```
TOKEN=4b5ee5e7-911d-4efe-b16b-baf4e8d399dc
```

## Logs

The backend outputs comprehensive logs including:
- Server health status
- WebSocket connection events
- Each message sent
- Each response received
- Final summary with monotonically increasing verification

## Troubleshooting

If you encounter issues:

1. **WebSocket connection fails**: Ensure you have a stable internet connection
2. **Timeout errors**: The server might be slow; try running again
3. **CORS errors in React**: This is expected; the React app talks to the server API directly
4. **Token invalid**: Double-check the token in `.env` file

## Files Submitted

This submission includes:
- Backend Node.js client with WebSocket support
- React frontend for visualization
- Complete run instructions
- Detailed logs in console output
- Counter verification logic
