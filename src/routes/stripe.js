// This is your test secret API key.
const stripe = require('stripe')('sk_test_51SMogu1JJ8VkV6VedNk63vYEBrZRUsR1P1sxHEQ9F92ku5GUlgPlZw9tHlpOUZM1hmWxUTwstTQHbZKFEY85gQVH00jrB4j8nU');
const express = require('express');
const router = express.Router();
// const app = express();
// app.use(express.static('public'));
// app.use(express.urlencoded({ extended: true }));
// app.use(express.json());

const YOUR_DOMAIN = "http://localhost:3000/subscriptions";

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
    success_url: `${YOUR_DOMAIN}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${YOUR_DOMAIN}/`,
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
  (request, response) => {
    let event = request.body;
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
      const signature = request.headers['stripe-signature'];
      try {
        event = stripe.webhooks.constructEvent(
          request.body,
          signature,
          endpointSecret
        );
      } catch (err) {
        console.log(`⚠️  Webhook signature verification failed.`, err.message);
        return response.sendStatus(400);
      }
    }
    let subscription;
    let status;
    // Handle the event
    switch (event.type) {
      case 'customer.subscription.trial_will_end':
        subscription = event.data.object;
        status = subscription.status;
        console.log(`Subscription status is ${status}.`);
        // Then define and call a method to handle the subscription trial ending. (Email auto payment reminder)
        // await handleSubscriptionTrialEnding(subscription);
        break;
      case 'customer.subscription.deleted':
        subscription = event.data.object;
        status = subscription.status;
        console.log(`Subscription status is ${status}.`);
        // Then define and call a method to handle the subscription deleted.  Remove access to paid content
        // await handleSubscriptionDeleted(subscriptionDeleted);
        break;
      case 'customer.subscription.created':
        subscription = event.data.object;
        status = subscription.status;
        console.log(`Subscription status is ${status}.`);
        // Then define and call a method to handle the subscription created.
        handleSubscriptionCreated(subscription);
        break;
      case 'customer.subscription.updated':
        subscription = event.data.object;
        status = subscription.status;
        console.log(`Subscription status is ${status}.`);
        // Then define and call a method to handle the subscription update.
        // await handleSubscriptionUpdated(subscription);
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
    response.send();
  }
);

// Helper Functions
async function handleSubscriptionCreated(subscription) {
  // Update user subscription status in database to 'active'
  console.log("In handler");
};

module.exports = router;