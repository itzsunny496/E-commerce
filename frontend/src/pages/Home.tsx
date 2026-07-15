import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useStore } from '@/store/useStore';

const categories = [
  { name: 'Mobiles', slug: 'mobiles', icon: '📱' },
  { name: 'Electronics', slug: 'electronics', icon: '🖥️' },
  { name: 'Fashion', slug: 'fashion', icon: '👗' },
  { name: 'Home', slug: 'home', icon: '🏠' },
  { name: 'Appliances', slug: 'appliances', icon: '⚡' },
  { name: 'Beauty', slug: 'beauty', icon: '💄' },
];

const bannerDeals = [
  { title: 'Big Billion Days', subtitle: 'Up to 80% OFF', gradient: 'from-blue-600 to-sky-500', desc: 'Top brands, lowest prices of the year.' },
  { title: 'Electronics Upgrade', subtitle: 'Min 40% OFF', gradient: 'from-emerald-600 to-teal-500', desc: 'No-cost EMI & Exchange offers.' },
  { title: 'Premium Fashion Fest', subtitle: 'Buy 2 Get 1 Free', gradient: 'from-purple-600 to-pink-500', desc: 'Add elite styles to your wardrobe.' },
];

export default function Home() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const addToCart = useStore(state => state.addToCart);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL}/api/products?limit=8&sort=-created_at`)
      .then(res => setProducts(res.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleAddToCart = (e: React.MouseEvent, product: any) => {
    e.preventDefault();
    addToCart({ id: product._id, title: product.title, price: product.price, image: product.images?.[0] || '' });
    setAddedIds(prev => new Set(prev).add(product._id));
    setTimeout(() => setAddedIds(prev => { const n = new Set(prev); n.delete(product._id); return n; }), 1800);
  };

  return (
    <div className="max-w-[1200px] mx-auto px-4 md:px-0 py-4 space-y-6">

      {/* Category Bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-4 justify-items-center">
          {categories.map(cat => (
            <Link
              key={cat.name}
              to={`/products?category=${cat.slug}`}
              className="flex flex-col items-center gap-2 group text-slate-600 hover:text-blue-600 transition-colors"
            >
              <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-2xl group-hover:bg-blue-50 group-hover:scale-110 transition-all duration-300 shadow-sm border border-slate-100 group-hover:border-blue-100">
                {cat.icon}
              </div>
              <span className="text-xs font-semibold tracking-wide">{cat.name}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Hero Banners */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {bannerDeals.map(deal => (
          <Link
            key={deal.title}
            to="/products"
            className={`relative overflow-hidden bg-gradient-to-br ${deal.gradient} p-6 rounded-2xl text-white shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group flex flex-col justify-between h-[160px]`}
          >
            <div>
              <p className="text-xs font-black tracking-widest uppercase text-white/80 mb-1">{deal.subtitle}</p>
              <h2 className="text-2xl font-bold tracking-tight mb-1">{deal.title}</h2>
              <p className="text-xs text-white/70 max-w-[200px]">{deal.desc}</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold mt-4">
              <span>Explore Deals</span>
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </div>
          </Link>
        ))}
      </div>

      {/* Real Products Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-800 tracking-tight">Latest Products</h2>
            <p className="text-xs text-slate-400">Fresh arrivals from our sellers</p>
          </div>
          <Link to="/products" className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors shadow-md shadow-blue-100">
            VIEW ALL
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-xl bg-slate-50 h-[260px] animate-pulse border border-slate-100" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12 text-slate-400 space-y-2">
            <div className="text-4xl">📦</div>
            <p className="font-medium text-sm">No products yet — check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {products.map(product => {
              const originalPrice = Math.round(product.price * 1.4);
              const discountPct = Math.round(((originalPrice - product.price) / originalPrice) * 100);
              const isAdded = addedIds.has(product._id);

              return (
                <div key={product._id} className="group border border-slate-100 rounded-xl overflow-hidden hover:border-blue-200 hover:shadow-lg hover:shadow-blue-50/50 transition-all duration-300 flex flex-col bg-white">
                  <Link to={`/products/${product._id}`}>
                    <div className="aspect-square bg-slate-50 flex items-center justify-center p-3 border-b border-slate-100 group-hover:bg-blue-50/20 transition-colors overflow-hidden">
                      {product.images?.[0] ? (
                        <img src={product.images[0]} alt={product.title} className="max-h-full max-w-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <span className="text-5xl text-slate-200">📦</span>
                      )}
                    </div>
                  </Link>

                  <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
                    <div className="space-y-1">
                      <p className="text-[10px] text-blue-600 font-bold uppercase tracking-widest">{product.category}</p>
                      <Link to={`/products/${product._id}`}>
                        <h3 className="text-sm font-bold text-slate-800 line-clamp-2 leading-snug hover:text-blue-600 transition-colors">{product.title}</h3>
                      </Link>
                      <div className="flex items-baseline gap-2 pt-1">
                        <span className="text-base font-black text-slate-800">₹{product.price.toLocaleString()}</span>
                        <span className="text-xs text-slate-400 line-through">₹{originalPrice.toLocaleString()}</span>
                        <span className="text-xs font-bold text-emerald-600">{discountPct}%</span>
                      </div>
                    </div>

                    <button
                      onClick={e => handleAddToCart(e, product)}
                      className={`w-full py-2 text-xs font-bold rounded-lg transition-all duration-200 ${isAdded ? 'bg-emerald-500 text-white' : 'bg-orange-50 text-orange-600 hover:bg-orange-500 hover:text-white border border-orange-200'}`}
                    >
                      {isAdded ? '✓ Added' : '+ Cart'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Value Propositions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: '🚚', title: 'Free Delivery', desc: 'On orders above ₹499' },
          { icon: '🔄', title: 'Easy Returns', desc: '7-day hassle-free returns' },
          { icon: '🔒', title: 'Secure Payment', desc: '100% secure transactions' },
          { icon: '🎧', title: '24/7 Support', desc: 'Round the clock assistance' },
        ].map(v => (
          <div key={v.title} className="bg-white rounded-xl border border-slate-100 p-4 flex items-center gap-3">
            <span className="text-2xl">{v.icon}</span>
            <div>
              <p className="text-sm font-bold text-slate-800">{v.title}</p>
              <p className="text-xs text-slate-400">{v.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
