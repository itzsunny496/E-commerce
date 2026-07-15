import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '@/utils/api';
import { useStore } from '@/store/useStore';

type Tab = 'orders' | 'wishlist' | 'profile';

const DELIVERY_STEPS = ['processing', 'shipped', 'delivered'];

const STATUS_COLOR: Record<string, string> = {
  processing: 'bg-yellow-100 text-yellow-700',
  shipped: 'bg-blue-100 text-blue-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-600',
  completed: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  failed: 'bg-red-100 text-red-600',
};

// ─── My Orders ───────────────────────────────
function MyOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/orders/myorders')
      .then(res => setOrders(res.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-center text-slate-400 text-sm">Loading your orders...</div>;

  if (orders.length === 0) return (
    <div className="p-16 text-center text-slate-400 space-y-3">
      <div className="text-5xl">📦</div>
      <p className="font-semibold">No orders yet.</p>
      <Link to="/products" className="text-blue-600 text-sm font-semibold hover:underline">Start Shopping →</Link>
    </div>
  );

  return (
    <div className="space-y-4">
      {orders.map(order => {
        const stepIdx = DELIVERY_STEPS.indexOf(order.delivery_status);
        const isCancelled = order.delivery_status === 'cancelled';
        return (
          <div key={order._id} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            {/* Order header */}
            <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-slate-500">
                <span className="font-mono font-semibold text-slate-700">#{order._id.slice(-10).toUpperCase()}</span>
                <span className="mx-2">·</span>
                <span>{new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2.5 py-1 rounded-full font-semibold capitalize ${STATUS_COLOR[order.payment_status] || 'bg-slate-100 text-slate-600'}`}>
                  {order.payment_status}
                </span>
                <span className={`text-xs px-2.5 py-1 rounded-full font-semibold capitalize ${STATUS_COLOR[order.delivery_status] || 'bg-slate-100 text-slate-600'}`}>
                  {order.delivery_status}
                </span>
              </div>
            </div>

            {/* Products */}
            <div className="divide-y divide-slate-100">
              {(order.product_ids || []).map((product: any, i: number) => (
                <div key={i} className="px-5 py-4 flex items-center gap-4">
                  <div className="w-14 h-14 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 overflow-hidden">
                    {product.images?.[0]
                      ? <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover" />
                      : <span className="text-2xl">📦</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 text-sm truncate">{product.title || 'Product'}</p>
                    <p className="text-xs text-slate-400 mt-0.5">₹{product.price?.toLocaleString()}</p>
                  </div>
                  <Link to={`/products/${product._id}`} className="text-xs text-blue-600 font-semibold hover:underline shrink-0">View</Link>
                </div>
              ))}
            </div>

            {/* Delivery timeline */}
            {!isCancelled && (
              <div className="px-5 py-4 border-t border-slate-100">
                <div className="flex items-center gap-0">
                  {DELIVERY_STEPS.map((step, i) => (
                    <div key={step} className="flex items-center flex-1 last:flex-none">
                      <div className="flex flex-col items-center gap-1">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 ${i <= stepIdx ? 'bg-green-500 border-green-500 text-white' : 'bg-white border-slate-200 text-slate-400'}`}>
                          {i <= stepIdx ? '✓' : i + 1}
                        </div>
                        <span className={`text-[10px] font-semibold capitalize ${i <= stepIdx ? 'text-green-600' : 'text-slate-400'}`}>{step}</span>
                      </div>
                      {i < DELIVERY_STEPS.length - 1 && (
                        <div className={`flex-1 h-0.5 mx-1 mb-4 ${i < stepIdx ? 'bg-green-400' : 'bg-slate-200'}`} />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
              <span className="text-xs text-slate-500">{order.product_ids?.length || 0} item(s)</span>
              <span className="font-bold text-slate-800 text-sm">₹{order.total_amount?.toLocaleString()}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Wishlist ────────────────────────────────
function Wishlist() {
  const wishlist = useStore(state => state.wishlist);
  const toggleWishlist = useStore(state => state.toggleWishlist);
  const addToCart = useStore(state => state.addToCart);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (wishlist.length === 0) { setLoading(false); return; }
    Promise.all(wishlist.map(id =>
      api.get(`/api/products/${id}`).then(r => r.data.data).catch(() => null)
    )).then(results => setProducts(results.filter(Boolean)))
      .finally(() => setLoading(false));
  }, [wishlist]);

  if (loading) return <div className="p-8 text-center text-slate-400 text-sm">Loading wishlist...</div>;

  if (wishlist.length === 0) return (
    <div className="p-16 text-center text-slate-400 space-y-3">
      <div className="text-5xl">❤️</div>
      <p className="font-semibold">Your wishlist is empty.</p>
      <Link to="/products" className="text-blue-600 text-sm font-semibold hover:underline">Browse Products →</Link>
    </div>
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {products.map(p => (
        <div key={p._id} className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
          <Link to={`/products/${p._id}`}>
            <div className="aspect-square bg-slate-50 flex items-center justify-center p-4 border-b border-slate-100">
              {p.images?.[0]
                ? <img src={p.images[0]} alt={p.title} className="max-h-full max-w-full object-contain mix-blend-multiply" />
                : <span className="text-5xl text-slate-200">📦</span>}
            </div>
          </Link>
          <div className="p-4 space-y-3">
            <Link to={`/products/${p._id}`}>
              <h3 className="font-semibold text-slate-800 text-sm line-clamp-2 hover:text-blue-600 transition-colors">{p.title}</h3>
            </Link>
            <p className="font-bold text-slate-800">₹{p.price?.toLocaleString()}</p>
            <div className="flex gap-2">
              <button
                onClick={() => addToCart({ id: p._id, title: p.title, price: p.price, image: p.images?.[0] || '' })}
                className="flex-1 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-lg transition-colors"
              >
                Add to Cart
              </button>
              <button
                onClick={() => toggleWishlist(p._id)}
                className="px-3 py-2 text-red-500 hover:bg-red-50 rounded-lg border border-red-100 transition-colors text-sm"
                title="Remove from wishlist"
              >
                🗑️
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Profile ─────────────────────────────────
function Profile({ user }: { user: any }) {
  const setUser = useStore(state => state.setUser);
  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '', password: '', confirmPassword: '' });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(''); setError('');
    if (form.password && form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setSaving(true);
    try {
      const payload: any = { name: form.name, email: form.email };
      if (form.password) payload.password = form.password;
      const res = await api.put('/api/auth/me', payload);
      if (res.data.success) {
        setUser({ ...user, name: form.name, email: form.email });
        setSuccess('Profile updated successfully!');
        setForm(f => ({ ...f, password: '', confirmPassword: '' }));
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-lg">
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
        {success && <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-lg font-medium">{success}</div>}
        {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg font-medium">{error}</div>}

        <form onSubmit={handleSave} className="space-y-4">
          {[
            { label: 'Full Name', name: 'name', type: 'text' },
            { label: 'Email Address', name: 'email', type: 'email' },
          ].map(f => (
            <div key={f.name}>
              <label className="block text-sm font-medium text-slate-600 mb-1">{f.label}</label>
              <input name={f.name} type={f.type} value={(form as any)[f.name]} onChange={handleChange} required
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
            </div>
          ))}

          <div className="pt-3 border-t border-slate-100">
            <p className="text-sm font-semibold text-slate-700 mb-3">Change Password <span className="text-slate-400 font-normal text-xs">(leave blank to keep current)</span></p>
            <div className="space-y-3">
              {[
                { label: 'New Password', name: 'password' },
                { label: 'Confirm Password', name: 'confirmPassword' },
              ].map(f => (
                <div key={f.name}>
                  <label className="block text-sm font-medium text-slate-600 mb-1">{f.label}</label>
                  <input name={f.name} type="password" value={(form as any)[f.name]} onChange={handleChange}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <button type="submit" disabled={saving}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow transition-all hover:-translate-y-0.5 disabled:opacity-50">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main User Dashboard ─────────────────────
const NAV: { id: Tab; label: string; icon: string }[] = [
  { id: 'orders', label: 'My Orders', icon: '📦' },
  { id: 'wishlist', label: 'Wishlist', icon: '❤️' },
  { id: 'profile', label: 'Profile', icon: '👤' },
];

export default function UserDashboard({ initialTab = 'orders' }: { initialTab?: Tab }) {
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);
  const user = useStore(state => state.user);
  const wishlist = useStore(state => state.wishlist);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);

  if (!user) return null;

  return (
    <div className="max-w-[1100px] mx-auto px-4 md:px-0 py-8">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <aside className="md:w-60 shrink-0">
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            {/* User card */}
            <div className="p-5 bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-xl font-bold mb-3">
                {user.name?.[0]?.toUpperCase()}
              </div>
              <p className="font-bold text-sm">{user.name}</p>
              <p className="text-xs text-blue-200 truncate">{user.email}</p>
            </div>
            <nav className="p-2">
              {NAV.map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === item.id ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  <span>{item.icon}</span>
                  {item.label}
                  {item.id === 'wishlist' && wishlist.length > 0 && (
                    <span className="ml-auto bg-rose-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">{wishlist.length}</span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Content */}
        <main className="flex-1">
          <h1 className="text-xl font-bold text-slate-800 mb-4">
            {NAV.find(n => n.id === activeTab)?.icon} {NAV.find(n => n.id === activeTab)?.label}
          </h1>
          {activeTab === 'orders' && <MyOrders />}
          {activeTab === 'wishlist' && <Wishlist />}
          {activeTab === 'profile' && <Profile user={user} />}
        </main>
      </div>
    </div>
  );
}
