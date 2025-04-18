import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
// Optionally import jwt-decode if you want to decode and set the user directly
// import jwtDecode from 'jwt-decode';

const GoogleAuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useAuth(); // Ensure your AuthContext loads user based on token
  const toastShown = useRef(false); // Guard for toast

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Extract token from query parameters
        const params = new URLSearchParams(location.search);
        const token = params.get('token');
        
        if (!token) {
          toast.error('Authentication failed');
          navigate('/login');
          return;
        }
        
        // Store the token in local storage
        localStorage.setItem('auth_token', token);
        
        // Option A: Rely on AuthContext automatic loading
        if (!toastShown.current) {
          toastShown.current = true;
          toast.success('Successfully signed in with Google');
        }
        navigate('/');
        window.location.reload(); // Reload to ensure the user is set in context
        
        // Option B: Or, decode and update the context directly if you'd like
        // const userData = jwtDecode(token);
        // setUser(userData);
        // if (!toastShown.current) {
        //   toastShown.current = true;
        //   toast.success('Successfully signed in with Google');
        // }
        // navigate('/');
        
      } catch (error) {
        console.error('Error in Google auth callback:', error);
        toast.error('Authentication failed');
        navigate('/login');
      }
    };

    handleCallback();
  }, [location, navigate, setUser]);
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      <p className="mt-4 text-gray-600 dark:text-gray-400">Completing authentication...</p>
    </div>
  );
};

export default GoogleAuthCallback;