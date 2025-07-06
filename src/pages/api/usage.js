import jwt from 'jsonwebtoken';
import prisma from '../../lib/db';

export default async function handler(req, res) {
  try {
    const auth = req.headers.authorization;
    if (!auth) return res.status(401).json({ error: 'Unauthorized' });
    const token = auth.replace('Bearer ', '');

    // Decode JWT
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (e) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Use userId from JWT
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user) return res.status(401).json({ error: 'User not found' });

    // Rolling window: 3 explanations per hour
    const now = new Date();
    const windowStart = new Date(now.getTime() - 60 * 60 * 1000); // 1 hour ago
    const usages = await prisma.usage.findMany({
      where: {
        userId: user.id,
        type: 'chat',
        date: { gte: windowStart }
      },
      orderBy: { date: 'asc' }
    });
    const usage = usages.reduce((sum, u) => sum + u.count, 0);

    // Find the earliest usage in the window (for next reset)
    let nextReset = null;
    if (usages.length >= 3) {
      const earliestUsage = usages[0];
      nextReset = new Date(new Date(earliestUsage.date).getTime() + 60 * 60 * 1000);
    }

    res.status(200).json({
      usage,
      nextReset,
      isPremium: user.subscriptionStatus === 'premium'
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
} 