import { AuthService, UsageService } from '../../../lib/auth';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = AuthService.verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const user = await AuthService.getUserById(decoded.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const usage = await UsageService.getUserUsage(decoded.userId);

    res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        subscription_status: user.subscription_status,
        subscription_end_date: user.subscription_end_date,
        usage_count: user.usage_count,
        created_at: user.created_at,
        last_activity: user.last_activity
      },
      usage
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user information' });
  }
} 