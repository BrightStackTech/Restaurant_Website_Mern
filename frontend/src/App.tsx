import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

// Layouts
import Navbar from './components/layouts/Navbar'
import Footer from './components/layouts/Footer'

// Pages
import Home from './pages/Home'
import Menu from './pages/Menu'
import About from './pages/About'
import Contact from './pages/Contact'
import Payment from './pages/Payment'
import ProductDetail from './pages/ProductDetail'
import Login from './pages/Login'
import Register from './pages/Register'
import NotFound from './pages/NotFound'
import GoogleAuthCallback from './pages/GoogleAuthCallback'
import EmailVerify from './pages/EmailVerify'
import Profile from './pages/Profile'
import ChangePassword from './pages/ChangePassword'
import ResetPassword from './pages/ResetPassword';
import EditProfile from './pages/EditProfile';
import PublicProfile from './pages/PublicProfile';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard'
import ManageProducts from './pages/admin/ManageProducts'
import ManageUsers from './pages/admin/ManageUsers'
import ManageReviews from './pages/admin/ManageReviews'
import AdminRoute from './components/AdminRoute';
import AddProduct from './pages/admin/AddProduct';
import EditProduct from './pages/admin/EditProduct'

function App() {
  const [darkMode, setDarkMode] = useState<boolean>(false);

  useEffect(() => {
    // Check for dark mode preference
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(isDarkMode);
    
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Toaster position="top-center" />
        <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/menu" element={<Menu />} />
            <Route path="/menu/:id" element={<ProductDetail />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/payment" element={<Payment />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/email-verify/:token" element={<EmailVerify />} />
            <Route path="/auth/callback" element={<GoogleAuthCallback />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/change-password" element={<ChangePassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/edit-profile" element={<EditProfile />} />
            <Route path="/user/:username" element={<PublicProfile />} />
            
            {/* Protected Routes */}
            
            {/* Admin Routes */}
            <Route 
              path="/admin" 
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />
            <Route 
              path="/admin/products" 
              element={
                <AdminRoute>
                  <ManageProducts />
                </AdminRoute>
              }
            />
            <Route 
              path="/admin/add-product" 
              element={
                <AdminRoute>
                  <AddProduct />
                </AdminRoute>
              }
            />
            <Route 
              path="/admin/users" 
              element={
                <AdminRoute>
                  <ManageUsers />
                </AdminRoute>
              }
            />
            <Route 
              path="/admin/reviews" 
              element={
                <AdminRoute>
                  <ManageReviews />
                </AdminRoute>
              }
            />
            <Route 
              path="/admin/edit-product/:id" 
              element={
                <AdminRoute>
                  <EditProduct />
                </AdminRoute>
              }
            />
            
            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  )
}

export default App
