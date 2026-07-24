import { useStore } from '@/store/useStore';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import CheckoutForm from '@/components/CheckoutForm';
import { useState } from 'react';

export default function Cart() {
  const globalCart = useStore(state => state.cart);
  const removeFromGlobalCart = useStore(state => state.removeFromCart);
  const updateGlobalQuantity = useStore(state => state.updateQuantity);
  const clearGlobalCart = useStore(state => state.clearCart);
  const user = useStore(state => state.user);
  const navigate = useNavigate();
  const location = useLocation();

  const isBuyNow = !!location.state?.buyNowItem;
  const [localCart, setLocalCart] = useState(
    isBuyNow ? [{ ...location.state.buyNowItem, quantity: 1 }] : []
  );

  const cart = isBuyNow ? localCart : globalCart;

  const removeFromCart = (id: string) => {
    if (isBuyNow) setLocalCart([]);
    else removeFromGlobalCart(id);
  };

  const updateQuantity = (id: string, qty: number) => {
    if (isBuyNow) {
      if (qty <= 0) setLocalCart([]);
      else setLocalCart(localCart.map(i => i.id === id ? { ...i, quantity: qty } : i));
    } else {
      updateGlobalQuantity(id, qty);
    }
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = Math.round(subtotal * 0.12);
  const delivery = subtotal > 499 ? 0 : 40;
  const finalAmount = subtotal - discount + delivery;

  return (
    <div className="max-w-[1200px] mx-auto px-4 md:px-0 py-6">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-400 mb-6 font-medium">
        <Link to="/" className="hover:text-blue-600">Home</Link>
        <span>/</span>
        <span className="text-slate-600">Shopping Cart</span>
      </div>

      {cart.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center max-w-lg mx-auto space-y-5">
          <div className="text-6xl">🛒</div>
          <h2 className="text-lg font-bold text-slate-800">Your cart is empty!</h2>
          <p className="text-sm text-slate-400">Looks like you haven't added anything to your cart yet.</p>
          <Link to="/products" className="inline-block bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-8 py-3 rounded-xl transition-all shadow-md shadow-blue-100">
            Shop Catalogue
          </Link>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-6">

          {/* Cart Items */}
          <div className="flex-1 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <h2 className="font-bold text-slate-800">Shopping Cart ({cart.length} item{cart.length > 1 ? 's' : ''})</h2>
                <span className="text-xs text-blue-600 font-bold bg-blue-50 px-2.5 py-1 rounded-lg">Secure Checkout ✓</span>
              </div>

              <div className="divide-y divide-slate-100">
                {cart.map(item => (
                  <div key={item.id} className="p-5 flex gap-4 hover:bg-slate-50/30 transition-colors">
                    {/* Image */}
                    <Link to={`/products/${item.id}`} className="w-24 h-24 bg-slate-50 rounded-xl flex items-center justify-center shrink-0 border border-slate-100 overflow-hidden hover:opacity-80 transition-opacity">
                      {item.image
                        ? <img src={item.image} alt={item.title} className="w-full h-full object-contain mix-blend-multiply p-1" />
                        : <span className="text-3xl">📦</span>}
                    </Link>

                    {/* Info */}
                    <div className="flex-1 min-w-0 space-y-2">
                      <Link to={`/products/${item.id}`}>
                        <h3 className="text-sm font-bold text-slate-800 line-clamp-2 hover:text-blue-600 transition-colors">{item.title}</h3>
                      </Link>
                      <div className="flex items-baseline gap-2">
                        <span className="text-lg font-black text-slate-800">₹{(item.price * item.quantity).toLocaleString()}</span>
                        <span className="text-xs text-slate-400">₹{item.price.toLocaleString()} each</span>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-3">
                        <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 font-bold text-lg leading-none transition-colors"
                          >−</button>
                          <span className="px-3 py-1.5 text-sm font-bold text-slate-800 min-w-[32px] text-center border-x border-slate-200">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 font-bold text-lg leading-none transition-colors"
                          >+</button>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-xs text-red-500 font-semibold hover:underline"
                        >Remove</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-between">
                <Link to="/products" className="text-blue-600 hover:text-blue-700 text-xs font-semibold flex items-center gap-1">
                  ← Continue Shopping
                </Link>
                <span className="text-xs text-slate-400">Easy 7-day returns</span>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="w-full lg:w-[380px] shrink-0">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 sticky top-24 space-y-5">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400 pb-3 border-b border-slate-100">Order Summary</h3>

              <div className="space-y-3 text-sm text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal ({cart.reduce((s, i) => s + i.quantity, 0)} items)</span>
                  <span className="font-semibold text-slate-800">₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Member Discount (12%)</span>
                  <span className="font-bold text-emerald-600">− ₹{discount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery</span>
                  {delivery === 0
                    ? <span className="font-bold text-emerald-600">FREE</span>
                    : <span className="font-semibold text-slate-800">₹{delivery}</span>}
                </div>
                <div className="border-t border-dashed border-slate-200 pt-4 flex justify-between font-black text-base text-slate-800">
                  <span>Total</span>
                  <span>₹{finalAmount.toLocaleString()}</span>
                </div>
              </div>

              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-center">
                <p className="text-xs font-bold text-emerald-700">✓ You save ₹{discount.toLocaleString()} on this order</p>
              </div>

              {!user ? (
                <button
                  onClick={() => navigate('/login')}
                  className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm rounded-xl shadow-md shadow-orange-100 transition-all hover:-translate-y-0.5"
                >
                  Sign In to Checkout
                </button>
              ) : (
                <CheckoutForm amount={finalAmount} items={cart} onSuccess={() => { if (!isBuyNow) clearGlobalCart(); }} />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
