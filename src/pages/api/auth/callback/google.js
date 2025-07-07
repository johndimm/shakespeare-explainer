import { OAuth2Client } from 'google-auth-library';
import prisma from '../../../../lib/db';
import jwt from 'jsonwebtoken';

// Force deployment update - Vercel deployment debug
console.log('Google callback route loaded at:', new Date().toISOString());

// More robust base URL handling for mobile
const getBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL;
  }
  // Default fallback
  return 'http://localhost:3000';
};

const baseUrl = getBaseUrl();
const redirectUri = `${baseUrl}/api/auth/callback/google`;

const client = new OAuth2Client(
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  redirectUri
);

export default async function handler(req, res) {
  const { code, state, error, error_description } = req.query;
  
  // Handle OAuth errors from Google
  if (error) {
    console.error('OAuth error from Google:', error, error_description);
    const errorMessage = `OAuth Error: ${error} - ${error_description || 'Authentication failed'}`;
    return res.redirect(`/?error=${encodeURIComponent(error)}&error_description=${encodeURIComponent(error_description || errorMessage)}`);
  }
  
  const isMobile = state && state.includes('mobile_true');
  console.log('Google OAuth callback - Mobile:', isMobile, 'State:', state);
  console.log('Google OAuth redirect URI:', redirectUri);
  
  if (!code) {
    console.error('Missing authorization code in callback');
    const errorMsg = 'Missing authorization code - OAuth flow incomplete';
    return res.redirect(`/?error=missing_code&error_description=${encodeURIComponent(errorMsg)}`);
  }

  try {
    // Exchange code for tokens
    console.log('Exchanging code for tokens');
    console.log("process.env.NEXT_PUBLIC_BASE_URL", process.env.NEXT_PUBLIC_BASE_URL);
    console.log("baseUrl", baseUrl);

    let tokens;
    try {
      // Set the redirect URI explicitly before token exchange
      client.redirectUri = redirectUri;
      const tokenResponse = await client.getToken(code);
      tokens = tokenResponse.tokens;
      console.log('Token exchange successful, tokens received:', Object.keys(tokens));
      
      if (!tokens || !tokens.id_token) {
        console.error('Google token exchange failed - no ID token:', tokenResponse);
        return res.status(500).send('Google token exchange failed - no ID token received.');
      }
    } catch (err) {
      console.error('Google getToken error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        redirectUri: redirectUri,
        code: code ? 'present' : 'missing',
        isMobile: isMobile
      });
      
      // Handle specific error types
      let errorMessage = err.message;
      if (err.message.includes('invalid_grant')) {
        errorMessage = isMobile 
          ? 'Mobile OAuth failed: Authorization code expired or invalid. This often happens on mobile browsers. Please try signing in again.'
          : 'Authorization code expired or invalid. Please try signing in again.';
      }
      
      return res.redirect(`/?error=token_exchange_failed&error_description=${encodeURIComponent(errorMessage)}`);
    }

    client.setCredentials(tokens);

    // Get user info from Google
    let payload;
    try {
      const ticket = await client.verifyIdToken({
        idToken: tokens.id_token,
        audience: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
      if (!payload) {
        throw new Error('No payload in Google ID token');
      }
    } catch (err) {
      console.error('Google verifyIdToken error:', err.message || err);
      return res.status(500).send('Google ID token verification failed.');
    }

    // Upsert user in database
    let user = await prisma.user.findUnique({ where: { email: payload.email } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: payload.email,
          name: payload.name,
          picture: payload.picture,
          emailVerified: payload.email_verified,
          authProvider: 'google',
          googleId: payload.sub,
        },
      });
    } else {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          name: payload.name,
          picture: payload.picture,
          emailVerified: payload.email_verified,
          authProvider: 'google',
          googleId: payload.sub,
        },
      });
    }

    // Generate JWT
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        name: user.name,
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Redirect to home page with token as query param
    return res.redirect(`/?token=${token}`);
  } catch (error) {
    console.error('Google OAuth callback error:', error);
    return res.status(500).send('Google authentication failed.');
  }
} 