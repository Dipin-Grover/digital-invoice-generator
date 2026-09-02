import { http } from './http';

export function apiCreateRazorpayOrder(token, invoiceId) {
  return http('/api/payments/razorpay/order', {
    token,
    method: 'POST',
    body: { invoiceId },
  });
}

export function apiVerifyRazorpayPayment(token, payload) {
  return http('/api/payments/razorpay/verify', {
    token,
    method: 'POST',
    body: payload,
  });
}
