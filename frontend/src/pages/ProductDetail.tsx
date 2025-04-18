import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaStar, FaArrowLeft, FaPaperPlane, FaTimes, FaWhatsapp, FaRegCopy } from 'react-icons/fa';
import { getProductById } from '../api/products.service';
import { AddReplyData, Product, Rating as RatingType} from '../types';
import { getProductsByCategory } from '../api/products.service';
import ProductCard from '../components/ProductCard';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { LuImagePlus } from "react-icons/lu";
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { addRating, getProductRatings } from '../api/ratings.service'; // ensure getProductRatings exists
import { useAuth } from '../context/AuthContext';
import ReviewCard from '../components/ReviewCard';
import { addReview, deleteReview, toggleDislike, toggleLike } from '../api/reviews.service';
import axios from 'axios';
import { getReviewsByProduct } from '../api/reviews.service';
import { addReply } from '../api/reply.service';
import { FiShare } from "react-icons/fi";

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { state } = useAuth();
  const currentUser = state.user;
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  // New state for related products
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [relatedLoading, setRelatedLoading] = useState<boolean>(true);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);

  const [selectedRating, setSelectedRating] = useState<number>(0);
  const [isRatingModalOpen, setIsRatingModalOpen] = useState<boolean>(false);
  const navigate = useNavigate();
  const [review, setReview] = useState('');
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedImageFiles, setSelectedImageFiles] = useState<File[]>([]);
  const [_selectedPreviews, setSelectedPreviews] = useState<string[]>([]);

  const [isShareModalOpen, setIsShareModalOpen] = useState(false); // State to toggle modal
  const productUrl = window.location.href;
  const [inappropriateImageIndexes, setInappropriateImageIndexes] = useState<number[]>([]);
  const [checkingImages, setCheckingImages] = useState(false);


  const handleCopyLink = () => {
    navigator.clipboard.writeText(productUrl); // Copy the URL to clipboard
    toast.success('Link copied to clipboard!'); // Show toast notification
  };


  useEffect(() => {
    const fetchReviews = async () => {
      try {
        if (product?._id) {
          const response = await getReviewsByProduct(product._id);
          if (response.success && response.data) {
            setReviews(response.data);
          }
        }
      } catch (error) {
        console.error('Failed to fetch reviews:', error);
        toast.error('Failed to fetch reviews.');
      }
    };
    fetchReviews();
  }, [product]);


const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      // Remove the data URL prefix if present
      const result = reader.result as string;
      const base64 = result.split(',')[1] || result;
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
  

const checkImageSafeSearch = async (base64: string) => {
  const payload = {
    requests: [
      {
        image: { content: base64 },
        features: [{ type: "SAFE_SEARCH_DETECTION" }]
      }
    ]
  };
  const res = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${import.meta.env.VITE_VISION_API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  const annotation = data.responses?.[0]?.safeSearchAnnotation;
  // If any field is LIKELY or worse, return true (inappropriate)
  return Object.values(annotation || {}).some(
    (v) => (v as string) === "LIKELY" || (v as string) === "VERY_LIKELY" || (v as string) === "POSSIBLE"
  );
};

  // When images are selected, check them
  useEffect(() => {
    if (selectedImageFiles.length === 0) {
      setInappropriateImageIndexes([]);
      return;
    }
    let isMounted = true;
    setCheckingImages(true);
    Promise.all(selectedImageFiles.map(file => fileToBase64(file)
      .then(base64 => checkImageSafeSearch(base64))
      .catch(() => false)
    )).then(results => {
      if (!isMounted) return;
      const badIndexes = results
        .map((isBad, idx) => isBad ? idx : -1)
        .filter(idx => idx !== -1);
      setInappropriateImageIndexes(badIndexes);
      setCheckingImages(false);
    });
    return () => { isMounted = false; };
    // eslint-disable-next-line
  }, [selectedImageFiles]);


  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const files = Array.from(event.target.files);
      const previews = files.map(file => URL.createObjectURL(file));
      setSelectedImageFiles(prev => [...prev, ...files]);
      setSelectedPreviews(prev => [...prev, ...previews]);
      setSelectedImages(prev => [...prev, ...previews]); // Added this line to update selectedImages for preview
    }
  };

const handleRemoveImage = (image: string) => {
  setSelectedImages((prev) => prev.filter((img) => img !== image));
  setSelectedImageFiles((prev) => {
    // Remove the file whose preview URL matches the image
    const idx = selectedImages.findIndex((img) => img === image);
    if (idx !== -1) {
      const newFiles = [...prev];
      newFiles.splice(idx, 1);
      return newFiles;
    }
    return prev;
  });
  };
  
  const handleSend = async () => {
    if (!currentUser) {
      navigate('/login');
      toast.error('Please log in to review');
      return;
    }

    if (!review.trim() && selectedImageFiles.length === 0) {
      return; // Nothing to submit
    }
    
    // Upload each image file to Cloudinary
    const uploadedImageUrls: string[] = [];
    try {
      for (const file of selectedImageFiles) {
        const formData = new FormData();
        formData.append('file', file);
        // Ensure you set these variables in your .env file
        formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as string);
        
        const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
        const uploadResponse = await axios.post(
          `https://api.cloudinary.com/v1_1/${cloudName}/upload`,
          formData
        );
        uploadedImageUrls.push(uploadResponse.data.secure_url);
      }
    } catch (uploadError) {
      toast.error('Image upload failed.');
      return;
    }

    // Build the reviewData including the content, product id and attached image URLs
    const reviewData = {
      content: review,
      product: product!._id,
      images: uploadedImageUrls,
    };

    try {
      const response = await addReview(reviewData);
      if (response.success && response.data) {
        toast.success('Review submitted successfully!');
        window.location.reload(); // Reload the page to fetch updated reviews
        // Reset your form and image states after successful submission
        setReview('');
        setSelectedImageFiles([]);
        setSelectedPreviews([]);
      }
    } catch (error: any) {
      toast.error('Failed to submit review.');
    }
  };


  const ratingEmojis: { [key: number]: string } = {
    1: '😠',
    2: '😞',
    3: '😐',
    4: '🙂',
    5: '😄'
  };

  const handleStarClick = (rating: number) => {
    setSelectedRating(rating);
    setIsRatingModalOpen(true);
  };

  const cancelRating = async () => {
    if (product && currentUser) {
      try {
        const response = await getProductRatings(product._id);
        if (response.success && response.data) {
          // Look for the current user's rating
          const userRating = response.data.find((r: RatingType) =>
            typeof r.user === 'object'
              ? r.user._id === currentUser._id
              : r.user === currentUser._id
          );
          if (userRating) {
            setSelectedRating(userRating.rating);
          } else {
            setSelectedRating(0);
          }
        } else {
          setSelectedRating(0);
        }
      } catch (error) {
        console.error('Error fetching user rating:', error);
        setSelectedRating(0);
      } finally {
        setIsRatingModalOpen(false);
      }
    } else {
      setSelectedRating(0);
      setIsRatingModalOpen(false);
    }
  };

  const confirmRating = async () => {
    // Use product._id (or id from URL) as product id
    const productId = product ? product._id : id;
    if (!productId) {
      toast.error("Product id is missing");
      return;
    }

    if (!currentUser) { 
        navigate('/login');
       toast.error(`Please login to rate this dish`);
       return;
    }
    
    try {
      const ratingData = {
        rating: selectedRating,
        product: productId,
        comment: '',
      };

      const response = await addRating(ratingData);
      if (response.success && response.data) {
        window.location.reload(); // Reload the page to fetch updated ratings
        toast.success(`You rated this dish ${selectedRating} out of 5!`);
        // Optionally update local state for reviews or average rating here.
      }
    } catch (error: any) {
      toast.error('Rating submission failed');
    } finally {
      setIsRatingModalOpen(false);
      // Do not reset selectedRating here if you want to show it prefilled.
      // If you want to allow updating, you might keep the stars visible.
    }
  };

  const isVideo = (url: string): boolean => {
    try {
      const urlObj = new URL(url);
      return /\.(mp4|webm|ogg)$/i.test(urlObj.pathname);
    } catch (error) {
      // fallback if URL parsing fails
      return /\.(mp4|webm|ogg)$/i.test(url);
    }
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await getProductById(id!);
        if(response.data) {
          setProduct(response.data);
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProduct();
  }, [id]);

  useEffect(() => {
    const fetchUserRating = async () => {
      if (product && currentUser) {
        try {
          const response = await getProductRatings(product._id);
          if(response.success && response.data) {
            // Look for rating given by this user
            const userRating: RatingType | undefined = response.data.find(
              (r: RatingType) => (typeof r.user === 'object'
                ? r.user._id === currentUser._id
                : r.user === currentUser._id)
            );
            if(userRating) {
              setSelectedRating(userRating.rating);
            }
          }
        } catch(err) {
          console.error('Error fetching user rating:', err);
        }
      }
    };

    fetchUserRating();
  }, [product, currentUser]);

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      if (!product) return;
      try {
        setRelatedLoading(true);
        // Fetch products by category
        const response = await getProductsByCategory(product.category);
        let related = response.data || [];
        // Filter out the current product and match vegornon
        related = related.filter((p: Product) => p._id !== product._id && p.vegornon?.toLowerCase() === product.vegornon?.toLowerCase());
        setRelatedProducts(related.slice(0, 3)); // Show up to 3 related products
      } catch (error) {
        console.error('Error fetching related products:', error);
      } finally {
        setRelatedLoading(false);
      }
    };

    fetchRelatedProducts();
  }, [product]);

  if (loading || !product) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  const mediaSrc =
    product.media && product.media.length > 0
      ? product.media[currentMediaIndex]
      : product.image;
  
  { isVideo(mediaSrc) ? (
    <video 
      controls 
      className="w-full transition-transform duration-300 group-hover:scale-110"
    >
      <source src={mediaSrc} type="video/mp4" />
      Your browser does not support HTML video.
    </video>
  ) : (
    <img
      src={mediaSrc}
      alt={product.name}
      className="w-full transition-transform duration-300 group-hover:scale-110"
    />
  )
  }
  
  const handleLike = async (id: string) => {
    try {
      const response = await toggleLike(id);
      if(response.success && response.data){
        setReviews(prev => prev.map(r => 
          (r.id || r._id) === id ? { ...r, ...response.data} : r
        ));
      }
    } catch (error) {
      toast.error('Could not update like.');
    }
  };

  const handleDislike = async (id: string) => {
    try {
      const response = await toggleDislike(id);
      if(response.success && response.data){
        setReviews(prev => prev.map(r => 
          (r.id || r._id) === id ? { ...r, ...response.data} : r
        ));
      }
    } catch (error) {
      toast.error('Could not update dislike.');
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 mt-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
       <button
          onClick={() => navigate(-1)}
          className="flex items-center text-primary-600 hover:text-primary-700 mb-6"
        >
          <FaArrowLeft className="mr-2" /> Back
        </button>
        
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Product Image */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden relative w-auto h-[500px]">
            {(() => {
              console.log('Current media URL:', mediaSrc);
              console.log('isVideo(mediaSrc):', isVideo(mediaSrc));
              if (isVideo(mediaSrc)) {
                return (
                <video 
                  controls 
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                >
                  <source src={mediaSrc} type="video/mp4" />
                  Your browser does not support HTML video.
                </video>
                );
              } else {
                return (
                  <img
                    src={mediaSrc}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                );
              }
            })()}
            
            {product.media && product.media.length > 1 && (
              <>
                {currentMediaIndex > 0 && (
                  <button 
                    onClick={() => setCurrentMediaIndex(currentMediaIndex - 1)}
                    className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-gray-200 hover:bg-gray-300 text-gray-800 p-2 rounded-full"
                    title="Previous Media"
                  >
                    <FaChevronLeft />
                  </button>
                )}
                {currentMediaIndex < product.media.length - 1 && (
                  <button 
                    onClick={() => setCurrentMediaIndex(currentMediaIndex + 1)}
                    className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-gray-200 hover:bg-gray-300 text-gray-800 p-2 rounded-full"
                    title="Next Media"
                  >
                    <FaChevronRight />
                  </button>
                )}
              </>
            )}
          </div>
          
          {/* Product Details */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="mb-4">
              <span className="inline-block py-1 bg-primary-100 text-primary-800 rounded-full text-xs font-semibold uppercase dark:bg-primary-900 dark:text-primary-200">
                {import.meta.env.VITE_RESTAURANT_NAME} Presents
              </span>
            </div>
            
            <div className='flex justify-between items-center'>
              <h1 className="text-3xl font-bold mb-2 dark:text-white">{product.name}</h1>
              <div
                className="text-2xl font-bold cursor-pointer"
                onClick={() => setIsShareModalOpen(true)}
              >
                <FiShare />
              </div>
            </div>
            
            <div className="flex items-center mb-4">
              <div className="flex items-center mr-2">
                {[...Array(5)].map((_, i) => (
                  <FaStar
                    key={i}
                    className={`w-4 h-4 ${i < Math.floor(product.ratingvalue) ? 'text-yellow-400' : 'text-gray-300'}`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {product.ratingvalue?.toFixed(1)} ({product.ratings?.length || 0} ratings)
              </span>
            </div>
            
            <div className="text-2xl font-bold text-primary-600 mb-4">
              ₹{product.price.toFixed(2)}
            </div>
            
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {product.description}
            </p>
            
            {/* Availability review */}
            {product.vegornon && (
              <div className="mb-6">
                <span
                  className={`inline-block px-4 py-2 text-sm font-medium rounded-full ${
                    product.vegornon.toLowerCase() === 'veg'
                      ? 'bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-300'
                      : 'bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-300'
                  }`}
                >
                  {product.vegornon.toLowerCase() === 'veg' ? 'Veg' : 'Non-Veg'}
                </span>
                <span
                  className={`inline-block ml-2 px-4 py-2 text-sm font-medium rounded-full bg-gray-200 text-gray-900 dark:bg-gray-600 dark:text-white`}
                >
                  {product.category}
                </span>
              </div>
            )}
            {/* Rating Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-2xl font-bold dark:text-white mb-4">
              {selectedRating > 0
                ? "Thanks for rating!"
                : "Already tried this dish? Rate your experience?"}
            </h2>
            <div className="flex space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} onClick={() => handleStarClick(star)} title="ratingsbtn">
                  <FaStar
                    className={`w-8 h-8 ${star <= selectedRating ? 'text-yellow-400' : 'text-gray-400'}`}
                  />
                </button>
              ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Reviews Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-4">
          <h2 className="text-2xl font-semibold mb-6 dark:text-white">Customer Reviews</h2>
          {reviews.length > 0 ? (
            <div className="space-y-6">
              {reviews.map((review) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  onLike={(id) => {handleLike(id)}}
                  onDislike={(id) => {handleDislike(id)}}
                  onReply={async (review, replyContent) => {
                    if (!review.product) {
                      toast.error("Product ID is missing for this review.");
                      return;
                    }
                    if (!review._id) {
                      toast.error("Reviw ID is missing for this review.");
                      return;
                    }
                    const replyData: AddReplyData = {
                      content: replyContent,
                      reviewId: review._id,
                      productId: review.product
                    };
                    console.log("Reply payload:", replyData);
                    try {
                      const result = await addReply(replyData);
                      if (result.success) {
                        toast.success('Reply posted successfully!');
                        // Optionally refresh reviews here
                      }
                      if (product?._id) {
                        const response = await getReviewsByProduct(product._id);
                        if (response.success && response.data) {
                          setReviews(response.data);
                        }
                      }
                    } catch (error) {
                      toast.error('Failed to post reply');
                      console.error("Error posting reply:", error);
                    }
                  }}
                  onDelete={async (id) => {
                    try {
                      const response = await deleteReview(id);
                      if(response.success){
                        toast.success('Review deleted successfully');
                        // Option: Filter out the deleted review from state
                        setReviews(prev => prev.filter(r => (r.id || r._id) !== id));
                      }
                    } catch(error: any) {
                      toast.error('Failed to delete review');
                    }
                  }}
                />
              ))}
            </div>
          ) : (
            <p className="text-gray-600 dark:text-gray-300">No reviews yet. Be the first to review!</p>
          )}
        </div>

        {isShareModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md">
              <div className='flex justify-between items-center mb-4'>
                <h2 className="text-xl font-bold dark:text-white">Share this dish</h2>
                <button
                  title="Close Modal"
                  onClick={() => setIsShareModalOpen(false)}
                  className="text-gray-600 dark:text-gray-300 hover:text-red-500"
                >
                  <FaTimes size={20} />
                </button>
              </div>
              <div className="mb-4">
                <input
                  title='producturl'
                  type="text"
                  value={productUrl}
                  readOnly
                  className="w-full p-2 border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
             <div className="mb-4">
                <button
                  onClick={handleCopyLink}
                  className="flex items-center justify-center py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-gray-600 w-full"
                >
                  <FaRegCopy className="mr-2" /> Copy Link
                </button>
              </div>
              <div className="flex items-center space-x-4">
              <button
                onClick={() =>
                  window.open(
                    `https://api.whatsapp.com/send/?text=${encodeURIComponent(productUrl)}&type=custom_url&app_absent=0`,
                    '_blank'
                  )
                }
                className="flex items-center justify-center py-2 bg-green-500 text-white rounded hover:bg-green-600 w-full"
              >
                <FaWhatsapp className="mr-2" /> WhatsApp
              </button>
              </div>
            </div>
          </div>
        )}
        
       <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-20">
          {/* Image Previews */}
          {selectedImages.length > 0 && (
            <div className="flex flex-wrap gap-4 mb-4">
              {selectedImages.map((image, index) => (
                <div key={index} className="relative w-24 h-24">
                  <img
                    src={image}
                    alt={`Selected ${index}`}
                    className={`w-full h-full object-cover rounded cursor-pointer ${inappropriateImageIndexes.includes(index) ? 'ring-2 ring-red-500' : ''}`}
                    onClick={() => setPreviewImage(image)}
                  />
                  <button
                    title="Remove Image"
                    onClick={() => handleRemoveImage(image)}
                    className="absolute top-1 right-1 bg-gray-800 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <FaTimes />
                  </button>
                </div>
              ))}
            </div>
          )}
            {inappropriateImageIndexes.length > 0 && (
              <div className="text-red-600 font-semibold mb-2">
                You've selected inappropriate image{inappropriateImageIndexes.length > 1 ? 's' : ''}, please remove {inappropriateImageIndexes.length > 1 ? 'them' : 'it'} in order to continue.
              </div>
            )}
          {/* Textarea and Buttons */}
          <div className="flex items-center space-x-2 min-w-0 ">
            <img
              src={
                currentUser && currentUser.profilePicture
                  ? currentUser.profilePicture
                  : "https://res.cloudinary.com/dvb5mesnd/image/upload/v1741339315/Screenshot_2025-03-07_145028-removebg-preview_mqw8by.png"
              }
              alt="User Profile"
              className="w-10 h-10 rounded-full object-cover"
            />
            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              onInput={(e) => {
                const el = e.currentTarget;
                el.style.height = 'auto';
                el.style.height = el.scrollHeight + 'px';
              }}
              placeholder="Write your review, share your own experience about this dish..."
              className="flex-1 min-w-0 border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-none overflow-hidden"
              rows={1}
            />
            <div className="flex lg:flex-row flex-col lg:space-x-2 space-x-0 lg:space-y-0 space-y-2">
              <label
                htmlFor="image-upload"
                className="flex-none p-2 rounded-lg bg-gray-400 dark:bg-gray-600 text-gray-900 font-bold dark:text-white hover:bg-gray-500 dark:hover:bg-gray-900 text-xl cursor-pointer"
              >
                <LuImagePlus />
              </label>
              <input
                title="imageupload"
                id="image-upload"
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleImageSelect}
              />
              <button
                title="sendbtn"
                onClick={handleSend}
                disabled={
                  (!review.trim() && selectedImages.length === 0) ||
                  inappropriateImageIndexes.length > 0 ||
                  checkingImages
                }
                className="flex-none p-2 rounded-lg bg-gray-600 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-900 dark:hover:bg-gray-400 text-lg disabled:bg-gray-600 dark:disabled:bg-gray-900 dark:disabled:text-white disabled:cursor-not-allowed"
              >
                <FaPaperPlane />
              </button>
            </div>
          </div>

          {/* Image Preview Dialog */}
          {previewImage && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80">
              <div className="relative">
                <button
                  title="Close Preview"
                  onClick={() => setPreviewImage(null)}
                  className="absolute top-2 right-2 text-white text-3xl hover:text-red-400"
                >
                  <FaTimes />
                </button>
                <img
                  src={previewImage}
                  alt="Preview"
                  className="max-w-80 h-auto lg:max-h-[500px] lg:max-w-full rounded"
                />
              </div>
            </div>
          )}
        </div>
        
        {/* You May Also Like Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 dark:text-white">You May Also Like</h2>
          {relatedLoading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-orange-500"></div>
            </div>
          ) : relatedProducts.length > 0 ? (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              {relatedProducts.map((p) => (
                <ProductCard key={p._id} product={p} showCategory={true} linkToDetail={true} />
              ))}
            </motion.div>
          ) : (
            <p className="text-gray-600 dark:text-gray-300">No related products found.</p>
          )}
        </div>

        {/* Rating Confirmation Modal */}
        {isRatingModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-88">
              <div className="p-6">
                <h2 className="text-xl font-bold mb-4 dark:text-white">Confirm Rating</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Are you sure you want to rate this dish {selectedRating} out of 5{' '}
                  {ratingEmojis[selectedRating] ? ratingEmojis[selectedRating] : ''}?
                </p>
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={cancelRating}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmRating}
                    className="px-4 py-2 bg-red-600 dark:bg-red-800 text-white dark:text-white rounded-md hover:bg-red-700 dark:hover:bg-red-900"
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ProductDetail;