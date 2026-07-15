export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="max-w-[1200px] mx-auto px-4 py-10 grid gap-8 md:grid-cols-3">
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-white">NextGen E-Commerce</h2>
          <p className="text-sm text-slate-400 max-w-sm">
            Shop smarter with a sleek modern storefront, curated deals, wishlist tracking, and secure checkout for every order.
          </p>
        </div>

        <div>
          <h3 className="text-sm uppercase tracking-[0.24em] text-slate-500 font-semibold mb-4">Quick links</h3>
          <ul className="space-y-2 text-sm text-slate-400">
            <li><a href="/" className="hover:text-white transition-colors">Home</a></li>
            <li><a href="/products" className="hover:text-white transition-colors">Products</a></li>
            <li><a href="/cart" className="hover:text-white transition-colors">Cart</a></li>
            <li><a href="/wishlist" className="hover:text-white transition-colors">Wishlist</a></li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm uppercase tracking-[0.24em] text-slate-500 font-semibold mb-4">Support</h3>
          <ul className="space-y-2 text-sm text-slate-400">
            <li><a href="/login" className="hover:text-white transition-colors">Sign in</a></li>
            <li><a href="/register" className="hover:text-white transition-colors">Create account</a></li>
            <li><a href="/seller-policy" className="hover:text-white transition-colors">Seller policy</a></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-slate-800 py-4">
        <div className="max-w-[1200px] mx-auto px-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between text-sm text-slate-500">
          <p>© {new Date().getFullYear()} NextGen E-Commerce. All rights reserved.</p>
          <div className="flex flex-wrap gap-4">
            <a href="/" className="hover:text-white transition-colors">Privacy</a>
            <a href="/" className="hover:text-white transition-colors">Terms</a>
            <a href="/" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
