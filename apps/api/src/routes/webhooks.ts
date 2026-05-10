import { Router, Request, Response } from 'express';
import { stripeService } from '../services/stripe.service';
import { plaidService } from '../services/plaid.service';
import { wiseService } from '../services/wise.service';

const router: Router = Router();

/**
 * Stripe webhook — requires raw body for signature verification.
 * This route uses express.raw() middleware applied at the server level
 * BEFORE express.json() to preserve the raw request body.
 */
router.post('/stripe', async (req: Request, res: Response) => {
  try {
    const signature = req.headers['stripe-signature'] as string;
    if (!signature) {
      return res.status(400).json({ success: false, message: 'Missing stripe-signature header' });
    }

    // req.body is a Buffer when using express.raw()
    const payload = req.body instanceof Buffer ? req.body.toString() : JSON.stringify(req.body);
    await stripeService.handleWebhook(payload, signature);

    res.json({ received: true });
  } catch (error: any) {
    console.error('Stripe webhook error:', error.message);
    res.status(400).json({ success: false, message: error.message });
  }
});

/**
 * Plaid webhook — standard JSON webhooks.
 */
router.post('/plaid', async (req: Request, res: Response) => {
  try {
    await plaidService.handleWebhook(req.body);
    res.json({ received: true });
  } catch (error: any) {
    console.error('Plaid webhook error:', error.message);
    res.status(400).json({ success: false, message: error.message });
  }
});

/**
 * Wise webhook — standard JSON webhooks with optional signature.
 */
router.post('/wise', async (req: Request, res: Response) => {
  try {
    await wiseService.handleWebhook(req.body);
    res.json({ received: true });
  } catch (error: any) {
    console.error('Wise webhook error:', error.message);
    res.status(400).json({ success: false, message: error.message });
  }
});

export default router;
