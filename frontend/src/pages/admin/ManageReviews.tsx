import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaEye, FaTrash } from 'react-icons/fa';
import { deleteReview } from '../../api/reviews.service';
import toast from 'react-hot-toast';
import { getAllReviews } from '../../api/reviews.service';
import { Reply, User } from '../../types';

export interface Review {
  id: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
  user: User | string;
  product: string | { name: string };
  images?: string[];
  likeCount?: number;
  dislikeCount?: number;
  replies?: Reply[];
  likedBy?: string[];     // New field: array of user IDs who liked the review
  dislikedBy?: string[];  // New field: array of user IDs who disliked the review
}

const ManageReviews = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<string | null>(null);
  const navigate = useNavigate();

  // Fetch reviews (mock data in this case)

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await getAllReviews();
        if (response.success && response.data) {
          // Map _id to id for consistency
          const mapped = response.data.map((r: any) => ({
            ...r,
            id: r.id || r._id,
          }));
          setReviews(mapped);
        } else {
          toast.error(response.message || 'Failed to fetch reviews');
        }
      } catch (error) {
        console.error('Error fetching reviews:', error);
        toast.error('Failed to fetch reviews.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchReviews();
  }, []);

  // Helper function to format the date (can be adjusted as needed)
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filter reviews based on search term (if needed). For now, we are using the full list.
const filteredReviews = reviews.filter(review => {
  const userName =
    typeof review.user === 'object' && review.user !== null
      ? review.user.name
      : review.user;

  const productName =
    typeof review.product === 'object' && review.product !== null
      ? review.product.name
      : review.product;

  return (
    userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    review.content.toLowerCase().includes(searchTerm.toLowerCase())
  );
});

  // Delete review: trigger confirmation dialog.
  const handleDeleteClick = (id: string) => {
    setReviewToDelete(id);
    setIsDeleting(true);
  };

  // Confirm deletion: call deleteReview from the service
  const confirmDelete = async () => {
    if (reviewToDelete) {
      try {
        const response = await deleteReview(reviewToDelete);
        if (response.success) {
          setReviews(prev =>
            prev.filter(r => (r.id || (r as any)._id) !== reviewToDelete)
          );
          toast.success('Review deleted successfully');
        } else {
          toast.error(response.message || 'Failed to delete review');
        }
      } catch (error) {
        toast.error('Failed to delete review');
      } finally {
        setIsDeleting(false);
        setReviewToDelete(null);
      }
    }
  };

  // Cancel the delete confirmation
  const cancelDelete = () => {
    setIsDeleting(false);
    setReviewToDelete(null);
  };

  // Function to redirect to the product page via the "eye" button.
  const handleViewProduct = (product: string | { name: string; id?: string; _id?: string }) => {
    let productId: string;
    if (typeof product === 'object' && product !== null) {
      productId = (product.id || product._id) as string;
    } else {
      productId = product;
    }
    navigate(`/menu/${productId}`);
  };

  return (
    <div className="container mx-auto px-4 py-8 mt-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center mb-6">
          <Link to="/admin" className="text-primary-600 hover:text-primary-800 mr-4">
            <FaArrowLeft className="inline mr-1" /> Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold dark:text-white">Manage Reviews</h1>
        </div>

        {/* Optionally, include search/filter inputs here */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:space-x-4">
            <div className="relative flex-1 mb-4 md:mb-0">
              <input
                type="text"
                placeholder="Search reviews..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Reviews Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          {isLoading ? (
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-300">Loading reviews...</p>
            </div>
          ) : filteredReviews.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-gray-600 dark:text-gray-300">No reviews found. Try a different search.</p>
            </div>
            ) : (
            <div className="overflow-x-auto w-full">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reviews</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredReviews.map(review => (
                    <tr key={review.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {typeof review.product === 'object' && review.product !== null
                            ? review.product.name
                            : review.product}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {typeof review.user === 'string' ? review.user : review.user.name}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 dark:text-white truncate max-w-xs">{review.content}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">{formatDate(review.createdAt)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-xl font-medium">
                        <button 
                          onClick={() => handleViewProduct(review.product)}
                          title="View Product" 
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-3"
                        >
                          <FaEye />
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(review.id)}
                          title="Delete Review" 
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>             
            </div>
          )}
        </div>
      </motion.div>

      {/* Delete Confirmation Modal */}
      {isDeleting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4 dark:text-white">Confirm Delete</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Are you sure you want to delete this review? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={cancelDelete}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageReviews;