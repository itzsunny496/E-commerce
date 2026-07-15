import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useStore } from '@/store/useStore';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const setUser = useStore(state => state.setUser);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/register`, { name, email, password });
      if (res.data.success) {
        localStorage.setItem('token', res.data.token);
        setUser(res.data.user);
        navigate('/');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 py-12">
      <div className="max-w-[980px] mx-auto px-4">
        <div className="grid lg:grid-cols-[42%_58%] gap-8 bg-white rounded-[32px] border border-slate-200 shadow-2xl overflow-hidden">

          <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-700 p-10 text-white flex flex-col justify-start gap-8">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.2),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.12),transparent_20%)]" />
            <div className="relative space-y-5">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.35em] text-slate-100/95">
                New Customer
              </span>
              <div className="space-y-4">
                <h2 className="text-4xl font-extrabold tracking-tight">Create account</h2>
                <p className="text-sm leading-6 text-slate-100/85">
                  Join NextGen for curated deals, faster checkout, order tracking, and a personalized shopping experience.
                </p>
              </div>
            </div>

            <div className="relative grid gap-3">
              {[
                { icon: '🛒', title: 'Order tracking in real time' },
                { icon: '❤️', title: 'Save products to your wishlist' },
                { icon: '🔒', title: 'Secure checkout every time' },
                { icon: '🎁', title: 'Member-only offers and rewards' },
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-0 rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
                  <div className="min-w-[38px] min-h-[38px] rounded-2xl bg-white/15 flex items-center justify-center text-lg">
                    {item.icon}
                  </div>
                  <p className="text-sm text-slate-100">{item.title}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="p-8 md:p-12 flex flex-col justify-center">
            <div className="space-y-3 mb-8">
              <p className="text-sm uppercase tracking-[0.3em] text-blue-600 font-semibold">Welcome aboard</p>
              <h3 className="text-3xl md:text-4xl font-extrabold text-slate-900">Create your NextGen account</h3>
              <p className="text-sm text-slate-500 max-w-xl">
                Fill in a few details to get started and unlock your wishlist, fast checkout, and a smarter shopping experience.
              </p>
            </div>

            {error && (
              <div className="bg-rose-50 border border-rose-100 text-rose-700 px-4 py-3 rounded-2xl text-sm font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-4">
              {[
                { label: 'Full Name', value: name, setter: setName, type: 'text', placeholder: 'Your full name' },
                { label: 'Email Address', value: email, setter: setEmail, type: 'email', placeholder: 'your@email.com' },
                { label: 'Password', value: password, setter: setPassword, type: 'password', placeholder: 'Create a strong password' },
                { label: 'Confirm Password', value: confirmPassword, setter: setConfirmPassword, type: 'password', placeholder: 'Re-enter your password' },
              ].map(f => (
                <div key={f.label} className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">{f.label}</label>
                  <input
                    type={f.type}
                    value={f.value}
                    onChange={e => f.setter(e.target.value)}
                    placeholder={f.placeholder}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-3xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-300 transition-all duration-200"
                  />
                </div>
              ))}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-3xl shadow-xl shadow-blue-100/50 transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>

            <div className="mt-8 text-center space-y-3 text-sm text-slate-500">
              <p>
                Already have an account? <Link to="/login" className="text-blue-600 font-semibold hover:underline">Sign in</Link>
              </p>
              <p>
                Are you a seller? <Link to="/seller-register" className="text-indigo-600 font-semibold hover:underline">Register as a Seller</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
