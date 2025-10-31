// This is your test secret API key.
const stripe = require('stripe')('sk_test_51SMogu1JJ8VkV6VedNk63vYEBrZRUsR1P1sxHEQ9F92ku5GUlgPlZw9tHlpOUZM1hmWxUTwstTQHbZKFEY85gQVH00jrB4j8nU');
const express = require('express');
const router = express.Router();
const users = require("../models/user-models");

const YOUR_DOMAIN = "http://localhost:3000/";

// Subscriptions page
router.get("/", async (req, res) => {
    try {
        res.status(200).render("stripe/checkout")
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Success page
router.get("/success", async (req, res) => {
    try {
        //res.status(200).render("stripe/success")
        res.status(200).send("Success!");
    } catch (error) {
        res.status(500).send(error.message);
    }
});

router.post('/create-checkout-session', async (req, res) => {
  const prices = await stripe.prices.list({
    lookup_keys: [req.body.lookup_key],
    expand: ['data.product'],
  });
  const session = await stripe.checkout.sessions.create({
    billing_address_collection: 'auto',
    line_items: [
      {
        price: prices.data[0].id,
        // For usage-based billing, don't pass quantity
        quantity: 1,

      },
    ],
    mode: 'subscription',
    success_url: `${YOUR_DOMAIN}/subscriptions/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${YOUR_DOMAIN}/subscriptions/`,
  });

  res.redirect(303, session.url);
});

router.post('/create-portal-session', async (req, res) => {
  // For demonstration purposes, we're using the Checkout session to retrieve the customer ID.
  // Typically this is stored alongside the authenticated user in your database.
  const { session_id } = req.body;
  const checkoutSession = await stripe.checkout.sessions.retrieve(session_id);

  // This is the url to which the customer will be redirected when they're done
  // managing their billing with the portal.
  const returnUrl = YOUR_DOMAIN;

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: checkoutSession.customer,
    return_url: returnUrl,
  });

  res.redirect(303, portalSession.url);
});

router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  (req, res) => {
    let event = req.body;
    // Replace this endpoint secret with your endpoint's unique secret
    // If you are testing with the CLI, find the secret by running 'stripe listen'
    // If you are using an endpoint defined with the API or dashboard, look in your webhook settings
    // at https://dashboard.stripe.com/webhooks
    //const endpointSecret = 'whsec_12345';
    const endpointSecret = 'whsec_bc0d50a1914efad5d0b914f4379919e0ca1aeba989910ea1c5c764ba5f4f6406';
    // Only verify the event if you have an endpoint secret defined.
    // Otherwise use the basic event deserialized with JSON.parse
    if (endpointSecret) {
      // Get the signature sent by Stripe
      const signature = req.headers['stripe-signature'];
      try {
        event = stripe.webhooks.constructEvent(
          req.body,
          signature,
          endpointSecret
        );
      } catch (err) {
        console.error(`⚠️  Webhook signature verification failed.`, err.message);
        return res.sendStatus(400);
      }
    }
    let subscription;
    let invoice;

    // Handle the event
    switch (event.type) {
      // Customer created
      case 'customer.created':
        console.log("Customer created");
        handleCustomerCreated(event.data.object.customer);
        break;
      // Customer subscriptione nding soon
      case 'customer.subscription.trial_will_end':
        subscription = event.data.object;
        console.log("Customer subscription trial will end soon for ", subscription.customer);
        handleSubscriptionTrialEnding(subscription);
        break;
      // Customer subscription ended
      case 'customer.subscription.deleted':
        subscription = event.data.object;
        console.log("Subscription deleted for", subscription.customer);
        handleSubscriptionDeleted(subscription);
        break;
      // Customer subsctiption created
      case 'customer.subscription.created':
        subscription = event.data.object;
        console.log("Subscription created for", subscription.customer);
        handleSubscriptionUpdate(subscription);
        break;
      // Customer subsctiption updated
      case 'customer.subscription.updated':
        subscription = event.data.object;
        console.log("Subscription updated for", subscription.customer);
        handleSubscriptionUpdate(subscription);
        break;
      // Invoice payment succedded
      case 'invoice.payment_succeeded':
        invoice = event.data.object;
        console.log("Invoice payment succeeded for", invoice.customer);
        handleSuccessfulPayment(invoice);
        break;
      // Invoice payment failed
      case 'invoice.payment_failed':
        invoice = event.data.object;
        console.log("Invoice payment failed for", invoice.customer);
        handleFailedPayment(invoice);
        break;
      case 'entitlements.active_entitlement_summary.updated':
        subscription = event.data.object;
        console.log(`Active entitlement summary updated for ${subscription}.`);
        // Then define and call a method to handle active entitlement summary updated
        // await handleEntitlementUpdated(subscription);
        break;
      default:
        // Unexpected event type
        console.log(`Unhandled event type ${event.type}.`);
    }
    // Return a 200 response to acknowledge receipt of the event
    res.send();
  }
);

// Helper Functions
// Creates a new stripe customer. Retunrs customer ID. 
// Called from within auth sign up process. 
async function createCustomer(email) {
  try {
    const customer = await stripe.customers.create({
      email: email
    });

    return customer.id
  } catch (error) {
      console.log(`Stripe customer creation failure:`, error.message);
      throw error;
  }
};

// Sends a welcome email to new customer. New user db record is created via ClientBase signup process. 
async function handleCustomerCreated(customerId) {
  // Send welcome email
};

// Updates user records when subscription is created or updated
async function handleSubscriptionUpdate(subscription) {
  // Subscription details
  const customerId = subscription.customer;
  //const customerId = "test";
  const subId = subscription.id;
  const startDate = new Date(subscription.items.data[0].current_period_start * 1000);
  const endDate = new Date(subscription.items.data[0].current_period_end * 1000);
  const nextBillingDate = endDate;
  const status = subscription.status;

  // Product details
  const productId = subscription.items.data[0].price.product;
  const product = await stripe.products.retrieve(productId);

  await users.createSubscription(customerId, subId, product.name, startDate, endDate, nextBillingDate, status);
};

// Updates user records when subscription has ended. 
// Send deletion email to user
async function handleSubscriptionDeleted(subscription) {
  const customerId = subscription.customer;
  const status = subscription.status;

  await users.deleteSubscription(customerId, status);
  // Send deletion email
};

// Updates user records for successful payment
// Send succeessful payment email
async function handleSuccessfulPayment(invoice) {
  // Send email
  await users.setSuccessfulPayment(invoice.customer);
};

// Updates user records for failed payment
// Send failed payment email
async function handleFailedPayment(invoice) {
  // Send email
  await users.setFailedPayment("test");
}

module.exports = {
  router,
  createCustomer
};