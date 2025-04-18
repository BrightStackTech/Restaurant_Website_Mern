import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from "framer-motion";
import { FaTimes, FaArrowLeft } from "react-icons/fa";
import api from '../api/config';
import { useNavigate } from 'react-router-dom';

const PublicProfile = () => {
  const { username } = useParams<{ username: string }>();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showImageDialog, setShowImageDialog] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // You need a backend endpoint like /api/users/by-username/:username
        const res = await api.get(`/users/by-username/${username}`);
        setUser(res.data.data);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [username]);

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (!user) {
    return <div className="flex justify-center items-center min-h-screen">User not found</div>;
  }

    const formatJoinedDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'long' });
    const year = date.getFullYear();
    // Ordinal suffix
    const getOrdinal = (n: number) => {
        if (n > 3 && n < 21) return 'th';
        switch (n % 10) {
        case 1: return 'st';
        case 2: return 'nd';
        case 3: return 'rd';
        default: return 'th';
        }
    };
    return `${day}${getOrdinal(day)} ${month}, ${year}`;
    };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-md mx-auto p-6 mt-20 ">
        <button
            onClick={() => navigate(-1)}
            className="flex items-center text-primary-600 hover:text-primary-700 mb-6"
        >
            <FaArrowLeft className="mr-2" /> Back
        </button>
        <h1 className="text-3xl font-bold mb-6 text-center">Public Profile</h1>
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 flex flex-col items-center space-y-6 ">
          <img
            onClick={() => setShowImageDialog(true)}
            src={user.profilePicture ? user.profilePicture + '?v=' + user.updatedAt : "/default-avatar.png"}
            alt="Profile"
            className="w-32 h-32 rounded-full object-cover cursor-pointer"
          />
          <div className="text-center">
            <p className="text-xl font-semibold text-gray-900 dark:text-white">{user.name}</p>
            {/* <p className="text-gray-600 dark:text-gray-300 mb-4">{user.email}</p> */}
            <p className="text-gray-600 dark:text-gray-300 text-sm">Joined At:</p>
            <p className="text-gray-600 dark:text-gray-300">
            {formatJoinedDate(user.createdAt)}
            </p>
          </div>
        </div>
      </div>
      {showImageDialog && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50"
          onClick={() => setShowImageDialog(false)}
        >
          <div
            className="relative overflow-hidden rounded-xl shadow-lg"
            onClick={e => e.stopPropagation()}
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
    </motion.div>
  );
};

export default PublicProfile;