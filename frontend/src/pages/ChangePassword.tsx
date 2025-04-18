import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import ReCAPTCHA from "react-google-recaptcha";
import axios from "axios";
import { motion } from "framer-motion";

const ChangePassword = () => {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [emailExists, setEmailExists] = useState<boolean | null>(null);
  const navigate = useNavigate();

    // Debounced email existence check
    useEffect(() => {
    if (!email) {
        setEmailError("");
        setEmailExists(null);
        return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        setEmailError("Invalid email format");
        setEmailExists(null);
        return;
    }
    const timeout = setTimeout(async () => {
        try {
        const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/check-email?email=${encodeURIComponent(email)}&t=${Date.now()}`
        );
        if (res.data.exists) {
            if (res.data.googleSignIn) {
            setEmailError(
                res.data.message ||
                "This account uses Google sign-in. Use 'Sign in with Google'."
            );
            setEmailExists(false); // disables recaptcha and button
            } else {
            setEmailError("");
            setEmailExists(true);
            }
        } else {
            setEmailError("This email is not registered.");
            setEmailExists(false);
        }
        } catch {
        setEmailError("Error checking email");
        setEmailExists(null);
        }
    }, 500);
    return () => clearTimeout(timeout);
    }, [email]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setCaptchaVerified(false); // Reset captcha if email changes
  };

    const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailExists || !captchaVerified) return;
    setIsLoading(true);
    try {
        // Call backend to send reset link
        await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/auth/forgotpassword`, { email });
        toast.success(
        "If this email is registered, a reset link has been sent. Please check your inbox (and spam folder)."
        );
        navigate("/login");
    } catch (error: any) {
        toast.error(
        error?.response?.data?.message ||
            "Error sending reset email. Please try again."
        );
    } finally {
        setIsLoading(false);
    }
    };

  const handleCaptchaChange = (value: string | null) => {
    setCaptchaVerified(!!value);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900 px-4 ">
      <div className="max-w-md w-full p-6 bg-gray-100 dark:bg-gray-800 rounded-xl shadow">
        <h1 className="text-3xl font-bold mb-4">Change Password</h1>
        <form onSubmit={handleResetPassword} className="space-y-4">
          <label htmlFor="email" className="block text-lg font-semibold mb-1">
            Enter your registered email to reset your password
          </label>
            <input
            id="email"
            type="email"
            value={email}
            onChange={handleChange}
                      className={`w-full px-3 py-2 rounded-lg border ${emailError ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                          } bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary`}
            placeholder="yourname@example.com"
            autoFocus
            />
            {emailError && (
            <small className="text-red-500">{emailError}</small>
            )}
            {/* Show reCAPTCHA only if email exists, is valid, and there is no error */}
            {emailExists && !emailError && (
            <div className="mt-4">
                <ReCAPTCHA
                sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
                onChange={handleCaptchaChange}
                />
            </div>
            )}
            <button
            type="submit"
            disabled={
                isLoading || !emailExists || !captchaVerified || !!emailError
            }
            className={`w-full btn hover:bg-gray-400 py-3 flex items-center justify-center ${
                emailExists && captchaVerified && !emailError
                ? "btn-primary hover:btn-primary text-white"
                : "bg-gray-400 cursor-not-allowed"
            }`}
            >
            {isLoading ? "Sending..." : "Send Reset Link"}
            </button>
            <button
            type="button"
            onClick={() => navigate(-1)}
            disabled={isLoading}
            className={`w-full btn hover:bg-gray-400 py-3 flex items-center justify-center dark:text-white text-black`}
            >
            Cancel
            </button>
        </form>
      </div>
    </div>
    </motion.div>
  );
};

export default ChangePassword;