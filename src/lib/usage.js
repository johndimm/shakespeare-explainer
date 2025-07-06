import prisma from './db';

export class UsageService {
  static async checkUsageLimit(userId, type = 'chat') {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Get user's subscription status
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Get today's usage
      const todayUsage = await prisma.usage.findFirst({
        where: {
          userId,
          type,
          date: {
            gte: today,
            lt: tomorrow
          }
        }
      });

      const currentUsage = todayUsage ? todayUsage.count : 0;

      // Define limits based on subscription
      let dailyLimit;
      if (user.subscriptionStatus === 'premium') {
        dailyLimit = 100; // Premium users get 100 interactions per day
      } else {
        // Free tier: 20 first day, 3 per day thereafter
        const isFirstDay = user.createdAt.toDateString() === today.toDateString();
        dailyLimit = isFirstDay ? 20 : 3;
      }

      return {
        currentUsage,
        dailyLimit,
        remaining: Math.max(0, dailyLimit - currentUsage),
        canUse: currentUsage < dailyLimit,
        subscriptionStatus: user.subscriptionStatus
      };
    } catch (error) {
      console.error('Error checking usage limit:', error);
      throw error;
    }
  }

  static async recordUsage(userId, type = 'chat') {
    try {
      // Always create a new usage record for each explanation (rolling window model)
      await prisma.usage.create({
        data: {
          userId,
          type,
          count: 1,
          date: new Date()
        }
      });
      console.log(`Usage recorded for user ${userId}, type: ${type}`);
    } catch (error) {
      console.error('Error recording usage:', error);
      throw error;
    }
  }

  static async getUserStats(userId) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          usage: {
            orderBy: { date: 'desc' },
            take: 30 // Last 30 days
          }
        }
      });

      if (!user) {
        throw new Error('User not found');
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const todayUsage = user.usage.find(u => 
        u.date >= today && u.date < tomorrow
      );

      const totalUsage = user.usage.reduce((sum, u) => sum + u.count, 0);

      return {
        subscriptionStatus: user.subscriptionStatus,
        todayUsage: todayUsage ? todayUsage.count : 0,
        totalUsage,
        usageHistory: user.usage
      };
    } catch (error) {
      console.error('Error getting user stats:', error);
      throw error;
    }
  }
} 