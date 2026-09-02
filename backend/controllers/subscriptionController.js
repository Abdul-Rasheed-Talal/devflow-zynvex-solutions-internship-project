import Stripe from 'stripe';
import User from '../models/User.js';
import env from '../config/env.js';

const stripe = new Stripe(env.stripeSecretKey || 'sk_test_123', {
  apiVersion: '2023-10-16' // Use a stable API version
});

/**
 * @desc    Create Stripe Checkout Session
 * @route   POST /api/subscriptions/checkout
 * @access  Private
 */
export const createCheckoutSession = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Prevent re-subscribing if already Pro
    if (user.subscriptionPlan === 'pro') {
      return res.status(400).json({ message: 'You are already on the Pro plan' });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price: env.stripePriceId || 'price_123', // Set this in .env (e.g. price_1XXXXX)
          quantity: 1,
        },
      ],
      client_reference_id: user._id.toString(),
      success_url: `${env.frontendUrl}/app/settings?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${env.frontendUrl}/app/settings`,
      customer_email: user.email, // pre-fill email
    });

    res.status(200).json({ url: session.url });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Verify Stripe Checkout Session manually (for testing without webhooks)
 * @route   POST /api/subscriptions/verify-session
 * @access  Private
 */
export const verifySession = async (req, res, next) => {
  try {
    const { session_id } = req.body;
    if (!session_id) return res.status(400).json({ message: 'Session ID required' });

    const session = await stripe.checkout.sessions.retrieve(session_id);

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (session.payment_status === 'paid' && session.client_reference_id === user._id.toString()) {
      const updatedUser = await User.findByIdAndUpdate(
        user._id,
        {
          subscriptionPlan: 'pro',
          stripeCustomerId: session.customer,
          stripeSubscriptionId: session.subscription,
        },
        { new: true }
      );
      return res.status(200).json({ success: true, data: updatedUser.toSafeObject() });
    }

    res.status(400).json({ message: 'Payment not successful or verified' });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Handle Stripe Webhooks
 * @route   POST /api/subscriptions/webhook
 * @access  Public (Stripe authenticates via signature)
 */
export const handleStripeWebhook = async (req, res, next) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // req.body must be raw buffer here
    event = stripe.webhooks.constructEvent(req.body, sig, env.stripeWebhookSecret || 'whsec_123');
  } catch (err) {
    console.error('Webhook signature verification failed.', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    // Handle the event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const userId = session.client_reference_id;
      const customerId = session.customer;
      const subscriptionId = session.subscription;

      if (userId) {
        await User.findByIdAndUpdate(userId, {
          subscriptionPlan: 'pro',
          stripeCustomerId: customerId,
          stripeSubscriptionId: subscriptionId
        });
        console.log(`User ${userId} upgraded to Pro plan`);
      }
    } else if (event.type === 'customer.subscription.deleted') {
      // Handle subscription cancellation
      const subscription = event.data.object;
      const customerId = subscription.customer;

      await User.findOneAndUpdate(
        { stripeCustomerId: customerId },
        { 
          subscriptionPlan: 'basic',
          stripeSubscriptionId: null
        }
      );
      console.log(`Customer ${customerId} downgraded to Basic plan`);
    }

    // Return a 200 res to acknowledge receipt of the event
    res.json({ received: true });
  } catch (err) {
    next(err);
  }
};
