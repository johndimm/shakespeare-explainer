# Freemium Setup Guide for Shakespeare Explainer

This guide will help you implement the freemium system for your Shakespeare Explainer app hosted on Vercel.

## Overview

The freemium system includes:
- **Free Tier**: 20 interactions on first day, 3 per day after
- **Premium Tier**: 100 explanations/day, 500 chat messages/day, 50 file uploads/day
- User authentication with JWT tokens
- Usage tracking and limits
- Stripe payment integration
- Supabase database for user management

## Prerequisites

1. **Supabase Account**: For database and user management
2. **Stripe Account**: For payment processing
3. **Vercel Account**: For hosting (you already have this)

## Step 1: Set up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Once created, go to Settings > API to get your project URL and anon key
3. In the SQL Editor, run the following SQL to create the required tables:

```sql
-- Create users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  subscription_status VARCHAR DEFAULT 'free',
  subscription_end_date TIMESTAMP WITH TIME ZONE,
  stripe_customer_id VARCHAR,
  usage_count INTEGER DEFAULT 0,
  monthly_usage_reset TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create usage_logs table
CREATE TABLE usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  action VARCHAR NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB
);

-- Create index for better performance
CREATE INDEX idx_usage_logs_user_action_date ON usage_logs(user_id, action, created_at);
```

## Step 2: Set up Stripe

1. Go to [stripe.com](https://stripe.com) and create an account
2. In the Stripe Dashboard, go to Products > Add Product
3. Create a recurring price:
   - Name: "Shakespeare Explainer Premium"
   - Price: $9.99/month
   - Billing: Monthly
4. Copy the Price ID (starts with `price_`)
5. Go to Developers > API Keys and copy your Secret Key
6. Go to Developers > Webhooks and create a new endpoint:
   - URL: `https://your-domain.vercel.app/api/payments/webhook`
   - Events to send: Select all events
   - Copy the webhook signing secret

## Step 3: Environment Variables

Create a `.env.local` file in your project root with the following variables:

```env
# OpenAI API Key (you already have this)
OPENAI_API_KEY=your_openai_api_key_here

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# JWT Secret (generate a secure random string)
JWT_SECRET=your_jwt_secret_here

# Stripe Configuration
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
STRIPE_PRICE_ID=your_stripe_price_id_for_monthly_subscription

# App Configuration
NEXT_PUBLIC_BASE_URL=https://your-domain.vercel.app
```

## Step 4: Install Dependencies

Run the following command to install the new dependencies:

```bash
npm install
```

## Step 5: Update Your Main App

You'll need to integrate the authentication and usage tracking into your main app. Here are the key changes needed:

### 1. Add Authentication State

In your main `index.js`, add authentication state:

```javascript
const [user, setUser] = useState(null);
const [showAuthModal, setShowAuthModal] = useState(false);

useEffect(() => {
  const token = localStorage.getItem('authToken');
  const userData = localStorage.getItem('user');
  
  if (token && userData) {
    setUser(JSON.parse(userData));
  }
}, []);
```

### 2. Add Authentication Header

Update your API calls to include the authentication header:

```javascript
const token = localStorage.getItem('authToken');
const response = await fetch('/api/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({ messages, responseLanguage, myLanguage })
});
```

### 3. Handle Usage Limits

Add error handling for usage limits:

```javascript
if (response.status === 429) {
  const errorData = await response.json();
  // Show upgrade prompt or usage limit message
  setChatMessages(prev => [...prev, { 
    role: 'system', 
    content: `Usage limit reached: ${errorData.error}. Please upgrade to Premium for unlimited access.` 
  }]);
  return;
}
```

### 4. Add Usage Display Component

Import and add the UsageDisplay component to show current usage:

```javascript
import UsageDisplay from '../components/UsageDisplay';

// In your JSX
{user && <UsageDisplay user={user} />}
```

### 5. Add Authentication Modal

Import and add the AuthModal component:

```javascript
import AuthModal from '../components/AuthModal';

// In your JSX
<AuthModal 
  isOpen={showAuthModal} 
  onClose={() => setShowAuthModal(false)}
  onAuthSuccess={(data) => {
    setUser(data.user);
    setShowAuthModal(false);
  }}
/>
```

## Step 6: Deploy to Vercel

1. Push your changes to GitHub
2. In your Vercel dashboard, add the environment variables
3. Deploy the application

## Step 7: Test the System

1. **Test Free Tier**:
   - Create a new account
   - Try to use more than 20 interactions on the first day
   - Verify the limit is enforced

2. **Test Premium Tier**:
   - Upgrade to premium through Stripe
   - Verify higher limits are applied
   - Test subscription cancellation

3. **Test Authentication**:
   - Verify login/logout works
   - Check that tokens are stored properly
   - Test session persistence

## Usage Limits Summary

### Free Tier
- **First Day**: 20 total interactions
- **Subsequent Days**: 3 interactions per day
- **Features**: All basic features included

### Premium Tier ($9.99/month)
- **Explanations**: 100 per day
- **Chat Messages**: 500 per day
- **File Uploads**: 50 per day
- **Features**: All features + priority support

## Monitoring and Analytics

The system automatically tracks:
- User registrations and logins
- Daily usage by action type
- Subscription conversions
- Payment success/failure rates

You can view this data in your Supabase dashboard under the `users` and `usage_logs` tables.

## Troubleshooting

### Common Issues

1. **Database Connection Errors**: Verify your Supabase credentials
2. **Stripe Webhook Failures**: Check webhook URL and secret
3. **Authentication Errors**: Verify JWT_SECRET is set correctly
4. **Usage Not Tracking**: Check that API calls include Authorization header

### Support

For issues with:
- **Supabase**: Check their documentation and support
- **Stripe**: Use their developer documentation
- **Vercel**: Check their deployment logs

## Security Considerations

1. **JWT Secret**: Use a strong, random secret
2. **Environment Variables**: Never commit `.env.local` to version control
3. **API Keys**: Rotate keys regularly
4. **Rate Limiting**: Consider adding rate limiting to prevent abuse

## Next Steps

After implementation, consider:
1. Adding email notifications for usage limits
2. Implementing referral system
3. Adding analytics dashboard
4. Creating admin panel for user management
5. Adding subscription management features 