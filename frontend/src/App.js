import React, {
  useState,
  useEffect,
  useRef,
  useCallback
} from 'react';

import './App.css';

const API_URL = 'http://localhost:5000';
const POLL_INTERVAL_MS = 2000;

function App() {
  const [messages, setMessages] = useState([]);
  const [isMonotonic, setIsMonotonic] = useState(null);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const pollingRef = useRef(null);
  const tableRef = useRef(null);
  const completionShownRef = useRef(false);

  function showToast(type, text) {
    setToast({ type, text });

    setTimeout(() => {
      setToast(null);
    }, 3000);
  }

  const checkStatus = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/status`);
      const data = await res.json();
      setStatus(data);
    } catch {
      setStatus(null);
    }
  }, []);

  async function fetchMessages(silent = false) {
    try {
      if (!silent) {
        setLoading(true);
      }

      const res = await fetch(`${API_URL}/messages`);

      if (!res.ok) {
        throw new Error('Failed to fetch messages');
      }

      const data = await res.json();
      const msgList = data.messages || [];

      setMessages(msgList);
      setIsMonotonic(data.isMonotonic);

      if (msgList.length === 30 && !completionShownRef.current) {
        completionShownRef.current = true;
        showToast('success', `✓ All 30 messages confirmed by server!`);
      }

    } catch (err) {

      if (!silent) {
        showToast('error', err.message);
      }

    } finally {

      if (!silent) {
        setLoading(false);
      }

    }
  }

  useEffect(() => {
    if (tableRef.current) {
      tableRef.current.scrollTop =
        tableRef.current.scrollHeight;
    }
  }, [messages.length]);

  useEffect(() => {
    checkStatus();

    const id = setInterval(
      checkStatus,
      POLL_INTERVAL_MS
    );

    return () => clearInterval(id);

  }, [checkStatus]);

  function startPolling() {
    if (pollingRef.current) return;

    pollingRef.current = setInterval(() => {
      fetchMessages(true);
    }, POLL_INTERVAL_MS);
  }

  function stopPolling() {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }

  async function handleSend() {
    try {
      setLoading(true);
      setToast(null);

      const res = await fetch(`${API_URL}/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          count: 30
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error ||
          `Server error ${res.status}`
        );
      }

      startPolling();

      setTimeout(() => {
        stopPolling();
      }, 30000);

    } catch (err) {

      showToast('error', err.message);

    } finally {

      setLoading(false);

    }
  }

  async function handleReset() {
    try {
      stopPolling();

      setLoading(true);

      completionShownRef.current = false;

      const res = await fetch(
        `${API_URL}/reset`,
        {
          method: 'POST'
        }
      );

      if (!res.ok) {
        throw new Error('Reset failed');
      }

      setMessages([]);
      setIsMonotonic(null);

      showToast(
        'success',
        'Node reset complete'
      );

      await checkStatus();

    } catch (err) {

      showToast('error', err.message);

    } finally {

      setLoading(false);

    }
  }

  const wsConnected =
    status?.wsConnected ?? false;

  const isRetrying =
    !wsConnected &&
    (status?.reconnectAttempts ?? 0) > 0;

  const barState =
    status?.isSending
      ? 'sending'
      : isRetrying
      ? 'reconnecting'
      : wsConnected
      ? 'connected'
      : 'disconnected';

  return (
    <div className="App">

      <header className="App-header">
        <h1>
          <span className="icon">⚡</span>
          Signal Hub
        </h1>

        <span className="logo-badge">
          NURA · WebSocket Controller
        </span>
      </header>

      <div className={`status-bar ${barState}`}>

        <span
          className={`dot ${
            status?.isSending
              ? 'yellow'
              : isRetrying
              ? 'orange'
              : wsConnected
              ? 'green'
              : 'red'
          }`}
        />

        <span className="status-value">
          {
            status?.isSending
              ? 'Sending'
              : isRetrying
              ? 'Reconnecting'
              : wsConnected
              ? 'Online'
              : 'Offline'
          }
        </span>

        {status?.queuedMessages > 0 && (
          <>
            <span className="status-divider" />

            <span className="queue-tag">
              ⧳ {status.queuedMessages} queued
            </span>
          </>
        )}

        <span className="count-badge">
          {messages.length} MSG
        </span>

      </div>

      {toast && (
        <div className={`toast ${toast.type}`}>
          {toast.type === 'success'
            ? '✓'
            : '✕'}{' '}
          {toast.text}
        </div>
      )}

      <div className="controls">

        <button
          onClick={handleReset}
          disabled={loading || !wsConnected}
        >
          Reset Node
        </button>

        <button
          onClick={handleSend}
          disabled={loading || !wsConnected}
        >
          {
            loading
              ? 'Processing…'
              : '⚡ Send 30 messages'
          }
        </button>

      </div>

      {messages.length > 0 && (

        <div className="content">

          <p className="section-label">
            Live Message Feed
          </p>

          <div className="content-meta">

            <div className="meta-chip">
              <span className="chip-label">
                Total
              </span>

              <span className="chip-value">
                {messages.length}
              </span>
            </div>

            <div className="meta-chip">
              <span className="chip-label">
                Sequence
              </span>

              <span className="chip-value">
                {
                  isMonotonic === null
                    ? '—'
                    : isMonotonic
                    ? '✓ Monotonic'
                    : '✕ Not Monotonic'
                }
              </span>
            </div>

          </div>

          <div
            className="table-wrapper"
            ref={tableRef}
          >

            <table>

              <thead>
                <tr>
                  <th>#</th>
                  <th>CTR</th>
                  <th>Payload</th>
                  <th>Timestamp</th>
                </tr>
              </thead>

              <tbody>

                {messages.map((msg, i) => (
                  <tr key={i}>

                    <td>{i + 1}</td>

                    <td>{msg.counter}</td>

                    <td>{msg.echo_message}</td>

                    <td>
                      {
                        new Date(msg.ts)
                          .toLocaleTimeString()
                      }
                    </td>

                  </tr>
                ))}

              </tbody>

            </table>

          </div>

        </div>

      )}

      {messages.length === 0 && !loading && (

        <div className="empty-state">
          <span>
            Click on ⚡ Send 30 messages
          </span>
        </div>

      )}

    </div>
  );
}

export default App;