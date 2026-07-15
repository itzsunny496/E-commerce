import { Link } from 'react-router-dom';

export default function SellerPolicy() {
  return (
    <div className="max-w-[800px] mx-auto mt-10 px-4 md:px-0 mb-20">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-8 md:p-12 space-y-6">
        <h1 className="text-3xl font-extrabold text-slate-800 border-b border-slate-200 pb-4">Seller Terms & Policy</h1>
        
        <div className="prose prose-slate max-w-none space-y-4">
          <p className="text-slate-600">Last updated: July 2026</p>
          
          <h3 className="text-xl font-bold text-slate-800 mt-6">1. Acceptance of Terms</h3>
          <p className="text-slate-600 leading-relaxed">
            By registering as a seller on NextGen E-Commerce, you agree to be bound by these Seller Terms & Policies. 
            These terms govern your access to the seller portal and the listing of products on our platform.
          </p>

          <h3 className="text-xl font-bold text-slate-800 mt-6">2. Product Listings and Prohibited Items</h3>
          <p className="text-slate-600 leading-relaxed">
            Sellers are responsible for the accuracy of their product listings. You may not list items that are illegal, 
            counterfeit, or violate any third-party intellectual property rights. We reserve the right to remove any 
            listings that violate our guidelines without prior notice.
          </p>

          <h3 className="text-xl font-bold text-slate-800 mt-6">3. Fees and Payments</h3>
          <p className="text-slate-600 leading-relaxed">
            NextGen E-Commerce charges a commission on all sales processed through the platform. The current rate is 
            5% per transaction. Payments will be disbursed to your registered bank account on a bi-weekly schedule.
          </p>

          <h3 className="text-xl font-bold text-slate-800 mt-6">4. Privacy and Data Handling</h3>
          <p className="text-slate-600 leading-relaxed">
            As a seller, you will have access to customer data necessary for fulfilling orders (e.g., shipping addresses). 
            You agree to use this data solely for order fulfillment and not to use it for external marketing or share it 
            with third parties.
          </p>
          
          <h3 className="text-xl font-bold text-slate-800 mt-6">5. Account Termination</h3>
          <p className="text-slate-600 leading-relaxed">
            We reserve the right to suspend or terminate your seller account if you violate any of these terms, engage in 
            fraudulent activity, or receive excessive customer complaints.
          </p>
        </div>

        <div className="pt-8 border-t border-slate-200 text-center">
          <Link to="/seller-register" className="text-blue-600 hover:underline font-semibold">
            &larr; Back to Registration
          </Link>
        </div>
      </div>
    </div>
  );
}
