import { useState, FormEvent, ChangeEvent, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaGoogle, FaEnvelope, FaLock, FaUser, FaEyeSlash, FaEye } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { registerUser } from '../api/auth.service';
import { motion } from 'framer-motion';
import api from "../api/config";

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [usernameExists, setUsernameExists] = useState(false);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const usernameCheckTimeout = useRef<NodeJS.Timeout | null>(null);
  const [emailExists, setEmailExists] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const emailCheckTimeout = useRef<NodeJS.Timeout | null>(null);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

    // Username validation for spaces and uppercase
    if (name === "name") {
      if (/\s/.test(value)) {
        setErrors(prev => ({ ...prev, name: "Username cannot contain spaces" }));
      } else if (/[A-Z]/.test(value)) {
        setErrors(prev => ({ ...prev, name: "Username must be lowercase" }));
      } else {
        setErrors(prev => ({ ...prev, name: "" }));
      }
    }

    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));


    // Username uniqueness check
    if (name === "name") {
      setCheckingUsername(true);
      setUsernameExists(false);
      if (usernameCheckTimeout.current) clearTimeout(usernameCheckTimeout.current);
      usernameCheckTimeout.current = setTimeout(async () => {
        if (!value.trim()) {
          setCheckingUsername(false);
          setUsernameExists(false);
          return;
        }
        try {
          const res = await api.get(`/auth/check-username?name=${encodeURIComponent(value.trim())}`);
          setUsernameExists(res.data.exists);
        } catch {
          setUsernameExists(false);
        } finally {
          setCheckingUsername(false);
        }
      }, 500);
    }

    // Email uniqueness check
    if (name === "email") {
      setCheckingEmail(true);
      setEmailExists(false);
      if (emailCheckTimeout.current) clearTimeout(emailCheckTimeout.current);
      emailCheckTimeout.current = setTimeout(async () => {
        if (!value.trim()) {
          setCheckingEmail(false);
          setEmailExists(false);
          return;
        }
        try {
          const res = await api.get(`/auth/check-email?email=${encodeURIComponent(value.trim())}`);
          setEmailExists(res.data.exists);
        } catch {
          setEmailExists(false);
        } finally {
          setCheckingEmail(false);
        }
      }, 500);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.confirmPassword !== formData.password) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setIsLoading(true);
      const { confirmPassword, ...userData } = formData;
      
      // Use auth service instead of direct axios call
      const response = await registerUser(userData);
      
      if (response.success) {
        toast.success(response.message || 'Registration successful! Please check your email to verify your account.');
        // Redirect to login page after success
        navigate('/login');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Registration failed';
      toast.error(errorMessage);
      // Handle specific validation errors if they're returned from the API
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    // Google sign-in 
    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${import.meta.env.VITE_GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(`${import.meta.env.VITE_BACKEND_URL}/api` + '/auth/google/callback')}&response_type=code&scope=email%20profile&prompt=select_account`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
    <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900 px-4 lg:mt-20 mt-8">
      <div className="w-full max-w-md">
        <div className="card p-8">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold mb-2">Create an Account</h1>
            <p className="text-gray-600 dark:text-gray-400">Join us and start sharing your food experiences</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUser className="text-gray-400" />
                </div>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-3 py-2 rounded-lg border ${
                    errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  } bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary`}
                  placeholder="jay_patil"
                />
              </div>
                {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
                {checkingUsername && (
                  <p className="mt-1 text-sm text-gray-400">Checking username...</p>
                )}
                {usernameExists && (
                  <p className="mt-1 text-sm text-red-500">User with this username already exists!</p>
                )}
            </div>

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
              {checkingEmail && (
                <p className="mt-1 text-sm text-gray-400">Checking email...</p>
              )}
              {emailExists && (
                <p className="mt-1 text-sm text-red-500">User with this email already exists!</p>
              )}
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

            <div>
              <label htmlFor="confirmPassword" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="text-gray-400" />
                </div>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-3 py-2 rounded-lg border ${
                    errors.confirmPassword ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  } bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary`}
                  placeholder="********"
                  />
                <button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer z-10" onClick={() => setShowConfirmPassword((prev) => !prev)}>
                    {showConfirmPassword ? <FaEyeSlash className="text-gray-400"/> : <FaEye className="text-gray-400"/>}
                </button>
              </div>
              {errors.confirmPassword && <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>}
            </div>

            <div className="flex items-center">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                I agree to the{' '}
                <Link to="/terms" className="text-primary hover:underline">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-primary hover:underline">
                  Privacy Policy
                </Link>
              </label>
            </div>

            <button
              type="submit"
              className="w-full btn btn-primary py-3 flex items-center justify-center disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isLoading || usernameExists || checkingUsername || emailExists || checkingEmail || !!errors.name}
            >
              {isLoading ? (
                <>
                  <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></span>
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">Or sign up with</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center gap-2 btn border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 py-3"
            >
              <FaGoogle className="text-red-500" />
              <span>Sign up with Google</span>
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
    </motion.div>
  );
};

export default Register; 