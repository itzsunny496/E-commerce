import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/store/useStore';

export default function SellerLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const setUser = useStore((state) => state.setUser);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/login`, { email, password });
      if (res.data.success) {
        if (res.data.user.role !== 'seller' && res.data.user.role !== 'admin') {
          setError('Access denied. You do not have seller privileges.');
          setLoading(false);
          return;
        }
        localStorage.setItem('token', res.data.token);
        setUser(res.data.user);
        navigate('/seller');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed. Please verify your email & password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[600px] mx-auto mt-10 px-4 md:px-0">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-8 md:p-12 space-y-6">
        <div className="space-y-2 text-center">
          <h2 className="text-3xl font-extrabold text-slate-800">Seller Portal</h2>
          <p className="text-sm text-slate-500 font-medium">Log in to manage your products and inventory</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-xs font-semibold leading-relaxed text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50/50 transition-all duration-200"
              placeholder="seller@example.com"
              required
            />
          </div>
          
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50/50 transition-all duration-200"
              placeholder="Enter password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 mt-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-md shadow-indigo-200 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:translate-y-0"
          >
            {loading ? 'Authenticating...' : 'Sign In as Seller'}
          </button>
        </form>

        <div className="text-center pt-4 border-t border-slate-100 space-y-2">
          <p className="text-xs text-slate-400 font-semibold">
            New seller? <span onClick={() => navigate('/seller-register')} className="text-indigo-600 hover:underline cursor-pointer">Create an account</span>
          </p>
          <p className="text-xs text-slate-400 font-semibold">
            Want to buy instead? <span onClick={() => navigate('/login')} className="text-indigo-600 hover:underline cursor-pointer">Go to Customer Login</span>
          </p>
        </div>
      </div>
    </div>
  );
}
