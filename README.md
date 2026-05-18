# Signal Hub

Realtime websocket dashboard built with React, Node.js, Express, and WebSocket.

## Project Structure

```
Assignment/
├── README.md                 # Project overview and instructions
│
├── backend/                  # WebSocket client & Express server
│   ├── index.js              # Main application entry point
│   ├── routes/
│   │   └── api.js            # API endpoints
│   ├── package.json          # Dependencies
│   ├── .env                  # Environment configuration (need to be added)
│   └── README.md             # Backend-specific documentation
│
└── frontend/                 # React message viewer
    ├── src/
    │   ├── App.js            # Main React component
    │   ├── App.css           # Styling
    │   ├── index.js          # React entry point
    │   └── index.css         # Global styles
    ├── public/
    │   └── index.html        # HTML template
    ├── package.json          # Dependencies
    └── README.md             # Frontend-specific documentation
```

## Run Backend

```bash
cd backend
npm install
npm start
```

Backend runs on:

```
http://localhost:5000
```

## Run Frontend

```bash
cd frontend
npm install
npm start
```

Frontend runs on:

```
http://localhost:3000
```

## Features

- Realtime websocket communication
- Auto reconnect handling
- Live connection status
- Send messages from frontend
- Live message updates
- Counter order verification
- Reset functionality

## Notes

Detailed setup and logs are available inside:

```
backend/README.md
frontend/README.md
```