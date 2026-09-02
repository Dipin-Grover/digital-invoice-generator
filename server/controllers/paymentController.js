const Razorpay = require('razorpay');
const crypto = require('crypto');
const Invoice = require('../models/Invoice');

// Initialize Razorpay instance
// We use a try-catch so the server doesn't crash if the keys aren't set yet
let razorpayInstance;
try {
  if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
} catch (error) {
  console.error("Razorpay initialization error:", error);
}

// @desc    Create a Razorpay order
// @route   POST /api/payments/razorpay/order
// @access  Private
const createRazorpayOrder = async (req, res) => {
  const { invoiceId } = req.body;

  if (!razorpayInstance) {
    res.status(500);
    throw new Error('Razorpay is not configured on the server. Missing API keys.');
  }

  if (!invoiceId) {
    res.status(400);
    throw new Error('Invoice ID is required');
  }

  const invoice = await Invoice.findById(invoiceId);

  if (!invoice) {
    res.status(404);
    throw new Error('Invoice not found');
  }

  // Calculate amount in smallest currency unit (paise for INR)
  // Razorpay expects amount in the smallest subunit (e.g., paise, cents)
  // Assuming the invoice total is in the base currency unit (e.g. Rupees)
  const amountInPaise = Math.round(invoice.total * 100);

  const options = {
    amount: amountInPaise,
    currency: invoice.currencyCode || 'INR',
    receipt: `receipt_invoice_${invoice._id}`,
    payment_capture: 1 // Auto capture
  };

  try {
    const order = await razorpayInstance.orders.create(options);
    res.status(200).json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    console.error('Razorpay Error:', error);
    res.status(500);
    throw new Error('Failed to create Razorpay order');
  }
};

// @desc    Verify a Razorpay payment signature
// @route   POST /api/payments/razorpay/verify
// @access  Private
const verifyRazorpayPayment = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, invoiceId } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !invoiceId) {
    res.status(400);
    throw new Error('Missing required payment verification fields');
  }

  const body = razorpay_order_id + "|" + razorpay_payment_id;

  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest('hex');

  const isAuthentic = expectedSignature === razorpay_signature;

  if (isAuthentic) {
    // Payment is successful, update invoice status
    const invoice = await Invoice.findById(invoiceId);
    
    if (invoice) {
      invoice.status = 'paid';
      invoice.paidAt = new Date();
      invoice.locked = true;
      invoice.paidAmount = invoice.total;
      await invoice.save();
    }

    res.status(200).json({ message: 'Payment verified successfully', paymentId: razorpay_payment_id });
  } else {
    res.status(400);
    throw new Error('Invalid payment signature');
  }
};

module.exports = {
  createRazorpayOrder,
  verifyRazorpayPayment
};
