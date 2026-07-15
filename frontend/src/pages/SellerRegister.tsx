import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useStore } from '@/store/useStore';

export default function SellerRegister() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreeToPolicy, setAgreeToPolicy] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const setUser = useStore((state) => state.setUser);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeToPolicy) {
      setError('You must agree to the Seller Policy to register.');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/register`, { 
        name, 
        email, 
        password,
        isSeller: true 
      });
      
      if (res.data.success) {
        localStorage.setItem('token', res.data.token);
        setUser(res.data.user);
        navigate('/seller');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[600px] mx-auto mt-10 px-4 md:px-0 mb-10">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-8 md:p-12 space-y-6">
        <div className="space-y-2 text-center">
          <h2 className="text-3xl font-extrabold text-slate-800">Become a Seller</h2>
          <p className="text-sm text-slate-500 font-medium">Create your store and start selling today</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-xs font-semibold leading-relaxed text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Store Name / Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50/50 transition-all duration-200"
              placeholder="Your Store Name"
              required
            />
          </div>

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
              placeholder="Create a strong password"
              required
            />
          </div>

          <div className="pt-2">
            <label className="flex items-start gap-3 cursor-pointer">
              <input 
                type="checkbox" 
                checked={agreeToPolicy}
                onChange={(e) => setAgreeToPolicy(e.target.checked)}
                className="mt-1 accent-indigo-600 rounded" 
              />
              <span className="text-sm text-slate-600">
                I agree to the <Link to="/seller-policy" target="_blank" className="text-indigo-600 hover:underline">Seller Policy</Link> and Terms of Service.
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 mt-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-md shadow-indigo-200 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:translate-y-0"
          >
            {loading ? 'Creating Account...' : 'Register as Seller'}
          </button>
        </form>

        <p className="text-center text-xs text-slate-400 font-semibold pt-4 border-t border-slate-100">
          Already have a seller account? <Link to="/seller-login" className="text-indigo-600 hover:underline cursor-pointer">Sign in here</Link>
        </p>
      </div>
    </div>
  );
}
