import { useState, useEffect } from 'react';

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile for responsive styling
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Redirect to Google OAuth
  const handleGoogleRedirect = () => {
    console.log('🔄 Redirecting to Google OAuth...');
    
    // Check for required environment variables
    if (!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
      console.error('❌ NEXT_PUBLIC_GOOGLE_CLIENT_ID not set');
      alert('OAuth configuration error: Google Client ID not configured');
      return;
    }
    
    // Use consistent base URL logic with backend
    let baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    if (!baseUrl) {
      // Fallback logic that matches backend
      const protocol = window.location.protocol;
      const hostname = window.location.hostname;
      const port = window.location.port;
      
      // Only add port if it's not standard HTTP/HTTPS ports
      if (port && port !== '80' && port !== '443') {
        baseUrl = `${protocol}//${hostname}:${port}`;
      } else {
        baseUrl = `${protocol}//${hostname}`;
      }
    }
    
    const redirectUri = `${baseUrl}/api/auth/callback/google`;
    console.log('Frontend OAuth redirect URI:', redirectUri);
    console.log('Base URL source:', process.env.NEXT_PUBLIC_BASE_URL ? 'env var' : 'window.location');
    
    const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
    
    const params = new URLSearchParams({
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'offline',
      prompt: 'consent',
      // Add mobile-specific parameters
      include_granted_scopes: 'true',
      state: `mobile_${isMobile}_timestamp_${Date.now()}`
      // Removed deprecated approval_prompt parameter that conflicts with prompt
    });
    
    console.log('OAuth parameters:', Object.fromEntries(params));
    console.log('Client ID:', process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ? 'present' : 'missing');
    
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    console.log('Full auth URL length:', authUrl.length);
    console.log('Auth URL preview:', authUrl.substring(0, 200) + '...');
    
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
        borderRadius: isMobile ? '0px' : '8px',
        padding: '32px',
        maxWidth: isMobile ? '100vw' : '450px',
        maxHeight: isMobile ? '100vh' : '90vh',
        width: isMobile ? '100%' : '450px',
        height: isMobile ? '100%' : 'auto',
        minHeight: isMobile ? '100vh' : 'auto',
        overflowY: 'auto',
        margin: isMobile ? '0' : '0 8px',
        boxShadow: isMobile ? 'none' : '0 10px 25px rgba(0, 0, 0, 0.2)',
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
              padding: isMobile ? '12px 0' : '14px 0',
              borderRadius: '8px',
              border: 'none',
              fontSize: isMobile ? '16px' : '16px',
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              transition: 'background-color 0.2s ease',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              height: '48px'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#357abd'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#4285F4'}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
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