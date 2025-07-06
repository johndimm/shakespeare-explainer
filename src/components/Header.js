import { useEffect, useState } from 'react';

export default function Header({ user, onSignIn, onSignOut, usage, isPremium, nextReset }) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!nextReset) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [nextReset]);

  // Format countdown
  let countdown = '';
  if (nextReset) {
    const ms = Math.max(0, nextReset - now);
    const min = Math.floor(ms / 60000);
    const sec = Math.floor((ms % 60000) / 1000);
    countdown = `${min}:${sec.toString().padStart(2, '0')}`;
  }

  return (
    <header
      className="w-full"
      style={{
        background: '#f9fafb',
        borderBottom: '1px solid #e5e7eb',
        padding: '6px 10px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        fontFamily: 'inherit',
        fontSize: 14,
        fontWeight: 500,
        marginBottom: 6,
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      {/* Top row: email, usage, sign out (single row on desktop, stacked on mobile) */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
          width: '100%',
        }}
      >
        <div style={{ color: '#374151', fontWeight: 600, fontSize: 14, wordBreak: 'break-all' }}>
          {user && user.email}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          {isPremium ? (
            <span style={{ color: '#059669', fontWeight: 600, fontSize: 13 }}>Unlimited explanations</span>
          ) : (
            <span style={{ color: '#374151', fontSize: 13 }}>
              Explanations used: <b>{usage}</b> / 3
              <span style={{ color: '#9ca3af', marginLeft: 3, fontWeight: 400, fontSize: 11 }}>
                (resets every hour)
              </span>
            </span>
          )}
        </div>
        <div>
          {user ? (
            <button
              onClick={onSignOut}
              style={{
                padding: '4px 14px',
                borderRadius: 14,
                border: 'none',
                background: '#e5e7eb',
                color: '#374151',
                fontWeight: 600,
                fontSize: 14,
                cursor: 'pointer',
                marginLeft: 0,
                minWidth: 70
              }}
            >
              Sign Out
            </button>
          ) : (
            <button
              onClick={onSignIn}
              style={{
                padding: '4px 14px',
                borderRadius: 14,
                border: 'none',
                background: '#3b82f6',
                color: 'white',
                fontWeight: 600,
                fontSize: 14,
                cursor: 'pointer',
                marginLeft: 0,
                minWidth: 70
              }}
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
} 