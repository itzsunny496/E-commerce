# NextGen E-Commerce Platform

A fully functional, high-performance, full-stack e-commerce platform built with modern technologies.

# Features
- NextGen E-Commerce Features (Cart, Products, Wishlist)
- Seller Portal for inventory management (`/seller-login` -> `/seller`)
- JWT Authentication (Users vs. Sellers/Admins)
- Firebase Social Login
- REST API powered by Express & MongoDB

# Tech Stack
- **Frontend**: React + Vite, TailwindCSS, Zustand, Three.js (React Three Fiber), React Router
- **Backend**: Node.js, Express, MongoDB (Mongoose)
- **Authentication**: JWT, bcryptjs (OAuth/OTP ready)
- **Payments**: Razorpay Sandbox (Backend: `razorpay` Node SDK, Frontend: Razorpay Checkout.js)
- **Security**: Helmet, Express Rate Limit, CORS

---

# Local Setup

### 1. Backend Setup
1. Open terminal and navigate to `/backend`
2. Run `npm install`
3. Create a `.env` file in `/backend` (DO NOT commit this file) with the following:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_atlas_connection_string
   JWT_SECRET=your_super_secret_jwt_key
   RAZORPAY_KEY_ID=rzp_test_your_key_id_here
   RAZORPAY_KEY_SECRET=your_razorpay_key_secret_here
   FIREBASE_API_KEY=your_firebase_api_key
   CLOUDINARY_URL=your_cloudinary_url
   ```
4. Run `npm run dev` to start the backend server on `http://localhost:5000`

### 2. Frontend Setup
1. Open terminal and navigate to `/frontend`
2. Run `npm install`
3. Create a `.env.local` file in `/frontend` (DO NOT commit this file):
   ```env
   VITE_API_URL=http://localhost:5000
   VITE_RAZORPAY_KEY_ID=rzp_test_your_key_id_here
   ```
4. Get your Razorpay test keys from the [Razorpay Dashboard](https://dashboard.razorpay.com/) → Settings → API Keys → Test Mode.
5. Run `npm run dev` to start the Vite dev server on `http://localhost:3000`

---

#   Deployment Guide

## 1. Database (MongoDB Atlas)
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and create a free M0 cluster.
2. Create a database user and whitelist IP `0.0.0.0/0`.
3. Copy the Connection String and set it as `MONGODB_URI` in your backend environment variables.

## 2. Backend Deployment (Render / Railway)
1. Push your code to GitHub.
2. Go to [Render](https://render.com/) or [Railway](https://railway.app/).
3. Create a new Web Service and link your GitHub repository.
4. Set the Root Directory to `backend`.
5. Build Command: `npm install`
6. Start Command: `npm start`
7. Add all the environment variables from your local `.env` to the dashboard.

### 3. Frontend Deployment (Vercel / Netlify)
1. Go to [Vercel](https://vercel.com/) or [Netlify](https://netlify.com/) and import your GitHub repository.
2. Set the Root Directory to `frontend`.
3. Build Command: `npm run build`
4. Output Directory: `dist`
5. Add `VITE_API_URL` (pointing to your live backend URL) and `VITE_RAZORPAY_KEY_ID` to the Environment Variables settings.
6. Deploy!

---


