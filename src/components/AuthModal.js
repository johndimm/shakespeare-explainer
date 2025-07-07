import { useState } from 'react';

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect to Google OAuth
  const handleGoogleRedirect = () => {
    console.log('🔄 Redirecting to Google OAuth...');
    
    // More reliable base URL construction for mobile
    let baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    if (!baseUrl) {
      const protocol = window.location.protocol;
      const hostname = window.location.hostname;
      const port = window.location.port;
      baseUrl = `${protocol}//${hostname}${port && port !== '80' && port !== '443' ? ':' + port : ''}`;
    }
    
    const redirectUri = `${baseUrl}/api/auth/callback/google`;
    console.log('Using redirect URI:', redirectUri);
    
    const params = new URLSearchParams({
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'offline',
      prompt: 'consent',
      // Add mobile-specific parameters
      include_granted_scopes: 'true',
      state: `mobile=${/Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)}`
    });
    
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    console.log('Full auth URL:', authUrl);
    
    // Handle mobile Chrome restrictions
    try {
      window.location.href = authUrl;
    } catch (error) {
      console.error('Mobile OAuth redirect error:', error);
      // Fallback: try opening in same tab
      window.open(authUrl, '_self');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      console.log('✅ Sign in successful!', { user: data.user, token: data.token ? 'Token received' : 'No token' });
      onAuthSuccess(data);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '32px',
        maxWidth: '100vw',
        maxHeight: '100dvh',
        width: '100%',
        height: '100%',
        overflowY: 'auto',
        margin: '0 8px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
        overscrollBehavior: 'contain',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px'
        }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#111827',
            margin: 0
          }}>
            {isLogin ? 'Sign In' : 'Create Account'}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '20px',
              color: '#9ca3af',
              cursor: 'pointer',
              padding: '4px'
            }}
          >
            ✕
          </button>
        </div>

        {/* Google OAuth Redirect Button */}
        <div style={{ marginBottom: '24px' }}>
          <button
            onClick={handleGoogleRedirect}
            style={{
              width: '100%',
              backgroundColor: '#4285F4',
              color: 'white',
              padding: '10px 0',
              borderRadius: '6px',
              border: 'none',
              fontSize: '16px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <svg width="20" height="20" viewBox="0 0 48 48" style={{ marginRight: 8 }}><g><path fill="#4285F4" d="M24 9.5c3.54 0 6.73 1.22 9.24 3.23l6.9-6.9C35.64 2.13 30.13 0 24 0 14.82 0 6.71 5.13 2.34 12.56l8.06 6.26C12.33 13.13 17.73 9.5 24 9.5z"/><path fill="#34A853" d="M46.1 24.5c0-1.64-.15-3.22-.42-4.74H24v9.04h12.4c-.54 2.9-2.18 5.36-4.64 7.04l7.18 5.6C43.89 37.13 46.1 31.27 46.1 24.5z"/><path fill="#FBBC05" d="M10.4 28.82c-1.04-3.13-1.04-6.51 0-9.64l-8.06-6.26C.78 17.13 0 20.47 0 24c0 3.53.78 6.87 2.34 9.56l8.06-6.26z"/><path fill="#EA4335" d="M24 46c6.13 0 11.64-2.13 15.9-5.84l-7.18-5.6c-2.01 1.35-4.58 2.14-8.72 2.14-6.27 0-11.67-3.63-13.6-8.82l-8.06 6.26C6.71 42.87 14.82 48 24 48z"/><path fill="none" d="M0 0h48v48H0z"/></g></svg>
            Sign in with Google
          </button>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '24px'
        }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#d1d5db' }}></div>
          <span style={{ padding: '0 16px', color: '#6b7280', fontSize: '14px' }}>or</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#d1d5db' }}></div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '4px'
            }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '16px',
                backgroundColor: 'white',
                color: '#374151',
                WebkitAppearance: 'none',
                WebkitTapHighlightColor: 'transparent',
                outline: 'none',
                transform: 'translateZ(0)'
              }}
              required
            />
          </div>

          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '4px'
            }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '16px',
                backgroundColor: 'white',
                color: '#374151',
                WebkitAppearance: 'none',
                WebkitTapHighlightColor: 'transparent',
                outline: 'none',
                transform: 'translateZ(0)'
              }}
              required
              minLength={6}
            />
          </div>

          {error && (
            <div style={{ color: '#dc2626', fontSize: '14px' }}>{error}</div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              backgroundColor: '#2563eb',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px',
              opacity: isLoading ? 0.5 : 1
            }}
          >
            {isLoading ? 'Loading...' : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <div style={{ marginTop: '16px', textAlign: 'center' }}>
          <button
            onClick={() => setIsLogin(!isLogin)}
            style={{
              background: 'none',
              border: 'none',
              color: '#2563eb',
              fontSize: '14px',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
} 