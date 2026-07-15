import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Home from '@/pages/Home';
import Products from '@/pages/Products';
import ProductDetail from '@/pages/ProductDetail';
import Cart from '@/pages/Cart';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import UserDashboard from '@/pages/UserDashboard';
import SellerLogin from '@/pages/SellerLogin';
import SellerRegister from '@/pages/SellerRegister';
import SellerPolicy from '@/pages/SellerPolicy';
import SellerDashboard from '@/pages/SellerDashboard';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#f1f3f6] flex flex-col">
        <Navbar />
        <main className="flex-1 px-2 py-2.5">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/account" element={<UserDashboard />} />
            <Route path="/seller-login" element={<SellerLogin />} />
            <Route path="/seller-register" element={<SellerRegister />} />
            <Route path="/seller-policy" element={<SellerPolicy />} />
            <Route path="/seller" element={<SellerDashboard />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
