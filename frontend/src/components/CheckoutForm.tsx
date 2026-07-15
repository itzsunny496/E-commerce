import { useState } from 'react';
import api from '@/utils/api';
import { useStore } from '@/store/useStore';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CheckoutForm({ amount }: { amount: number }) {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [succeeded, setSucceeded] = useState(false);
  const cart = useStore(state => state.cart);
  const clearCart = useStore(state => state.clearCart);

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    setProcessing(true);
    setError('');

    const loaded = await loadRazorpayScript();
    if (!loaded) {
      setError('Failed to load Razorpay. Check your internet connection.');
      setProcessing(false);
      return;
    }

    try {
      // Create an order in backend from cart items first
      const orderPayload = {
        items: cart.map(i => ({ product_id: i.id, quantity: i.quantity })),
        total_amount: amount,
        shipping_address: null
      };

      const createOrderRes = await api.post('/api/orders', orderPayload);
      const orderId = createOrderRes.data.data._id;

      const res = await api.post('/api/payment/create-order', { orderId });
      const { razorpayOrderId, amount: orderAmount, currency, keyId } = res.data;

      const options = {
        key: keyId || import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderAmount,
        currency,
        name: 'NextGen E-Commerce',
        description: 'Secure Order Payment',
        image: 'https://ui-avatars.com/api/?name=NG&background=2563eb&color=fff&bold=true&rounded=true',
        order_id: razorpayOrderId,
        handler: async (response: any) => {
          const verifyRes = await api.post('/api/payment/verify', {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });
          if (verifyRes.data.success) {
            setSucceeded(true);
            // clear cart after successful payment
            clearCart();
          } else setError('Payment verification failed.');
        },
        theme: { color: '#2563eb' },
        modal: { ondismiss: () => setProcessing(false) },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (response: any) => {
        setError(`Payment Failed: ${response.error.description}`);
        setProcessing(false);
      });
      rzp.open();
    } catch (err: any) {
      const serverMsg = err.response?.data?.error || err.message;
      const status = err.response?.status;
      if (status === 401) {
        setError('You must be signed in to place an order. Please log in and try again.');
      } else {
        setError(serverMsg ? `${serverMsg}` : 'Could not initiate payment. Ensure backend is running.');
      }
      setProcessing(false);
    }
  };

  if (succeeded) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 text-center space-y-2">
        <div className="text-3xl">🎉</div>
        <p className="text-emerald-700 font-bold text-base">Order Placed Successfully!</p>
        <p className="text-xs text-emerald-600">Thank you for shopping with NextGen. You'll receive a confirmation shortly.</p>
      </div>
    );
  }

  return (
    <div>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-xs px-3 py-2.5 rounded-xl mb-3 font-medium">
          {error}
        </div>
      )}
      <button
        onClick={handlePayment}
        disabled={processing}
        className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md shadow-blue-100 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:translate-y-0 flex items-center justify-center gap-2"
      >
        {processing ? (
          <>
            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            Processing Payment...
          </>
        ) : (
          `⚡ Place Order · ₹${amount.toLocaleString()}`
        )}
      </button>
      <p className="text-center text-[10px] text-slate-400 mt-2 font-medium">🔒 100% Secure · Powered by Razorpay</p>
    </div>
  );
}
