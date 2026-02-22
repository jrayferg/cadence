/**
 * stripeService.js
 * Placeholder for future Stripe integration.
 *
 * This file defines the interface that will be implemented when
 * Stripe is connected. Currently all functions return no-ops or
 * mock responses.
 *
 * Integration points:
 * 1. Student creation  → Create Stripe Customer
 * 2. Invoice finalize  → Create Stripe Invoice + send payment link
 * 3. Payment received  → Webhook handler updates invoice status
 * 4. Settings page     → Connect/disconnect Stripe account
 *
 * Stripe Features to leverage:
 * - Subscriptions → For flat monthly: auto-charge monthly
 * - Invoices API  → For per-lesson/variable: generate draft, finalize, send
 * - Payment Links / Hosted Invoice Page → Email secure link → parent pays
 * - Customer Portal → Parents view history, pay outstanding, update card
 * - Webhooks → payment.succeeded → mark invoice as paid
 * - Apple Pay / Google Pay → via Payment Element (auto on supported devices)
 *
 * Implementation Path:
 * MVP: Invoice → Pay Online (generate invoice → Stripe hosted page → webhook)
 * Phase 2: Auto-Charge (Subscriptions for monthly, stored methods for per-lesson)
 * Phase 3: Full Customer Portal (branded self-service)
 */

/**
 * Check if Stripe is configured and enabled.
 * @param {Object} billingSettings
 * @returns {boolean}
 */
export function isStripeEnabled(billingSettings) {
  return billingSettings.stripeEnabled && !!billingSettings.stripeAccountId;
}

/**
 * Placeholder: Create a Stripe Customer for a student.
 * Will be called when a student is created/updated if Stripe is enabled.
 *
 * Maps to: stripe.customers.create({ name, email, metadata: { studentId } })
 *
 * @param {Object} student
 * @returns {Promise<{stripeCustomerId: string}>}
 */
export async function createStripeCustomer(student) {
  // TODO: Implement with Stripe SDK
  // const customer = await stripe.customers.create({
  //   name: student.name,
  //   email: student.isMinor ? student.parentEmail : student.email,
  //   metadata: { cadenceStudentId: student.id },
  // });
  // return { stripeCustomerId: customer.id };
  console.warn('Stripe not yet implemented: createStripeCustomer');
  return { stripeCustomerId: '' };
}

/**
 * Placeholder: Create a Stripe Invoice and get a hosted payment link.
 * Will be called when an invoice is finalized (draft → unpaid).
 *
 * Maps to: stripe.invoices.create + stripe.invoiceItems.create + stripe.invoices.sendInvoice
 *
 * @param {Object} invoice - Cadence invoice object
 * @param {Object} student - Student with stripeCustomerId
 * @returns {Promise<{stripeInvoiceId: string, paymentLink: string}>}
 */
export async function createStripeInvoice(invoice, student) {
  // TODO: Implement with Stripe SDK
  // const stripeInvoice = await stripe.invoices.create({
  //   customer: student.stripeCustomerId,
  //   collection_method: 'send_invoice',
  //   days_until_due: 30,
  // });
  // for (const item of invoice.items) {
  //   await stripe.invoiceItems.create({
  //     customer: student.stripeCustomerId,
  //     invoice: stripeInvoice.id,
  //     description: item.description,
  //     quantity: item.quantity,
  //     unit_amount: Math.round(item.rate * 100),
  //   });
  // }
  // const finalized = await stripe.invoices.sendInvoice(stripeInvoice.id);
  // return { stripeInvoiceId: finalized.id, paymentLink: finalized.hosted_invoice_url };
  console.warn('Stripe not yet implemented: createStripeInvoice');
  return { stripeInvoiceId: '', paymentLink: '' };
}

/**
 * Placeholder: Handle incoming Stripe webhook event.
 * Will process payment confirmations, failures, etc.
 *
 * Key events to handle:
 * - invoice.payment_succeeded → mark invoice as paid
 * - invoice.payment_failed   → send notification
 * - customer.subscription.updated → sync subscription status
 *
 * @param {Object} event - Stripe webhook event
 * @returns {Promise<{action: string, invoiceId: string, amount: number}>}
 */
export async function handleStripeWebhook(event) {
  // TODO: Implement webhook handler
  // const sig = req.headers['stripe-signature'];
  // const event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  // switch (event.type) {
  //   case 'invoice.payment_succeeded':
  //     return { action: 'mark_paid', invoiceId: event.data.object.metadata.cadenceInvoiceId };
  //   case 'invoice.payment_failed':
  //     return { action: 'mark_failed', invoiceId: event.data.object.metadata.cadenceInvoiceId };
  //   default:
  //     return { action: 'none' };
  // }
  console.warn('Stripe not yet implemented: handleStripeWebhook');
  return { action: 'none' };
}

/**
 * Placeholder: Create a subscription for a monthly-billed student.
 * Will be used in Phase 2 for auto-charge recurring billing.
 *
 * @param {Object} student - Student with stripeCustomerId
 * @param {number} monthlyRate - Monthly amount in dollars
 * @returns {Promise<{subscriptionId: string}>}
 */
export async function createSubscription(student, monthlyRate) {
  // TODO: Implement with Stripe SDK
  // const price = await stripe.prices.create({
  //   unit_amount: Math.round(monthlyRate * 100),
  //   currency: 'usd',
  //   recurring: { interval: 'month' },
  //   product_data: { name: `Monthly Tuition - ${student.name}` },
  // });
  // const subscription = await stripe.subscriptions.create({
  //   customer: student.stripeCustomerId,
  //   items: [{ price: price.id }],
  // });
  // return { subscriptionId: subscription.id };
  console.warn('Stripe not yet implemented: createSubscription');
  return { subscriptionId: '' };
}
