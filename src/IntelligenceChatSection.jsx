import React, { useState, useEffect, useRef } from 'react';
import { isNexusEnabled, trpcGet, trpcPost } from './nexusApi';

const SESSION_ID = 'gmc-dashboard';

const cardStyle = {
  background: 'rgba(18, 18, 18, 0.6)',
  border: '1px solid rgba(74, 78, 82, 0.3)',
  borderRadius: '16px',
  padding: '28px',
};
const labelStyle = {
  fontSize: '12px',
  color: '#4A4E52',
  fontFamily: "'DM Sans', sans-serif",
  letterSpacing: '1px',
  marginBottom: '8px',
};
const inputStyle = {
  width: '100%',
  padding: '12px 14px',
  background: 'rgba(10, 10, 10, 0.8)',
  border: '1px solid rgba(74, 78, 82, 0.4)',
  borderRadius: '8px',
  color: '#F8FAFC',
  fontSize: '14px',
  fontFamily: "'DM Mono', 'SF Mono', monospace",
};
const btnAccent = {
  padding: '10px 20px',
  background: 'rgba(208, 255, 0, 0.15)',
  border: '1px solid rgba(208, 255, 0, 0.4)',
  borderRadius: '8px',
  color: '#D0FF00',
  cursor: 'pointer',
  fontFamily: "'DM Sans', sans-serif",
  fontSize: '13px',
  fontWeight: '600',
};

export default function IntelligenceChatSection() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const scrollRef = useRef(null);
  const sectionRef = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const loadHistory = async () => {
    setHistoryLoading(true);
    try {
      const data = await trpcGet('chat.history', { sessionId: SESSION_ID, limit: 20 });
      const raw = data?.[0]?.result?.data?.json;
      const list = Array.isArray(raw) ? raw : [];
      setMessages(list.map((m) => ({ role: m.role ?? (m.speaker === 'user' ? 'user' : 'assistant'), content: m.content ?? m.text ?? '' })));
    } catch {
      setMessages([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    if (inView && isNexusEnabled()) loadHistory();
  }, [inView]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || sending) return;
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: text }]);
    setSending(true);
    try {
      const data = await trpcPost('chat.send', { message: text, sessionId: SESSION_ID });
      const payload = data?.[0]?.result?.data?.json;
      const content = payload?.content ?? payload?.text ?? payload?.message ?? 'No response.';
      setMessages((prev) => [...prev, { role: 'assistant', content }]);
    } catch (e) {
      setMessages((prev) => [...prev, { role: 'assistant', content: `Error: ${e.message}` }]);
    } finally {
      setSending(false);
    }
  };

  if (!isNexusEnabled()) {
    return (
      <section id="intelligence-chat" ref={sectionRef} style={{ marginBottom: '48px' }}>
        <h2 style={{ fontSize: '20px', letterSpacing: '2px', color: '#C0C0C0', marginBottom: '24px', fontFamily: "'DM Sans', sans-serif" }}>
          INTELLIGENCE CHAT — Grounded on Convex Research
        </h2>
        <div style={cardStyle}>
          <p style={{ color: '#94A3B8', fontSize: '14px', fontFamily: "'DM Sans', sans-serif" }}>
            Intelligence Chat requires the NEXUS backend. Set <code style={{ background: 'rgba(74,78,82,0.3)', padding: '2px 6px', borderRadius: '4px' }}>VITE_NEXUS_URL</code> in your environment to connect.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section id="intelligence-chat" ref={sectionRef} style={{ marginBottom: '48px' }}>
      <h2 style={{ fontSize: '20px', letterSpacing: '2px', color: '#C0C0C0', marginBottom: '24px', fontFamily: "'DM Sans', sans-serif" }}>
        INTELLIGENCE CHAT — Grounded on Convex Research
      </h2>
      <div style={cardStyle}>
        <div
          ref={scrollRef}
          style={{
            minHeight: '300px',
            maxHeight: '420px',
            overflowY: 'auto',
            padding: '16px',
            background: 'rgba(10, 10, 10, 0.4)',
            borderRadius: '12px',
            border: '1px solid rgba(74, 78, 82, 0.2)',
            marginBottom: '16px',
          }}
        >
          {historyLoading && <div style={{ color: '#94A3B8', fontSize: '13px' }}>Loading history…</div>}
          {!historyLoading && messages.length === 0 && <div style={{ color: '#4A4E52', fontSize: '13px' }}>No messages yet. Ask something about your Convex research.</div>}
          {messages.map((m, i) => (
            <div
              key={i}
              style={{
                marginBottom: '14px',
                display: 'flex',
                justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start',
              }}
            >
              <div
                style={{
                  maxWidth: '85%',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  fontFamily: "'DM Mono', 'SF Mono', monospace",
                  fontSize: '13px',
                  lineHeight: 1.5,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  ...(m.role === 'user'
                    ? { background: 'rgba(208, 255, 0, 0.12)', border: '1px solid rgba(208, 255, 0, 0.25)', color: '#E2E8F0', textAlign: 'right' }
                    : { background: 'rgba(74, 78, 82, 0.25)', border: '1px solid rgba(74, 78, 82, 0.3)', color: '#CBD5E1' }),
                }}
              >
                {m.content}
              </div>
            </div>
          ))}
          {sending && (
            <div style={{ color: '#94A3B8', fontSize: '13px', marginBottom: '14px' }}>Thinking…</div>
          )}
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && send()}
            placeholder="Ask about Convex research…"
            style={{ ...inputStyle, flex: 1 }}
            disabled={sending}
          />
          <button type="button" onClick={send} disabled={sending} style={btnAccent}>
            Send
          </button>
        </div>
      </div>
    </section>
  );
}
