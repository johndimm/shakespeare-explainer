import Stripe from 'stripe';
import { AuthService } from '../../../lib/auth';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        await handleCheckoutCompleted(session);
        break;
        
      case 'customer.subscription.created':
        const subscription = event.data.object;
        await handleSubscriptionCreated(subscription);
        break;
        
      case 'customer.subscription.updated':
        const updatedSubscription = event.data.object;
        await handleSubscriptionUpdated(updatedSubscription);
        break;
        
      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object;
        await handleSubscriptionDeleted(deletedSubscription);
        break;
        
      case 'invoice.payment_succeeded':
        const invoice = event.data.object;
        await handlePaymentSucceeded(invoice);
        break;
        
      case 'invoice.payment_failed':
        const failedInvoice = event.data.object;
        await handlePaymentFailed(failedInvoice);
        break;
        
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
}

async function handleCheckoutCompleted(session) {
  const userId = session.metadata?.user_id;
  if (userId) {
    await AuthService.updateSubscription(userId, 'premium');
  }
}

async function handleSubscriptionCreated(subscription) {
  const customerId = subscription.customer;
  const { data: user } = await supabase
    .from('users')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single();
    
  if (user) {
    await AuthService.updateSubscription(user.id, 'premium');
  }
}

async function handleSubscriptionUpdated(subscription) {
  const customerId = subscription.customer;
  const { data: user } = await supabase
    .from('users')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single();
    
  if (user) {
    const status = subscription.status === 'active' ? 'premium' : 'free';
    await AuthService.updateSubscription(user.id, status);
  }
}

async function handleSubscriptionDeleted(subscription) {
  const customerId = subscription.customer;
  const { data: user } = await supabase
    .from('users')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single();
    
  if (user) {
    await AuthService.updateSubscription(user.id, 'free');
  }
}

async function handlePaymentSucceeded(invoice) {
  const customerId = invoice.customer;
  const { data: user } = await supabase
    .from('users')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single();
    
  if (user) {
    await AuthService.updateSubscription(user.id, 'premium');
  }
}

async function handlePaymentFailed(invoice) {
  const customerId = invoice.customer;
  const { data: user } = await supabase
    .from('users')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single();
    
  if (user) {
    await AuthService.updateSubscription(user.id, 'free');
  }
} 