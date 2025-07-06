import { OAuth2Client } from 'google-auth-library';
import prisma from '../../../../lib/db';
import jwt from 'jsonwebtoken';

// Force deployment update - Vercel deployment debug
console.log('Google callback route loaded at:', new Date().toISOString());

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
const client = new OAuth2Client(
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${baseUrl}/api/auth/callback/google`
);

export default async function handler(req, res) {
  const { code } = req.query;
  // Print the redirect URI being used
  const redirectUri = `${baseUrl}/api/auth/callback/google`;
  console.log('Google OAuth redirect URI:', redirectUri);
  if (!code) {
    return res.status(400).send('Missing code parameter');
  }

  try {
    // Exchange code for tokens
    console.log('Exchanging code for tokens');
    console.log("process.env.NEXT_PUBLIC_BASE_URL", process.env.NEXT_PUBLIC_BASE_URL);
    console.log("baseUrl", baseUrl);

    let tokens;
    try {
      const tokenResponse = await client.getToken(code);
      tokens = tokenResponse.tokens;
      if (!tokens || !tokens.id_token) {
        console.error('Google token exchange failed:', tokenResponse);
        return res.status(500).send('Google token exchange failed.');
      }
    } catch (err) {
      console.error('Google getToken error:', err.response?.data || err.message || err);
      return res.status(500).send('Google token exchange failed.');
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