import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const EmailVerify = () => {
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'success' | 'error'>('pending');
  const [message, setMessage] = useState('Verifying your email...');
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const effectRan = useRef(false);

  useEffect(() => {
    if (effectRan.current) return; // Prevent second execution in Strict Mode
    effectRan.current = true;

    const verifyEmail = async (retryCount = 3) => {
      if (!token) {
        setVerificationStatus('error');
        setMessage('Invalid verification link. No token provided.');
        toast.error('Invalid verification link');
        return;
      }

      try {
        const apiUrl = `${`${import.meta.env.VITE_BACKEND_URL}/api`|| 'http://localhost:8000/api'}/auth/verify-email/${token}`;
        const response = await axios.get(apiUrl);

        if (response.data.success) {
          setVerificationStatus('success');
          setMessage(response.data.message || 'Your email has been successfully verified!');
          toast.success('Email verified successfully!');
          setTimeout(() => navigate('/login?verified=true'), 3000);
        } else {
          throw new Error(response.data.message || 'Verification failed');
        }
      } catch (error: any) {
        console.error('Verification error:', error);

        if (retryCount > 0) {
          setTimeout(() => verifyEmail(retryCount - 1), 2000);
        } else {
          const errorMessage = error.response?.data?.message || 'Email verification failed. The link may be invalid or expired.';
          setVerificationStatus('error');
          setMessage(errorMessage);
          toast.error(errorMessage);
        }
      }
    };

    verifyEmail();
  }, [token, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 px-4">
      <div className="w-full max-w-md">
        <div className="card p-8 text-center">
          {verificationStatus === 'pending' && (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
              <h2 className="text-2xl font-bold mb-4">Email Verification</h2>
              <p className="text-gray-600 dark:text-gray-400">{message}</p>
            </>
          )}

          {verificationStatus === 'success' && (
            <>
              <div className="bg-green-100 dark:bg-green-900 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600 dark:text-green-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold mb-4 text-green-600 dark:text-green-400">Verification Successful</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">{message}</p>
              <p className="text-gray-600 dark:text-gray-400">Redirecting you to login...</p>
              <Link to="/login?verified=true" className="mt-4 inline-block text-primary hover:underline">
                Click here if you are not redirected automatically
              </Link>
            </>
          )}

          {verificationStatus === 'error' && (
            <>
              <div className="bg-red-100 dark:bg-red-900 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600 dark:text-red-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold mb-4 text-red-600 dark:text-red-400">Verification Failed</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">{message}</p>
              <div className="space-y-4">
                <Link to="/login" className="btn btn-primary block">
                  Back to Login
                </Link>
                <Link to="/register" className="text-primary hover:underline block">
                  Create a new account
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailVerify; 