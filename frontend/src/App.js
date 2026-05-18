import React, { useState, useEffect, useRef } from 'react';
import './App.css';

const API_URL = 'http://localhost:5000';
const POLL_INTERVAL_MS = 2000;

function App() {
  const [messages, setMessages]     = useState([]);
  const [isMonotonic, setIsMonotonic] = useState(null);
  const [status, setStatus]         = useState(null);
  const [loading, setLoading]       = useState(false);
  const [toast, setToast]           = useState(null);
  const pollingRef = useRef(null);
  const tableRef   = useRef(null);

  // ── Toast ──────────────────────────────────
  function showToast(type, text) {
    setToast({ type, text });
    setTimeout(() => setToast(null), 3000);
  }

  // ── Status ─────────────────────────────────
  async function checkStatus() {
    try {
      const res  = await fetch(`${API_URL}/status`);
      const data = await res.json();
      setStatus(data);
    } catch {
      setStatus(null);
    }
  }

  // ── Fetch messages ──────────────────────────
  async function fetchMessages(silent = false) {
    try {
      if (!silent) setLoading(true);
      const res  = await fetch(`${API_URL}/messages`);
      if (!res.ok) throw new Error('Failed to fetch messages');
      const data = await res.json();
      setMessages(data.messages || []);
      setIsMonotonic(data.isMonotonic);
    } catch (err) {
      if (!silent) showToast('error', err.message);
    } finally {
      if (!silent) setLoading(false);
    }
  }

  // ── Auto-scroll ─────────────────────────────
  useEffect(() => {
    if (tableRef.current) {
      tableRef.current.scrollTop = tableRef.current.scrollHeight;
    }
  }, [messages.length]);

  // ── Poll status ─────────────────────────────
  useEffect(() => {
    checkStatus();
    const id = setInterval(checkStatus, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  //  Poll messages
  function startPolling() {
    if (pollingRef.current) return;
    pollingRef.current = setInterval(() => fetchMessages(true), POLL_INTERVAL_MS);
  }

  function stopPolling() {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }

  // Send
  async function handleSend() {
    try {
      setLoading(true);
      setToast(null);

      const res  = await fetch(`${API_URL}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count: 30 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Server error ${res.status}`);

      showToast('success', `Sent ${data.count} messages`);
      startPolling();
      setTimeout(stopPolling, 10000);
    } catch (err) {
      showToast('error', err.message);
    } finally {
      setLoading(false);
    }
  }

  // Reset
  async function handleReset() {
    try {
      stopPolling();
      setLoading(true);

      const res = await fetch(`${API_URL}/reset`, { method: 'POST' });
      if (!res.ok) throw new Error('Reset failed');

      setMessages([]);
      setIsMonotonic(null);
      showToast('success', 'Node reset complete');
      await checkStatus();
    } catch (err) {
      showToast('error', err.message);
    } finally {
      setLoading(false);
    }
  }

  const wsConnected = status?.wsConnected ?? false;
  const barState = status?.isSending ? 'sending' : wsConnected ? 'connected' : 'disconnected';

  return (
    <div className="App">

      {/* ── Header ── */}
      <header className="App-header">
        <h1>
          <span className="icon">⚡</span>
          Signal Hub
        </h1>
        <span className="logo-badge">NURA · WebSocket Controller</span>
      </header>
      
      <div className={`status-bar ${barState}`}>
        <span className={`dot ${status?.isSending ? 'yellow' : wsConnected ? 'green' : 'red'}`} />
        <span className="status-value">
          {status?.isSending ? 'Sending' : wsConnected ? 'Online' : 'Offline'}
        </span>
        <span className="count-badge">{messages.length} MSG</span>
      </div>

      {/* ── Toast ── */}
      {toast && (
        <div className={`toast ${toast.type}`}>
          {toast.type === 'success' ? '✓' : '✕'} {toast.text}
        </div>
      )}

      {/* ── Controls ── */}
      <div className="controls">
        <button onClick={handleReset} disabled={loading || !wsConnected}>
          Reset Node
        </button>
        <button onClick={handleSend} disabled={loading || !wsConnected}>
          {loading ? 'Processing…' : '⚡ Send 30 messages'}
        </button>
      </div>

      {/* ── Content ── */}
      {messages.length > 0 && (
        <div className="content">

          <p className="section-label">Live Message Feed</p>

          <div className="content-meta">
            <div className="meta-chip">
              <span className="chip-label">Total</span>
              <span className="chip-value">{messages.length}</span>
            </div>

            <div className="meta-chip">
              <span className="chip-label">Sequence</span>
              <span className="chip-value">
                {isMonotonic === null ? '—' : isMonotonic ? '✓ Monotonic' : '✕ Not Monotonic'}
              </span>
            </div>
          </div>

          <div className="table-wrapper" ref={tableRef}>
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
                    <td>{new Date(msg.ts).toLocaleTimeString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* ── Empty State ── */}
      {messages.length === 0 && !loading && (
        <div className="empty-state">
          {/* <span className="empty-icon">📡</span> */}
          <span>Click on ⚡ Send 30 messages</span>
        </div>
      )}

    </div>
  );
}

export default App;