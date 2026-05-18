# Backend

This backend handles the WebSocket connection and API endpoints used by the frontend.

## Run

```bash
npm install
```

Create `.env` file and add your token.
You can refer `.env.example`

## Running the Server

Start the backend server:

```bash
npm start
```

Backend runs on:

```
http://localhost:5000
```

## Initial Logs

When the server starts:

```
Server running on http://localhost:5000
Server reachable
Connecting to WS...
WS connected
```

## Sending Messages

Whenever messages are triggered from the frontend, logs look like this:

```
Sent 1
Sent 2
Sent 3
Sent 4

WS closed
WS disconnected during sending

Connecting to WS...
WS connected

Sent 1
Sent 2
Sent 3

📩 { echo_message: 'ping 1', counter: 11, ts: 1779082098914 }

Sent 4
Sent 5

📩 { echo_message: 'ping 3', counter: 13, ts: 1779082099120 }

Sent 6

WS closed
WS disconnected during sending

Connecting to WS...
WS connected

Sent 1
Sent 2
Sent 3

WS closed
WS disconnected during sending

Connecting to WS...
```

## API Endpoints

### GET /health
Check server health status.

### GET /messages
Returns all received messages.

### GET /status
Returns current websocket connection state.

### POST /send
Starts sending messages.

### POST /reset
Clears message history and resets state.