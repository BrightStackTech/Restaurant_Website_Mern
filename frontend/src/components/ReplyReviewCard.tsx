import React, { useState, useRef, useEffect } from 'react';
import { FaEllipsisV, FaTrash, FaTimes } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { Reply } from '../types';
import { useNavigate } from 'react-router-dom';

// interface Reply {
//   _id: string;
//   content: string;
//   reviewId: string;
//   productId: string;
//   createdAt: string;
//   user: {
//     _id?: string;
//     name: string;
//     profilePicture?: string;
//   };
// }

interface ReplyReviewCardProps {
  reply: Reply;
  onDelete: (id: string) => void;
}

const defaultProfile = "https://res.cloudinary.com/dvb5mesnd/image/upload/v1741339315/Screenshot_2025-03-07_145028-removebg-preview_mqw8by.png";

const getRelativeTime = (dateStr: string): string => {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return `${seconds} sec${seconds !== 1 ? 's' : ''} ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min${minutes !== 1 ? 's' : ''} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr${hours !== 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days !== 1 ? 's' : ''} ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks} week${weeks !== 1 ? 's' : ''} ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months !== 1 ? 's' : ''} ago`;
  const years = Math.floor(days / 365);
  return `${years} year${years !== 1 ? 's' : ''} ago`;
};

const ReplyReviewCard: React.FC<ReplyReviewCardProps> = ({ reply, onDelete }) => {
  const { state } = useAuth();
  const currentUser = state.user;
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const canDelete = currentUser && reply.user && (currentUser._id === reply.user._id || currentUser.isAdmin);
  const user = reply.user || { name: "Unknown", profilePicture: defaultProfile };

  const [showProfileModal, setShowProfileModal] = useState(false);
  const navigate = useNavigate();

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleDocumentClick = (event: MouseEvent) => {
      if (dropdownVisible && dropdownRef.current && !(event.target as HTMLElement).closest('.dropdown')) {
        setDropdownVisible(false);
      }
    };
    document.addEventListener('mousedown', handleDocumentClick);
    return () => {
      document.removeEventListener('mousedown', handleDocumentClick);
    };
  }, [dropdownVisible]);

  const toggleDropdown = () => {
    setDropdownVisible(prev => !prev);
  };

  return (
    <div className="ml-2 border-l pl-4 py-4 border-b border-gray-200 dark:border-gray-700 last:border-0 bg-gray-100 dark:bg-gray-700 rounded-lg flex-col mt-2">
      <div className="flex items-start ">
      <img
        src={user.profilePicture || defaultProfile}
        alt={user.name}
        className="w-8 h-8 rounded-full object-cover mr-2 cursor-pointer"
        onClick={() => setShowProfileModal(true)}
      />
        <div className="flex-grow">
          <div className="flex items-center">
            <span className="font-semibold dark:text-white hover:text-primary dark:hover:text-primary hover:underline cursor-pointer" onClick={()=>navigate(`/user/${reply.user.name}`)}>{reply.user.name}</span>
            <span className="ml-2 text-xs text-gray-500">{getRelativeTime(reply.createdAt)}</span>
          </div>
          <p className="text-gray-700 dark:text-gray-300">{reply.content}</p>
        </div>
        {canDelete && (
          <div className="relative">
            <button
              title="Options"
              onClick={toggleDropdown}
              className="p-1 text-gray-500 dark:text-gray-300 hover:text-primary"
            >
              <FaEllipsisV />
            </button>
            {dropdownVisible && (
              <div ref={dropdownRef} className="dropdown absolute right-0 mt-2 w-32 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-lg z-10">
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  title="Delete Reply"
                  className="w-full text-left px-4 py-2 text-gray-100 dark:text-gray-300 font-semibold bg-red-600 hover:bg-red-700"
                >
                  <FaTrash className="inline mr-2" /> Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <p className="mb-4">
              Are you sure you want to delete this reply?
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDelete(reply._id);
                  setShowDeleteConfirm(false);
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {showProfileModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80"
          onClick={() => setShowProfileModal(false)}
        >
          <div
            className="relative"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setShowProfileModal(false)}
              className="absolute top-2 right-2 text-white text-2xl hover:text-red-400"
              title="Close image"
            >
              <FaTimes />
            </button>
            <img
              src={user.profilePicture || defaultProfile}
              alt={user.name}
              className="w-auto lg:h-[500px] h-[300px] rounded-lg object-cover"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ReplyReviewCard;