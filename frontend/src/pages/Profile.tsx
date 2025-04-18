import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from "framer-motion";
import { FaTimes } from "react-icons/fa";
import { deleteCurrentUser } from '../api/auth.service'; // Add this import
import LoadingOverlay from '../components/LoadingOverlay';

const Profile = () => {
  const { state } = useAuth();
  const user = state.user;
  const navigate = useNavigate();
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [showMore, setShowMore] = useState(false); // Add this line
  const [showDeleteDialog, setShowDeleteDialog] = useState(false); 
  const [confirmDeleteChecked, setConfirmDeleteChecked] = useState(false); 
  const [isDeleting, setIsDeleting] = useState(false); 

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    navigate('/login');
    window.location.reload();
  };
  
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-9xl font-bold text-primary-600 mb-4">403</h1>
        <h2 className="text-3xl font-bold mb-4 dark:text-white">User Unauthorized</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          You are not logged in. Please log in to access your profile.
        </p>
        <div className="flex justify-center space-x-4">
          <Link
            to="/"
            className="px-6 py-2 bg-primary-600 text-black dark:text-white rounded-md hover:bg-primary-700 transition hover:text-primary"
          >
            Go to Home Page
          </Link>
          <Link
            to="/login"
            className="px-6 py-2 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-white rounded-md hover:bg-primary dark:hover:bg-primary transition"
          >
            Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-md mx-auto p-6 mt-20 ">
        <h1 className="text-3xl font-bold mb-6 text-center">Your Profile</h1>
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 flex flex-col items-center space-y-6 ">
          {user.profilePicture ? (
            <img
              onClick={() => setShowImageDialog(true)}
              src={user.profilePicture ? user.profilePicture : "/default-avatar.png"}
              alt="Profile"
              className="w-32 h-32 rounded-full object-cover cursor-pointer"
            />
          ) : (
            <div className="w-32 h-32 rounded-full bg-gray-300 flex items-center justify-center">
              <span className="text-3xl text-gray-700">{user.name.charAt(0)}</span>
            </div>
          )}
          <div className="text-center">
            <p className="text-xl font-semibold text-gray-900 dark:text-white">
              {user.name}
            </p>
            <p className="text-gray-600 dark:text-gray-300">{user.email}</p>
          </div>
          <div className="flex flex-row space-x-2 w-full justify-center ">
            <button
              onClick={() => navigate('/edit-profile')}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Edit Profile
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Logout
            </button>
          </div>
          <button
            onClick={() => setShowMore(!showMore)} // Toggle showMore
            className="btn hover:bg-gray-400 py-2 px-4 flex items-center justify-center bg-transparent hover:bg-black hover:text-white dark:hover:bg-white text-black dark:text-white dark:hover:text-black border-2 border-black dark:border-white"
          >
            See More
          </button>
          {showMore && ( // Conditionally render the section
            <div className="relative my-6 border-t border-gray-300 dark:border-gray-600 w-full">
              <div className="relative flex justify-center mt-8 mb-4">
                <div className="px-2 bg-white dark:bg-gray-800 font-bold text-xl">
                  Privacy Concern bothering you? <span className="text-red-700">Dont want to stay with us?</span>
                </div>
              </div>
              <div className="flex flex-row space-x-2 w-full justify-center ">
                <button
                  onClick={() => setShowDeleteDialog(true)}
                  className="px-4 py-2 bg-red-900 text-white rounded-lg hover:bg-black transition-colors"
                >
                  Delete Your Account
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      {showImageDialog && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50"
          onClick={() => setShowImageDialog(false)}
        >
          <div
            className="relative overflow-hidden rounded-xl shadow-lg"
            onClick={e => e.stopPropagation()} // Prevent closing when clicking inside the dialog
          >
            <button
             title="btn"
              className="absolute top-2 right-2 bg-white bg-opacity-80 rounded-full p-1 hover:bg-opacity-100 transition"
              onClick={() => setShowImageDialog(false)}
            >
              <FaTimes className="text-gray-700 text-xl" />
            </button>
            <img
              src={user.profilePicture ? user.profilePicture + '?v=' + user.updatedAt : "/default-avatar.png"}
              alt="Enlarged Profile"
              className="w-96"
            />
          </div>
        </div>
      )}
      {showDeleteDialog && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50 px-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 max-w-lg w-full relative">
            <h2 className="text-2xl font-bold text-red-700 mb-4">Are you sure?</h2>
            <p className="mb-2 font-semibold">Deleting your account will lead to the following actions:</p>
            <ol className="list-decimal list-inside mb-4 text-gray-700 dark:text-gray-200">
              <li>Your Account will get <span className="font-bold text-red-700">PERMANENTLY</span> deleted and once deleted you can't recover it back</li>
              <li>Your Activity on the platform will also be erased, including:
                <ul className="list-disc list-inside ml-6">
                  <li>Your Reviews</li>
                  <li>Your Ratings</li>
                  <li>Your Like/Dislikes</li>
                </ul>
              </li>
            </ol>
            <div className="flex items-center mb-2">
              <input
                id="confirmDelete"
                type="checkbox"
                checked={confirmDeleteChecked}
                onChange={e => setConfirmDeleteChecked(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="confirmDelete" className="text-sm select-none">
                I Read all the consequences associated with deleting my account and I still want to do it
              </label>
            </div>
            <p className="text-sm text-red-500 mb-4">This is a one-time action and cannot be undone once done</p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowDeleteDialog(false)}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition-colors"
              >
                No, I take back
              </button>
              <button
                disabled={!confirmDeleteChecked || isDeleting}
                className={`px-4 py-2 rounded transition-colors font-bold ${
                  confirmDeleteChecked
                    ? "bg-red-700 text-white hover:bg-black"
                    : "bg-red-200 text-red-400 cursor-not-allowed"
                }`}
                onClick={async () => {
                  setIsDeleting(true);
                  try {
                    await deleteCurrentUser(user._id);
                    // Show loading for 3 seconds
                    setTimeout(() => {
                      setIsDeleting(false);
                      setShowDeleteDialog(false);
                      setConfirmDeleteChecked(false);
                      localStorage.removeItem('auth_token');
                      localStorage.removeItem('user');
                      localStorage.setItem('account_deleted', 'true');
                      window.location.href = '/login';
                    }, 3000);
                  } catch (error) {
                    setIsDeleting(false);
                    // Optionally show error toast
                  }
                }}
              >
                {isDeleting ? (
                  <span className="flex items-center">
                    <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    Deleting...
                  </span>
                ) : (
                  "YES, DELETE MY ACCOUNT PERMANENTLY"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      {isDeleting && <LoadingOverlay />}
    </motion.div>
  );
};

export default Profile;