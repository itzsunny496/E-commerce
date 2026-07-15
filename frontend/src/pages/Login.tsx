import { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import { auth, googleProvider } from '@/utils/firebase';
import { signInWithPopup } from 'firebase/auth';

export default function Login() {
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
        localStorage.setItem('token', res.data.token);
        setUser(res.data.user);
        navigate('/');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed. Please verify your email & password.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError('');
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/social`, {
        idToken,
        provider: 'google'
      });
      
      if (res.data.success) {
        localStorage.setItem('token', res.data.token);
        setUser(res.data.user);
        navigate('/');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Google login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[800px] mx-auto mt-10 px-4 md:px-0">
      <div className="flex bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden min-h-[500px]">
        
        {/* Left Informative Panel */}
        <div className="w-[40%] bg-blue-600 p-8 flex flex-col justify-between hidden md:flex">
          <div className="space-y-4">
            <h2 className="text-3xl font-extrabold text-white leading-tight">Login</h2>
            <p className="text-blue-100 text-sm leading-relaxed">
              Sign in to unlock your custom orders dashboard, saved wishlist, and tailored purchase history.
            </p>
          </div>
          <div className="text-center opacity-10">
            <svg className="w-40 h-40 mx-auto text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
            </svg>
          </div>
        </div>

        {/* Right Authentication Form */}
        <div className="flex-1 p-8 md:p-12 flex flex-col justify-center space-y-6">
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-slate-800">Welcome Back</h3>
            <p className="text-xs text-slate-400 font-medium">Please enter your account details below</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-xs font-semibold leading-relaxed">
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
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 transition-all duration-200"
                placeholder="Enter email address"
                required
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 transition-all duration-200"
                placeholder="Enter password"
                required
              />
            </div>

            <div className="flex items-center justify-between text-xs font-semibold pt-1">
              <label className="flex items-center gap-2 text-slate-500 cursor-pointer">
                <input type="checkbox" className="accent-blue-600 rounded" />
                <span>Remember me</span>
              </label>
              <span className="text-blue-600 hover:underline cursor-pointer">Forgot Password?</span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm rounded-xl shadow-md shadow-orange-100 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:translate-y-0"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          <div className="relative flex items-center justify-center pt-2 pb-2">
            <span className="absolute bg-white px-3 text-xs text-slate-400 font-medium">Or continue with</span>
            <div className="w-full border-t border-slate-200"></div>
          </div>

          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            type="button"
            className="w-full flex items-center justify-center gap-3 py-3.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-sm rounded-xl transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:translate-y-0"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Sign in with Google
          </button>

          <p className="text-center text-xs text-slate-400 font-semibold pt-4">
            New to NextGen? <Link to="/register" className="text-blue-600 hover:underline">Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
