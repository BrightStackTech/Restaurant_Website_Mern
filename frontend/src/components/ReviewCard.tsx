import React, { useState, useRef, useEffect } from 'react';
import { FaThumbsUp, FaThumbsDown, FaReply, FaEllipsisV, FaTimes, FaTrash} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import ReplyReviewCard from './ReplyReviewCard';
import { getReplyById, deleteReply } from '../api/reply.service';
import { Reply } from '../types';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

interface Review {
  id: string;
  _id?: string;
  content: string;
  createdAt: string;
  user: {
    _id?: string;
    name: string;
    profilePicture?: string;
  };
  likeCount?: number;
  dislikeCount?: number;
  images?: string[];
  likedBy?: string[];
  dislikedBy?: string[];
  replies?: string[];
  product?: string;
}

// Update onReply to accept reply text from admin
interface ReviewCardProps {
  review: Review;
  onDelete: (id: string) => void;
  onLike: (id: string) => void;
  onDislike: (id: string) => void;
  onReply: (review: Review, replyContent: string) => void;
}

const getRelativeTime = (dateStr: string): string => {
  // ... existing implementation
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

const ReviewCard: React.FC<ReviewCardProps> = ({ review, onDelete, onLike, onDislike, onReply }) => {
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  // New state for admin reply
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState('');
  const { state } = useAuth();
  const currentUser = state.user;

  const dropdownRef = useRef<HTMLDivElement>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
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

  useEffect(() => {
    const fetchReplies = async () => {
      if (review.replies && review.replies.length > 0) {
        const replyObjs = await Promise.all(
          review.replies.map(async (replyId: any) => {
            try {
              // Ensure we're using a string ID
              const replyIdStr = typeof replyId === 'object' && replyId !== null
                ? (replyId._id || replyId.id || String(replyId))
                : String(replyId);

              console.log('Fetching reply with ID:', replyIdStr);
              const res = await getReplyById(replyIdStr);
              return res.data;
            } catch (error) {
              console.error('Error fetching reply:', error);
              return null; // If 404, return null
            }
          })
        );
        setReplies(replyObjs.filter((r): r is Reply => !!r)); // Only keep found replies
      }
    };
    fetchReplies();
  }, [review.replies]);

  const defaultProfile =
    "https://res.cloudinary.com/dvb5mesnd/image/upload/v1741339315/Screenshot_2025-03-07_145028-removebg-preview_mqw8by.png";

  return (
    <>
      <div className='border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0 last:pb-0 w-full flex-col'>
        <div className="flex justify-between items-start pb-4 last:pb-0 w-full">
          <div className="flex">
            <img
              src={review.user.profilePicture || defaultProfile}
              alt={review.user.name}
              className="w-10 h-10 rounded-full object-cover cursor-pointer"
              onClick={() => setShowProfileModal(true)}
            />
            <div className="ml-4">
              <div className="flex items-center">
                <h3 className="font-semibold dark:text-white hover:underline dark:hover:text-primary hover:text-primary cursor-pointer" onClick={()=>navigate(`/user/${review.user.name}`)}>{review.user.name}</h3>
                <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                  ({getRelativeTime(review.createdAt)})
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mt-1">{review.content}</p>
              {review.images && review.images.length > 0 && (
                <div className="flex space-x-4 overflow-x-auto mt-2">
                  {review.images.map((img, index) => (
                    <img
                      key={index}
                      src={img}
                      alt={`Review Image ${index + 1}`}
                      className="w-16 lg:w-24 lg:h-24 h-16 object-cover rounded cursor-pointer"
                      onClick={() => setSelectedImage(img)}
                    />
                  ))}
                </div>
              )}
              <div className="flex items-center space-x-2 mt-2">
                <div className="bg-gray-200 dark:bg-gray-700 rounded-lg px-2 py-1 text-sm">
                  <button
                    onClick={() => {
                      if (!currentUser) {
                        navigate('/login');
                        toast.error('Please log in to like a review');
                        return;
                      }
                      onLike(review.id || review._id!);
                    }}
                    className={`flex items-center ${currentUser && review.likedBy && review.likedBy.map(String).includes(currentUser._id)
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-gray-500 dark:text-gray-300'
                      }`}
                  >
                    <FaThumbsUp className="mr-2" /> {review.likeCount || 0}
                  </button>
                </div>
                <div className="bg-gray-200 dark:bg-gray-700 rounded-lg px-2 py-1 text-sm">
                  <button
                    onClick={() => {
                      if (!currentUser) {
                        navigate('/login');
                        toast.error('Please log in to dislike a review');
                        return;
                      }
                      onDislike(review.id || review._id!);
                    }}
                    className={`flex items-center ${currentUser && review.dislikedBy && review.dislikedBy.map(String).includes(currentUser._id)
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-gray-500 dark:text-gray-300'
                      }`}
                  >
                    <FaThumbsDown className="mr-2" /> {review.dislikeCount || 0}
                  </button>
                </div>
                {currentUser?.isAdmin && (
                  <div className="bg-gray-200 dark:bg-gray-700 rounded-lg px-2 py-1 text-sm">
                    <button
                      onClick={() => setIsReplying(prev => !prev)}
                      className="flex items-center text-gray-500 dark:text-gray-300 hover:text-primary dark:hover:text-primary"
                    >
                      <FaReply className="mr-1" /> Reply
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="relative">
            {currentUser && review.user && typeof review.user === 'object' &&
              (currentUser._id === review.user._id || currentUser.isAdmin) && (
                <button title="Options" onClick={toggleDropdown} className="text-gray-500 dark:text-gray-300 hover:text-primary">
                  <FaEllipsisV />
                </button>
              )}
            {dropdownVisible && (
              <div ref={dropdownRef} className="dropdown absolute right-0 mt-2 w-32 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-lg z-10">
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  title="Delete Review"
                  className="w-full text-left px-4 py-2 text-gray-100 dark:text-gray-300 font-semibold bg-red-600 hover:bg-red-700"
                >
                  <FaTrash className="inline mr-2" /> Delete
                </button>
              </div>
            )}
          </div>
        </div>
        {review.replies && review.replies.length > 0 && (
          <div className="mt-1 mb-4 border-l-2  border-gray-200 dark:border-gray-700 ml-10">
            {replies.map(reply => (
              <ReplyReviewCard key={reply._id} reply={reply}
                onDelete={async (id) => {
                  try {
                    const response = await deleteReply(id);
                    if (response.success) {
                      toast.success('Reply deleted successfully');
                      // Update local state to remove the deleted reply
                      setReplies(prev => prev.filter(r => r._id !== id));
                    }
                  } catch (error) {
                    toast.error('Failed to delete reply');
                    console.error("Error deleting reply:", error);
                  }
                }} />
            ))}
          </div>
        )}
        {/* Admin Reply Input (only for admin replies) */}
        {currentUser?.isAdmin && isReplying && (
          <div className='border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0 last:pb-0'>
            <div className='mt-4 p-2 bg-gray-100 dark:bg-gray-700 rounded-lg flex-col '>
              <div className="flex items-center ">
                <img
                  src={currentUser.profilePicture || defaultProfile}
                  alt="Admin Profile"
                  className="w-8 h-8 rounded-full object-cover mr-2"
                />
                <textarea
                  value={replyText}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setReplyText(e.target.value)}
                  placeholder="Enter your reply..."
                  className="flex-grow p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div className="flex space-x-2 ml-2 mt-2 justify-end">
                <button
                  onClick={() => {
                    setReplyText('');
                    setIsReplying(false);
                  }}
                  className="px-3 py-1 bg-gray-300 text-gray-900 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    console.log("Post button clicked");
                    if (replyText.trim()) {
                      try {
                        await onReply(review, replyText);
                        setReplyText('');
                        setIsReplying(false);
                      } catch (err) {
                        // Optionally show a toast here if you want
                        console.error("Reply failed", err);
                      }
                    }
                  }}
                  className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Post
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal for image view */}
      {selectedImage && (
        <div
          onClick={() => setSelectedImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80"
        >
          <div onClick={e => e.stopPropagation()} className="relative">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-2 right-2 text-white text-3xl hover:text-red-400"
              title="Close image"
            >
              <FaTimes />
            </button>
            <img
              src={selectedImage}
              alt="Selected Review"
              className="max-w-80 h-auto lg:max-h-[500px] lg:max-w-full rounded"
            />
          </div>
        </div>
      )}



      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <p className="mb-4">
              Are you sure you want to delete this review for this dish?
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
                  const reviewId = String(review._id || review.id);
                  onDelete(reviewId);
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
                  className="absolute top-2 right-2 text-white text-3xl hover:text-red-400"
                  title="Close image"
                >
                  <FaTimes />
                </button>
                <img
                  src={review.user.profilePicture || defaultProfile}
                  alt={review.user.name}
                  className="w-auto lg:h-[500px] h-[300px] rounded-lg object-cover"
                />
              </div>
            </div>
          )}
    </>
  );
};

export default ReviewCard;