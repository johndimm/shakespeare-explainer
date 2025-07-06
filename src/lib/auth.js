import prisma from './db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// User authentication and management
export class AuthService {
  // Create a new user
  static async createUser(email, password) {
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          subscriptionStatus: 'free',
        }
      });
      const token = jwt.sign({ userId: user.id, email }, JWT_SECRET, { expiresIn: '7d' });
      return { user, token };
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  // Login user
  static async loginUser(email, password) {
    try {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) throw new Error('User not found');
      if (!user.password) throw new Error('No password set for this user');
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) throw new Error('Invalid password');
      const token = jwt.sign({ userId: user.id, email }, JWT_SECRET, { expiresIn: '7d' });
      await prisma.user.update({ where: { id: user.id }, data: { updatedAt: new Date() } });
      return { user, token };
    } catch (error) {
      console.error('Error logging in user:', error);
      throw error;
    }
  }

  // Verify JWT token
  static verifyToken(token) {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return null;
    }
  }

  // Get user by ID
  static async getUserById(userId) {
    try {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      return user;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  }

  // Update user subscription
  static async updateSubscription(userId, subscriptionStatus, stripeCustomerId = null) {
    try {
      const updateData = {
        subscriptionStatus,
        updatedAt: new Date()
      };
      if (stripeCustomerId) {
        updateData.stripeCustomerId = stripeCustomerId;
      }
      if (subscriptionStatus === 'premium') {
        updateData.subscriptionEndDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
      }
      const user = await prisma.user.update({ where: { id: userId }, data: updateData });
      return user;
    } catch (error) {
      console.error('Error updating subscription:', error);
      throw error;
    }
  }
}

// Usage tracking and limits
export class UsageService {
  static FREE_TIER_LIMITS = {
    daily_explanations: 3,
    daily_chat_messages: 3,
    file_uploads: 3,
    premium_features: false,
    first_day_limit: 20
  };

  static PREMIUM_TIER_LIMITS = {
    daily_explanations: 100,
    daily_chat_messages: 500,
    file_uploads: 50,
    premium_features: true
  };

  // Check if user can perform action
  static async checkUsageLimit(userId, action) {
    try {
      const user = await AuthService.getUserById(userId);
      if (!user) return { allowed: false, reason: 'User not found' };
      await this.resetMonthlyUsageIfNeeded(user);
      const limits = user.subscriptionStatus === 'premium' ? this.PREMIUM_TIER_LIMITS : this.FREE_TIER_LIMITS;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const userCreatedDate = new Date(user.createdAt);
      userCreatedDate.setHours(0, 0, 0, 0);
      const isFirstDay = today.getTime() === userCreatedDate.getTime();
      const todayUsages = await prisma.usage.findMany({
        where: {
          userId: userId,
          date: { gte: today }
        }
      });
      const totalTodayUsage = todayUsages.reduce((sum, u) => sum + u.count, 0);
      if (user.subscriptionStatus === 'free') {
        const dailyLimit = isFirstDay ? limits.first_day_limit : limits.daily_explanations;
        if (totalTodayUsage >= dailyLimit) {
          return {
            allowed: false,
            reason: isFirstDay ? `First day limit of ${dailyLimit} interactions reached` : `Daily limit of ${dailyLimit} interactions reached`,
            current: totalTodayUsage,
            limit: dailyLimit,
            isFirstDay
          };
        }
      } else {
        // Premium tier - check individual action limits
        const actionUsage = todayUsages.filter(u => u.type === action).reduce((sum, u) => sum + u.count, 0);
        const limit = limits[`daily_${action}`] || limits[action];
        if (actionUsage >= limit) {
          return {
            allowed: false,
            reason: `Daily limit of ${limit} ${action} reached`,
            current: actionUsage,
            limit
          };
        }
      }
      return {
        allowed: true,
        current: totalTodayUsage,
        limit: user.subscriptionStatus === 'free' ? (isFirstDay ? limits.first_day_limit : limits.daily_explanations) : (limits[`daily_${action}`] || limits[action]),
        isFirstDay
      };
    } catch (error) {
      console.error('Error checking usage limit:', error);
      return { allowed: false, reason: 'Error checking usage' };
    }
  }

  // Log usage
  static async logUsage(userId, action, metadata = {}) {
    try {
      await prisma.usage.create({
        data: {
          userId: userId,
          type: action,
          date: new Date(),
          count: 1
        }
      });
      await prisma.user.update({
        where: { id: userId },
        data: { updatedAt: new Date() }
      });
      return true;
    } catch (error) {
      console.error('Error logging usage:', error);
      return false;
    }
  }

  // Reset monthly usage if needed
  static async resetMonthlyUsageIfNeeded(user) {
    // Not implemented: depends on your business logic
    // You can add a monthly usage reset field to the User model if needed
    return;
  }

  // Get user usage statistics
  static async getUserUsage(userId) {
    try {
      const user = await AuthService.getUserById(userId);
      if (!user) return null;
      const limits = user.subscriptionStatus === 'premium' ? this.PREMIUM_TIER_LIMITS : this.FREE_TIER_LIMITS;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const userCreatedDate = new Date(user.createdAt);
      userCreatedDate.setHours(0, 0, 0, 0);
      const isFirstDay = today.getTime() === userCreatedDate.getTime();
      const todayUsages = await prisma.usage.findMany({
        where: {
          userId: userId,
          date: { gte: today }
        }
      });
      const totalTodayUsage = todayUsages.reduce((sum, u) => sum + u.count, 0);
      const dailyLimit = user.subscriptionStatus === 'free' ? (isFirstDay ? limits.first_day_limit : limits.daily_explanations) : limits.daily_explanations;
      const usage = {
        explanations: todayUsages.filter(u => u.type === 'explanations').reduce((sum, u) => sum + u.count, 0),
        chat_messages: todayUsages.filter(u => u.type === 'chat_messages').reduce((sum, u) => sum + u.count, 0),
        file_uploads: todayUsages.filter(u => u.type === 'file_uploads').reduce((sum, u) => sum + u.count, 0),
        total_today: totalTodayUsage,
        total_all_time: 0, // You can implement this if you want
        subscription_status: user.subscriptionStatus,
        daily_limit: dailyLimit,
        is_first_day: isFirstDay,
        limits
      };
      return usage;
    } catch (error) {
      console.error('Error getting user usage:', error);
      return null;
    }
  }
} 