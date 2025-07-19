import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { motion } from "framer-motion";
import api from "../../api/config";
import { useAuth } from "../../context/AuthContext";

const ChangeAdminPassword = () => {
  const { state } = useAuth();
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmError, setConfirmError] = useState("");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Redirect if not admin
  useEffect(() => {
    if (!state.user?.isAdmin) {
      navigate('/profile');
      toast.error('Unauthorized access');
    }
  }, [state.user, navigate]);

  useEffect(() => {
    if (confirmPassword && newPassword !== confirmPassword) {
      setConfirmError("Passwords do not match.");
    } else {
      setConfirmError("");
    }
  }, [confirmPassword, newPassword]);

  const isFormValid = () => {
    return currentPassword && newPassword && confirmPassword && newPassword === confirmPassword;
  };

  const handleSubmit = async () => {
    try {
      const response = await api.put('/admin/change-admin-password', {
        currentPassword,
        newPassword
      });
      
      if (response.data.success) {
        toast.success('Password changed successfully!');
        navigate('/profile');
      } else {
        throw new Error(response.data.message || 'Failed to change password');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error changing password');
    }
  };

  const onFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid()) {
      toast.error("Please fill all fields correctly.");
      return;
    }
    setShowConfirmDialog(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="min-h-screen flex flex-col justify-center items-center bg-white dark:bg-gray-900 text-black dark:text-white relative px-4">
        <h1 className="text-3xl font-bold mb-4">Change Admin Password</h1>
        <form onSubmit={onFormSubmit} className="max-w-md w-full p-8 bg-gray-100 dark:bg-gray-800 rounded-xl shadow flex flex-col gap-4">
          {/* Current Password Field */}
          <div className="relative">
            <label className="block text-lg font-semibold mb-1">Current Password</label>
            <div className="relative">
              <input
                title="Current Password"
                type={showCurrentPassword ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full pl-3 pr-10 py-2 rounded-lg border bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
              <button 
                type="button" 
                className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer z-10" 
                onClick={() => setShowCurrentPassword(prev => !prev)}
              >
                {showCurrentPassword ? <FaEyeSlash className="text-gray-400" /> : <FaEye className="text-gray-400" />}
              </button>
            </div>
          </div>

          {/* New Password Field */}
          <div className="relative">
            <label className="block text-lg font-semibold mb-1">New Password</label>
            <div className="relative">
              <input
                title="New Password"
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full pl-3 pr-10 py-2 rounded-lg border bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
              <button 
                type="button" 
                className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer z-10" 
                onClick={() => setShowNewPassword(prev => !prev)}
              >
                {showNewPassword ? <FaEyeSlash className="text-gray-400" /> : <FaEye className="text-gray-400" />}
              </button>
            </div>
          </div>

          {/* Confirm Password Field */}
          <div className="relative">
            <label className="block text-lg font-semibold mb-1">Confirm New Password</label>
            <div className="relative">
              <input
                title="Confirm Password"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-3 pr-10 py-2 rounded-lg border bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
              <button 
                type="button" 
                className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer z-10" 
                onClick={() => setShowConfirmPassword(prev => !prev)}
              >
                {showConfirmPassword ? <FaEyeSlash className="text-gray-400" /> : <FaEye className="text-gray-400" />}
              </button>
            </div>
            {confirmError && <small className="text-red-500">{confirmError}</small>}
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate('/profile')}
              className="w-full btn bg-gray-500 hover:bg-gray-600 text-white py-3"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isFormValid()}
              className={`w-full btn hover:bg-gray-400 py-3 flex items-center justify-center ${
                isFormValid() ? "btn-primary hover:btn-primary text-white" : "bg-gray-400 cursor-not-allowed"
              }`}
            >
              Change Password
            </button>
          </div>
        </form>

        {/* Confirmation Dialog */}
        {showConfirmDialog && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded shadow-lg">
              <p className="mb-4 text-lg">Are you sure you want to change your admin password?</p>
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setShowConfirmDialog(false)}
                  className="px-4 py-2 rounded bg-gray-400 hover:bg-gray-500 text-white transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowConfirmDialog(false);
                    handleSubmit();
                  }}
                  className="px-4 py-2 rounded bg-green-500 hover:bg-green-600 text-white transition"
                >
                  Confirm Change
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ChangeAdminPassword;