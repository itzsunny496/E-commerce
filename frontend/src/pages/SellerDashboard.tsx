import { useState, useEffect, useCallback } from 'react';
import api from '@/utils/api';
import { useStore } from '@/store/useStore';
import { useNavigate } from 'react-router-dom';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
type Tab = 'overview' | 'products' | 'orders' | 'reviews' | 'profile';

const STATUS_COLORS: Record<string, string> = {
  processing: 'bg-yellow-100 text-yellow-700',
  shipped: 'bg-blue-100 text-blue-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

const STAR = (n: number, rating: number) =>
  n <= Math.round(rating) ? '★' : '☆';

// ─────────────────────────────────────────────
// Overview Sub-component
// ─────────────────────────────────────────────
function SellerOverview({ products, orders }: { products: any[]; orders: any[] }) {
  const totalRevenue = orders
    .filter(o => o.payment_status === 'completed')
    .reduce((sum, o) => sum + o.total_amount, 0);

  const lowStock = products.filter(p => p.stock <= 5);

  const stats = [
    { label: 'Total Products', value: products.length, icon: '📦', color: 'bg-blue-50 text-blue-700' },
    { label: 'Total Orders', value: orders.length, icon: '🛒', color: 'bg-purple-50 text-purple-700' },
    { label: 'Estimated Revenue', value: `$${totalRevenue.toFixed(2)}`, icon: '💰', color: 'bg-green-50 text-green-700' },
    { label: 'Low Stock Items', value: lowStock.length, icon: '⚠️', color: 'bg-orange-50 text-orange-700' },
  ];

  const recent = orders.slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className={`rounded-xl p-5 ${s.color} border border-current/10`}>
            <div className="text-3xl mb-2">{s.icon}</div>
            <div className="text-2xl font-extrabold">{s.value}</div>
            <div className="text-sm font-medium opacity-80 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {lowStock.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
          <h3 className="font-bold text-orange-800 mb-2">⚠️ Low Stock Alerts</h3>
          <div className="flex flex-wrap gap-2">
            {lowStock.map(p => (
              <span key={p._id} className="bg-white border border-orange-200 text-orange-700 text-xs font-semibold px-3 py-1 rounded-full">
                {p.title} — {p.stock} left
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-700">Recent Orders</h3>
        </div>
        {recent.length === 0 ? (
          <p className="p-6 text-slate-400 text-sm text-center">No orders yet.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {recent.map(o => (
              <div key={o._id} className="px-6 py-4 flex items-center justify-between text-sm">
                <div>
                  <p className="font-semibold text-slate-700">{o.user_id?.name || 'Customer'}</p>
                  <p className="text-slate-400 text-xs">{new Date(o.created_at).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-bold text-slate-800">${o.total_amount.toFixed(2)}</span>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-semibold capitalize ${STATUS_COLORS[o.delivery_status]}`}>
                    {o.delivery_status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Products Sub-component
// ─────────────────────────────────────────────
function SellerProducts({ products, onRefresh }: { products: any[]; onRefresh: () => void }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [formData, setFormData] = useState({ title: '', description: '', price: '', stock: '', category: '' });
  const [imagePreview, setImagePreview] = useState('');
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  const openModal = (product?: any) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        title: product.title, description: product.description,
        price: product.price.toString(), stock: product.stock.toString(),
        category: product.category
      });
      setImagePreview(product.images?.[0] || '');
      setSelectedImageFile(null);
    } else {
      setEditingProduct(null);
      setFormData({ title: '', description: '', price: '', stock: '', category: '' });
      setImagePreview('');
      setSelectedImageFile(null);
    }
    setIsModalOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedImageFile(file);

    if (!file) {
      setImagePreview('');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);

    const payload = new FormData();
    payload.append('title', formData.title);
    payload.append('description', formData.description);
    payload.append('price', formData.price);
    payload.append('stock', formData.stock);
    payload.append('category', formData.category);
    if (selectedImageFile) {
      payload.append('image', selectedImageFile);
    }

    try {
      if (editingProduct) {
        await api.put(`/api/products/${editingProduct._id}`, payload);
      } else {
        await api.post(`/api/products`, payload);
      }
      setIsModalOpen(false);
      onRefresh();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to save product');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this product? This action cannot be undone.')) return;
    try {
      await api.delete(`/api/products/${id}`);
      onRefresh();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete product');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-bold text-slate-700 text-lg">Your Products ({products.length})</h2>
        <button onClick={() => openModal()} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow transition-all hover:-translate-y-0.5">
          + Add New Product
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {products.length === 0 ? (
          <div className="p-16 text-center text-slate-400">
            <div className="text-5xl mb-3">📦</div>
            <p className="font-medium">No products yet. Add your first product!</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {products.map(p => (
              <div key={p._id} className="p-5 flex items-center gap-5 hover:bg-slate-50 transition-colors">
                <div className="w-14 h-14 bg-slate-100 rounded-lg overflow-hidden shrink-0 flex items-center justify-center">
                  {p.images?.[0] ? <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover" /> : <span className="text-slate-300 text-xs">No Img</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-800 truncate">{p.title}</h3>
                  <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-slate-500">
                    <span className="font-bold text-slate-700 text-sm">${p.price.toFixed(2)}</span>
                    <span className={`px-2 py-0.5 rounded-full font-semibold ${p.stock <= 5 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'}`}>
                      Stock: {p.stock}
                    </span>
                    <span className="bg-slate-100 px-2 py-0.5 rounded-full">{p.category}</span>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => openModal(p)} className="px-3 py-1.5 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors border border-indigo-100">Edit</button>
                  <button onClick={() => handleDelete(p._id)} className="px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-100">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-slate-200 flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="text-lg font-bold text-slate-800">{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700 text-2xl font-bold leading-none">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {[
                { label: 'Title', name: 'title', type: 'text', required: true },
                { label: 'Category', name: 'category', type: 'text', required: true },
              ].map(f => (
                <div key={f.name}>
                  <label className="block text-sm font-medium text-slate-600 mb-1">{f.label}</label>
                  <input required={f.required} type={f.type} name={f.name} value={(formData as any)[f.name]} onChange={handleInputChange}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Description</label>
                <textarea required name="description" value={formData.description} onChange={handleInputChange}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm h-24 focus:outline-none focus:ring-2 focus:ring-indigo-300" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Price ($)</label>
                  <input required type="number" step="0.01" min="0" name="price" value={formData.price} onChange={handleInputChange}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Stock</label>
                  <input required type="number" min="0" name="stock" value={formData.stock} onChange={handleInputChange}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Product Image</label>
                <input type="file" accept="image/*" onChange={handleImageChange}
                  className="w-full text-sm text-slate-700 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
                {imagePreview && (
                  <div className="mt-3 rounded-lg border border-slate-200 overflow-hidden w-full h-48 bg-slate-50 flex items-center justify-center">
                    <img src={imagePreview} alt="Preview" className="max-h-full max-w-full object-contain" />
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2 text-sm rounded-lg text-slate-600 hover:bg-slate-100 font-medium">Cancel</button>
                <button type="submit" disabled={formSubmitting} className="px-5 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium disabled:opacity-50">
                  {formSubmitting ? 'Saving...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Orders Sub-component
// ─────────────────────────────────────────────
function SellerOrders({ orders, onRefresh }: { orders: any[]; onRefresh: () => void }) {
  const [updating, setUpdating] = useState<string | null>(null);

  const handleStatusChange = async (orderId: string, delivery_status: string) => {
    setUpdating(orderId);
    try {
      await api.put(`/api/orders/${orderId}/status`, { delivery_status });
      onRefresh();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to update status');
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div>
      <h2 className="font-bold text-slate-700 text-lg mb-4">Orders ({orders.length})</h2>
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {orders.length === 0 ? (
          <div className="p-16 text-center text-slate-400">
            <div className="text-5xl mb-3">🛒</div>
            <p className="font-medium">No orders yet. When customers buy your products, they'll appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  {['Order ID', 'Customer', 'Date', 'Items', 'Total', 'Payment', 'Delivery Status'].map(h => (
                    <th key={h} className="text-left px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map(o => (
                  <tr key={o._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-4 font-mono text-xs text-slate-500">{o._id.slice(-8).toUpperCase()}</td>
                    <td className="px-4 py-4">
                      <p className="font-semibold text-slate-800">{o.user_id?.name || '—'}</p>
                      <p className="text-xs text-slate-400">{o.user_id?.email}</p>
                    </td>
                    <td className="px-4 py-4 text-slate-500 text-xs">{new Date(o.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-4 text-slate-600">{o.product_ids?.length || 0} item(s)</td>
                    <td className="px-4 py-4 font-bold text-slate-800">${o.total_amount.toFixed(2)}</td>
                    <td className="px-4 py-4">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-semibold capitalize ${o.payment_status === 'completed' ? 'bg-green-100 text-green-700' : o.payment_status === 'failed' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-700'}`}>
                        {o.payment_status}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <select
                        value={o.delivery_status}
                        disabled={updating === o._id}
                        onChange={e => handleStatusChange(o._id, e.target.value)}
                        className={`text-xs border rounded-lg px-2 py-1.5 font-semibold cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-300 capitalize ${STATUS_COLORS[o.delivery_status]}`}
                      >
                        {['processing', 'shipped', 'delivered', 'cancelled'].map(s => (
                          <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Reviews Sub-component
// ─────────────────────────────────────────────
function SellerReviews() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/api/reviews/seller`)
      .then(res => setReviews(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const avg = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : '—';

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-slate-700 text-lg">Customer Reviews ({reviews.length})</h2>
        {reviews.length > 0 && (
          <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 px-3 py-1.5 rounded-xl">
            <span className="text-yellow-400 text-lg">★</span>
            <span className="font-bold text-slate-700">{avg}</span>
            <span className="text-xs text-slate-400">avg rating</span>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {loading ? (
          <p className="p-8 text-center text-slate-400 text-sm">Loading reviews...</p>
        ) : reviews.length === 0 ? (
          <div className="p-16 text-center text-slate-400">
            <div className="text-5xl mb-3">⭐</div>
            <p className="font-medium">No reviews yet. Your first review will appear here.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {reviews.map(r => (
              <div key={r._id} className="p-5">
                <div className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm shrink-0">
                    {r.user_id?.name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-slate-800">{r.user_id?.name || 'Anonymous'}</p>
                      <p className="text-xs text-slate-400">{new Date(r.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="text-yellow-400 text-sm">{[1,2,3,4,5].map(n => STAR(n, r.rating)).join('')}</div>
                      <span className="text-xs text-slate-500 font-medium">{r.rating}/5</span>
                    </div>
                    {r.product_id && (
                      <p className="text-xs text-indigo-600 font-medium mt-1">📦 {r.product_id.title}</p>
                    )}
                    {r.comment && <p className="text-sm text-slate-600 mt-2 leading-relaxed">{r.comment}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Profile Sub-component
// ─────────────────────────────────────────────
function SellerProfile({ user }: { user: any }) {
  const setUser = useStore(state => state.setUser);
  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '', password: '', confirmPassword: '' });
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(''); setErrorMsg('');
    if (form.password && form.password !== form.confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }
    setSaving(true);
    try {
      const payload: any = { name: form.name, email: form.email };
      if (form.password) payload.password = form.password;
      const res = await api.put(`/api/auth/me`, payload);
      if (res.data.success) {
        setUser({ ...user, name: form.name, email: form.email });
        setSuccessMsg('Profile updated successfully!');
        setForm(f => ({ ...f, password: '', confirmPassword: '' }));
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <h2 className="font-bold text-slate-700 text-lg mb-4">Seller Profile</h2>
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        {successMsg && <div className="mb-4 bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-lg font-medium">{successMsg}</div>}
        {errorMsg && <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg font-medium">{errorMsg}</div>}
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Store / Display Name</label>
            <input name="name" value={form.name} onChange={handleChange} required
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Email Address</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} required
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
          </div>
          <div className="pt-4 border-t border-slate-100">
            <p className="text-sm font-semibold text-slate-700 mb-3">Change Password <span className="text-slate-400 font-normal">(leave blank to keep current)</span></p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">New Password</label>
                <input name="password" type="password" value={form.password} onChange={handleChange}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Confirm Password</label>
                <input name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
              </div>
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <button type="submit" disabled={saving} className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold shadow transition-all hover:-translate-y-0.5 disabled:opacity-50">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Main Seller Dashboard
// ─────────────────────────────────────────────
const NAV_ITEMS: { id: Tab; label: string; icon: string }[] = [
  { id: 'overview', label: 'Overview', icon: '📊' },
  { id: 'products', label: 'Products', icon: '📦' },
  { id: 'orders', label: 'Orders', icon: '🛒' },
  { id: 'reviews', label: 'Reviews', icon: '⭐' },
  { id: 'profile', label: 'Profile', icon: '👤' },
];

export default function SellerDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const user = useStore(state => state.user);
  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    try {
      const [prodRes, orderRes] = await Promise.all([
        api.get(user?.role === 'admin' ? '/api/products' : `/api/products?seller=${user?.id}`),
        api.get(`/api/orders/seller`),
      ]);
      setProducts(prodRes.data.data || []);
      setOrders(orderRes.data.data || []);
    } catch {
      // silently handle — sub-components show empty states
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!user || (user.role !== 'seller' && user.role !== 'admin')) {
      navigate('/seller-login');
      return;
    }
    fetchData();
  }, [user, navigate, fetchData]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-500 text-sm font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-64px)] bg-slate-50">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed md:sticky top-0 left-0 h-screen md:h-auto z-40 w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-200`}>
        <div className="p-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-lg">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className="font-bold text-slate-800 text-sm leading-tight">{user?.name}</p>
              <p className="text-xs text-indigo-500 font-medium capitalize">{user?.role}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === item.id
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
              {item.id === 'orders' && orders.length > 0 && (
                <span className="ml-auto bg-indigo-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">{orders.length}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button
            onClick={() => navigate('/seller-login')}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-xl font-semibold transition-colors"
          >
            🚪 Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/40 z-30 md:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main content */}
      <main className="flex-1 p-4 md:p-8 overflow-auto">
        {/* Mobile topbar */}
        <div className="flex items-center justify-between mb-6 md:hidden">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg border border-slate-200 bg-white">
            ☰
          </button>
          <span className="font-bold text-slate-700">{NAV_ITEMS.find(n => n.id === activeTab)?.label}</span>
          <div className="w-8" />
        </div>

        {/* Desktop header */}
        <div className="hidden md:flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-800">{NAV_ITEMS.find(n => n.id === activeTab)?.icon} {NAV_ITEMS.find(n => n.id === activeTab)?.label}</h1>
            <p className="text-sm text-slate-400 mt-0.5">Welcome back, {user?.name}</p>
          </div>
        </div>

        {activeTab === 'overview' && <SellerOverview products={products} orders={orders} />}
        {activeTab === 'products' && <SellerProducts products={products} onRefresh={fetchData} />}
        {activeTab === 'orders' && <SellerOrders orders={orders} onRefresh={fetchData} />}
        {activeTab === 'reviews' && <SellerReviews />}
        {activeTab === 'profile' && <SellerProfile user={user} />}
      </main>
    </div>
  );
}
