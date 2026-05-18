# Frontend: Message Viewer Dashboard

A responsive React application that provides a real-time dashboard for monitoring WebSocket messages, connection status, and counter verification. The UI allows you to trigger message transmission and view detailed logs of all received messages.

## Overview

The frontend is a modern React application that connects to the backend API and displays:

- **Live Connection Status**: Real-time indicator showing WebSocket connection state
- **Message Table**: Detailed list of all received messages with counters
- **Monotonic Verification**: Visual confirmation that counters are in increasing order
- **Operation Controls**: Buttons to send messages and reset the server
- **Auto-polling**: Automatically fetches updates from the backend

## Installation

Install all required packages:

```bash
cd frontend
npm install
```

## Starting the Application

Start the React development server:

```bash
npm start
```

The application will automatically open in your default browser at `http://localhost:3000`

## Features

### Connection Status Bar
The top of the dashboard shows the current connection status:
- **Online (Green Dot)**: WebSocket is connected and ready
- **Offline (Red Dot)**: WebSocket is disconnected
- **Retry Counter**: Shows how many reconnection attempts have been made

### Message Table
Displays all received messages in a scrollable table with:
- **Counter**: Sequential counter from the server (should increase by 1 for each message)
- **Timestamp**: When the message was received
- **Additional Data**: Any other message properties from the server

### Control Buttons
- **Send Messages**: Transmits 30 messages through the WebSocket connection
- **Reset**: Clears all messages and resets the server counter

### Monotonic Verification
After sending messages, the application displays:
- **Success Badge**: "Counters in order ✓" if all counters are monotonically increasing
- **Warning Badge**: "Counter order issue" if any anomalies are detected

## How to Use

### 1. Check Connection Status
Wait for the green "Online" indicator in the status bar, confirming the backend is connected to the WebSocket server.

### 2. Send Messages
Click the "Send Messages" button to transmit 30 messages to the server. Watch the console for real-time updates.

### 3. View Results
The message table will automatically populate with received messages. Each row represents a single message with its counter value.

### 4. Verify Order
Check the monotonic indicator to confirm all counters are in increasing order: 1, 2, 3, ..., 30

### 5. Reset (Optional)
Click "Reset" to clear all messages and start over.

## Requirements

The frontend requires:
- Backend server running on `http://localhost:5000`
- Node.js 14+ and npm 6+
- Modern web browser (Chrome, Firefox, Safari, or Edge)

## Troubleshooting

**Connection Shows as Offline**
- Ensure the backend server is running (`npm start` in the backend folder)
- Check that the backend is listening on port 5000
- Look for network errors in the browser console (F12)

**Messages Not Appearing**
- Verify the backend has successfully connected to the WebSocket server
- Check the backend console for any error messages
- Ensure the authentication token is valid

**Page Won't Load**
- Check that port 3000 is available
- Try clearing your browser cache
- Restart the development server

## Technologies Used

- **React 18**: UI framework
- **React Hooks**: State management (useState, useEffect, useRef)
- **Fetch API**: HTTP communication with backend
- **CSS3**: Styling and responsive design

## Performance Notes

- The frontend polls the backend every 2 seconds for updates
- The message table auto-scrolls to show the latest message
- Toast notifications appear for 3 seconds and automatically dismiss
- Connection status updates in real-time via polling
