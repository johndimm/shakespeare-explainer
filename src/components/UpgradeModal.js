import React from 'react';

export default function UpgradeModal({ open, onClose, onUpgrade }) {
  if (!open) return null;
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(0,0,0,0.18)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16
    }}>
      <div style={{
        background: '#fff',
        borderRadius: 16,
        maxWidth: 370,
        width: '100%',
        boxSizing: 'border-box',
        padding: '32px 24px 20px 24px',
        boxShadow: '0 2px 16px rgba(0,0,0,0.07)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        <div style={{ fontWeight: 700, fontSize: 22, color: '#1e293b', marginBottom: 8, textAlign: 'center' }}>
          Daily Limit Reached
        </div>
        <div style={{ color: '#475569', fontSize: 15, marginBottom: 22, textAlign: 'center', lineHeight: 1.5 }}>
          You've reached your limit of <b>3 explanations per hour</b>.<br />
          Please wait or upgrade to Premium for more access.
        </div>
        <div style={{
          background: '#f1f5f9',
          borderRadius: 10,
          padding: '18px 16px',
          width: '100%',
          marginBottom: 24,
        }}>
          <div style={{ fontWeight: 600, color: '#2563eb', fontSize: 16, marginBottom: 10, textAlign: 'center' }}>
            Upgrade to Premium
          </div>
          <ul style={{
            listStyle: 'none',
            padding: 0,
            margin: 0,
            color: '#334155',
            fontSize: 15,
            lineHeight: 1.7
          }}>
            <li style={{ marginBottom: 4 }}><span style={{ color: '#22c55e', fontWeight: 700, marginRight: 6 }}>✓</span>Unlimited explanations</li>
            <li style={{ marginBottom: 4 }}><span style={{ color: '#22c55e', fontWeight: 700, marginRight: 6 }}>✓</span>500 chat messages per day</li>
            <li style={{ marginBottom: 4 }}><span style={{ color: '#22c55e', fontWeight: 700, marginRight: 6 }}>✓</span>50 file uploads per day</li>
            <li style={{ marginBottom: 4 }}><span style={{ color: '#22c55e', fontWeight: 700, marginRight: 6 }}>✓</span>Priority support</li>
            <li><span style={{ color: '#22c55e', fontWeight: 700, marginRight: 6 }}>✓</span>Advanced features</li>
          </ul>
        </div>
        <div style={{ display: 'flex', width: '100%', gap: 10 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              background: 'none',
              border: 'none',
              color: '#64748b',
              fontWeight: 500,
              fontSize: 15,
              padding: '10px 0',
              borderRadius: 8,
              cursor: 'pointer',
              transition: 'background 0.15s',
            }}
          >
            Maybe Later
          </button>
          <button
            onClick={onUpgrade}
            style={{
              flex: 1,
              background: 'linear-gradient(90deg, #2563eb 60%, #3b82f6 100%)',
              color: 'white',
              border: 'none',
              fontWeight: 600,
              fontSize: 15,
              padding: '10px 0',
              borderRadius: 8,
              cursor: 'pointer',
              boxShadow: '0 1px 4px rgba(37,99,235,0.08)',
              transition: 'background 0.15s',
            }}
          >
            Upgrade Now
          </button>
        </div>
      </div>
    </div>
  );
} 