import { useState, FormEvent, ChangeEvent, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation} from 'react-router-dom';
import { FaGoogle, FaEnvelope, FaLock, FaEyeSlash, FaEye } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { loginUser } from '../api/auth.service';
import { motion } from 'framer-motion';

// Define the Google OAuth URL
const GOOGLE_OAUTH_URL = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${import.meta.env.VITE_GOOGLE_CLIENT_ID }&redirect_uri=${encodeURIComponent(`${import.meta.env.VITE_BACKEND_URL}/api`+ '/auth/google/callback')}&response_type=code&scope=email%20profile&prompt=select_account`;

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const {login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const toastShown = useRef(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear error when typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('verified') === 'true' && !toastShown.current) {
      toast.success('Your email has been successfully verified. Please log in.');
      toastShown.current = true; // Mark the toast as shown
    }
  }, [location]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('verified') === 'true' && !toastShown.current) {
      toast.success('Your email has been successfully verified. Please log in.');
      toastShown.current = true;
    }
    // Show error if redirected from Google sign-in with wrong method
    if (params.get('error') === 'google_wrong_method' && !toastShown.current) {
      toast.error('This email is registered with email/password. Please sign in using your password.');
      toastShown.current = true;
    }
    if (params.get('error') === 'google_auth_failed' && !toastShown.current) {
      toast.error('Google authentication failed. Please try again.');
      toastShown.current = true;
    }
  }, [location]);

  useEffect(() => {
    if (localStorage.getItem('account_deleted')) {
      toast.success('Your account has now successfully been deleted.');
      localStorage.removeItem('account_deleted');
    }
  }, [location]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setIsLoading(true);
      console.log('Submitting login form with data:', formData);
      
      // Try direct API call first for debugging
      const directResponse = await loginUser(formData);
      console.log('Direct API call response:', directResponse);
      
      if (directResponse.success) {
        // If direct call succeeded, use context login
        const success = await login(formData);
        if (success) {
          navigate('/');
        }
      } else {
        throw new Error(directResponse.message || 'Login failed');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Login failed';
      
      // Handle specific error messages
      if (errorMessage.includes('not verified') || errorMessage.includes('verification')) {
        toast.error('Please verify your email before logging in.');
        setErrors({
          general: 'Email not verified. Please check your inbox for the verification link.'
        });
      } else if (errorMessage.includes('email and password')) {
        setErrors({
          general: 'Please provide both email and password.'
        });
      } else if (errorMessage.includes('Invalid email or password')) {
        setErrors({
          general: 'Invalid email or password. Please try again.'
        });
      } else {
        setErrors({
          general: errorMessage
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    window.location.href = GOOGLE_OAUTH_URL;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
    <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900 px-4">
      <div className="w-full max-w-md">
        <div className="card p-8">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold mb-2">Welcome Back!</h1>
            <p className="text-gray-600 dark:text-gray-400">Please sign in to continue</p>
          </div>

          {errors.general && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaEnvelope className="text-gray-400" />
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-3 py-2 rounded-lg border ${
                    errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  } bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary`}
                  placeholder="yourname@example.com"
                />
              </div>
              {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="text-gray-400" />
                </div>
                <input
                  type={showNewPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-3 py-2 rounded-lg border ${
                    errors.password ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  } bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary`}
                  placeholder="********"
                />
                <button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer z-10" onClick={() => setShowNewPassword((prev) => !prev)}>
                    {showNewPassword ? <FaEyeSlash className="text-gray-400" /> : <FaEye className="text-gray-400" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  Remember me
                </label>
              </div>
              <div className="text-sm">
                <Link to="/change-password" className="text-primary hover:underline">
                  Forgot your password?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              className="w-full btn btn-primary py-3 flex items-center justify-center"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></span>
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">Or continue with</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center gap-2 btn border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 py-3"
            >
              <FaGoogle className="text-red-500" />
              <span>Sign in with Google</span>
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-primary hover:underline">
              Sign up now
            </Link>
          </p>
        </div>
      </div>
    </div>
    </motion.div>
  );
};

export default Login; 
