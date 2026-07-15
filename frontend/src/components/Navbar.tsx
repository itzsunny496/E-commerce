import { Link, useNavigate } from 'react-router-dom';
import { useStore, useCartCount, useWishlistCount } from '@/store/useStore';
import { useState, useRef, useEffect } from 'react';

export default function Navbar() {
  const cartCount = useCartCount();
  const wishlistCount = useWishlistCount();
  const user = useStore(state => state.user);
  const setUser = useStore(state => state.setUser);
  const [search, setSearch] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) navigate(`/products?search=${encodeURIComponent(search)}`);
  };

  const handleSignOut = () => {
    localStorage.removeItem('token');
    setUser(null);
    setDropdownOpen(false);
    navigate('/');
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-[1200px] mx-auto px-4 py-3 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-md shadow-blue-200 group-hover:scale-105 transition-transform duration-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <span className="text-xl font-black text-slate-800 tracking-tight">
            Next<span className="text-blue-600">Gen</span>
            <span className="text-xs font-semibold text-slate-400 block -mt-1.5 tracking-normal">E-Commerce</span>
          </span>
        </Link>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex-1 max-w-[600px] hidden sm:block">
          <div className="relative group">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search for products, brands and categories..."
              className="w-full py-2.5 pl-4 pr-12 rounded-xl text-sm bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 transition-all duration-200"
            />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </form>

        {/* Action Controls */}
        <div className="flex items-center gap-1 md:gap-3">

          {/* Seller Portal link (seller/admin only) */}
          {user && (user.role === 'seller' || user.role === 'admin') && (
            <Link
              to="/seller"
              className="hidden md:flex items-center gap-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-xl transition-colors border border-indigo-100"
            >
              🏪 Seller Hub
            </Link>
          )}

          {/* Wishlist */}
          <Link
            to="/account"
            className="flex items-center gap-1.5 text-slate-600 hover:text-rose-500 font-semibold text-sm relative p-2 rounded-xl hover:bg-rose-50 transition-all"
            title="Wishlist"
          >
            <div className="relative">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill={wishlistCount > 0 ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {wishlistCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[10px] min-w-[16px] h-4 rounded-full flex items-center justify-center font-bold ring-2 ring-white px-0.5">
                  {wishlistCount}
                </span>
              )}
            </div>
          </Link>

          {/* Cart */}
          <Link
            to="/cart"
            className="flex items-center gap-1.5 text-slate-600 hover:text-blue-600 font-semibold text-sm relative p-2 rounded-xl hover:bg-slate-50 transition-all"
          >
            <div className="relative">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-500 hover:text-blue-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-blue-600 text-white text-[10px] min-w-[16px] h-4 rounded-full flex items-center justify-center font-bold ring-2 ring-white px-0.5">
                  {cartCount}
                </span>
              )}
            </div>
            <span className="hidden md:inline text-sm">Cart</span>
          </Link>

          {/* User Menu */}
          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(o => !o)}
                className="flex items-center gap-2 text-slate-700 font-semibold text-sm bg-slate-50 hover:bg-slate-100 py-1.5 px-3 rounded-xl border border-slate-100 transition-colors"
              >
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="max-w-[80px] truncate hidden md:block">{user.name.split(' ')[0]}</span>
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 text-slate-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl border border-slate-200 shadow-xl shadow-slate-200/50 py-1 z-50">
                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="text-sm font-bold text-slate-800 truncate">{user.name}</p>
                    <p className="text-xs text-slate-400 truncate">{user.email}</p>
                  </div>
                  {[
                    { to: '/account', label: '📦 My Orders' },
                    { to: '/account', label: '❤️ Wishlist' },
                    { to: '/account', label: '👤 Profile' },
                  ].map(item => (
                    <Link
                      key={item.label}
                      to={item.to}
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors font-medium"
                    >
                      {item.label}
                    </Link>
                  ))}
                  {(user.role === 'seller' || user.role === 'admin') && (
                    <Link
                      to="/seller"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-indigo-600 hover:bg-indigo-50 transition-colors font-medium border-t border-slate-100"
                    >
                      🏪 Seller Dashboard
                    </Link>
                  )}
                  <div className="border-t border-slate-100">
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors font-medium"
                    >
                      🚪 Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="text-slate-600 hover:text-blue-600 text-sm font-semibold hover:bg-slate-50 px-3 py-2 rounded-xl transition-all">
                Sign In
              </Link>
              <Link to="/register" className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-3 py-2 rounded-xl transition-all shadow-md shadow-blue-100 hover:-translate-y-0.5">
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
