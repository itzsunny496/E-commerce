import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';

interface Product {
  _id: string;
  title: string;
  price: number;
  category: string;
  images: string[];
  description?: string;
}

const CATEGORIES = ['All', 'Mobiles', 'Electronics', 'Fashion', 'Home', 'Appliances', 'Beauty'];
const PRICE_RANGES = [
  { value: 'all', label: 'Any Price' },
  { value: 'under-1000', label: 'Under ₹1,000' },
  { value: '1000-5000', label: '₹1,000 - ₹5,000' },
  { value: 'above-5000', label: 'Above ₹5,000' },
];

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');
  const [sortBy, setSortBy] = useState('featured');
  const [priceRange, setPriceRange] = useState('all');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const params: Record<string, string> = {};
        const search = searchParams.get('search');
        if (search) params.search = search;
        if (selectedCategory && selectedCategory.toLowerCase() !== 'all') {
          params.category = selectedCategory.toLowerCase();
        }
        params.limit = '1000'; // Fetch all products instead of defaulting to 10

        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/products`, { params });
        setProducts(res.data.data || []);
      } catch (error) {
        console.error('Failed to fetch products', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [selectedCategory, searchParams]);

  const visibleProducts = useMemo(() => {
    const filtered = [...products].filter((product) => {
      if (priceRange === 'under-1000') return product.price < 1000;
      if (priceRange === '1000-5000') return product.price >= 1000 && product.price <= 5000;
      if (priceRange === 'above-5000') return product.price > 5000;
      return true;
    });

    if (sortBy === 'price-low') return filtered.sort((a, b) => a.price - b.price);
    if (sortBy === 'price-high') return filtered.sort((a, b) => b.price - a.price);
    return filtered;
  }, [products, priceRange, sortBy]);

  return (
    <div className="max-w-[1200px] mx-auto px-4 md:px-0 py-6 flex flex-col md:flex-row gap-6">
      <aside className="w-full md:w-[240px] bg-white rounded-2xl border border-slate-200 p-5 shrink-0 self-start md:sticky md:top-20">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wider">Filters</h3>
          <button onClick={() => { setSelectedCategory('All'); setPriceRange('all'); }} className="text-xs text-blue-600 hover:text-blue-700 font-semibold">Clear All</button>
        </div>

        <div className="space-y-6">
          <div>
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Categories</h4>
            <div className="space-y-2">
              {CATEGORIES.map((cat) => (
                <label key={cat} className={`flex items-center gap-2.5 py-1 px-2 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors text-sm ${selectedCategory.toLowerCase() === cat.toLowerCase() ? 'text-blue-600 font-semibold bg-blue-50/50' : 'text-slate-600'}`}>
                  <input type="radio" name="category" checked={selectedCategory.toLowerCase() === cat.toLowerCase()} onChange={() => setSelectedCategory(cat)} className="accent-blue-600 w-4 h-4" />
                  <span>{cat}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Price Range</h4>
            <div className="space-y-2">
              {PRICE_RANGES.map((range) => (
                <label key={range.value} className="flex items-center gap-2.5 py-1 px-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg cursor-pointer">
                  <input type="radio" name="priceRange" checked={priceRange === range.value} onChange={() => setPriceRange(range.value)} className="accent-blue-600 w-4 h-4 rounded" />
                  <span>{range.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </aside>

      <div className="flex-1 space-y-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Showing <span className="font-bold text-slate-800">{visibleProducts.length}</span> products
            {searchParams.get('search') && <> for "<span className="font-bold text-slate-800">{searchParams.get('search')}</span>"</>}
          </p>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="text-sm border border-slate-200 rounded-xl px-3 py-1.5 focus:outline-none focus:border-blue-500 bg-slate-50 text-slate-600 font-medium">
            <option value="featured">Featured</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 h-[340px] animate-pulse" />
            ))}
          </div>
        ) : visibleProducts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center space-y-3">
            <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto border border-slate-100">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
            <h3 className="font-bold text-slate-800">No products found</h3>
            <p className="text-sm text-slate-400">Try modifying your filters or search keywords.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleProducts.map((product) => (
              <Link key={product._id} to={`/products/${product._id}`} className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:border-blue-400 hover:shadow-lg hover:shadow-blue-50/50 transition-all duration-300 group flex flex-col h-full">
                <div className="aspect-square bg-slate-50 flex items-center justify-center p-4 border-b border-slate-100 group-hover:bg-blue-50/10 transition-colors">
                  {product.images?.[0] ? (
                    <img src={product.images[0]} alt={product.title} className="max-h-full max-w-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <svg className="w-16 h-16 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                    </svg>
                  )}
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-1.5">
                    <p className="text-[10px] text-blue-600 font-bold uppercase tracking-widest">{product.category}</p>
                    <h3 className="text-sm font-bold text-slate-800 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">{product.title}</h3>
                    <div className="flex items-center gap-1.5">
                      <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 border border-emerald-100">4.3 ★</span>
                      <span className="text-[11px] text-slate-400 font-medium">(2.4k)</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-baseline justify-between">
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-black text-slate-800">₹{product.price.toLocaleString()}</span>
                      <span className="text-xs text-slate-400 line-through">₹{Math.round(product.price * 1.4).toLocaleString()}</span>
                    </div>
                    <span className="text-xs font-bold text-emerald-600">28% OFF</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
