import { Link } from 'react-router-dom';
import { FaStar, FaArrowRight } from 'react-icons/fa';
import { Product, Rating } from '../types';
import { useState } from 'react';

// Define a union type that accommodates both formats
type ProductCardType = (Product | {
  id?: string;
  _id?: string;
  name: string;
  description: string;
  price: number;
  halfPrice?: number;
  image: string;
  media?: string[];
  rating?: number;
  averageRating?: number;
  reviews?: number;
  numReviews?: number;
  category?: string;
  vegornon?: string;
  ratingvalue?: number;
}) & { ratings?: Rating[] };

interface ProductCardProps {
  product: ProductCardType;
  showCategory?: boolean;
  linkToDetail?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  showCategory = false,
  linkToDetail = true,
}) => {
  const [isFullPortion, setIsFullPortion] = useState(true);
  // Handle both Home page product format and Menu page product format
  const productId =
    'id' in product && product.id
      ? product.id
      : '_id' in product && product._id
      ? product._id
      : '';
  // const rating =
  //   'averageRating' in product && product.averageRating
  //     ? product.averageRating
  //     : 'rating' in product && product.rating
  //     ? product.rating
  //     : 0;
  // const reviews =
  //   'numReviews' in product && product.numReviews
  //     ? product.numReviews
  //     : 'reviews' in product && product.reviews
  //     ? product.reviews
  //     : 0;
      
  // Use the first media image if available, otherwise fall back to product.image.
  const primaryImage =
    product.media && product.media.length > 0
      ? product.media[0]
      : product.image;

  return (
    <div className="card group">
      <div className="relative overflow-hidden">
        <img
          src={primaryImage}
          alt={product.name}
          className="w-full h-60 object-cover transition-transform duration-300 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-black bg-opacity-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>

      <div className="p-6">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-semibold text-lg">{product.name}</h3>
          <span className="text-black dark:text-primary font-medium">
            ₹{(isFullPortion ? product.price : (product.halfPrice || product.price)).toFixed(2)}
          </span>
        </div>

        {(showCategory && product.category) || product.vegornon ? (
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center space-x-2">{/* New wrapper div for left items */}
              {showCategory && product.category && (
                <span className="inline-block px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full">
                  {product.category}
                </span>
              )}
              {product.vegornon && (
                <span
                  className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                    product.vegornon.toLowerCase() === 'veg'
                      ? 'bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-300'
                      : 'bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-300'
                  }`}
                >
                  {product.vegornon.toLowerCase() === 'veg' ? 'Veg' : 'NonVeg'}
                </span>
              )}
            </div>
            {product.halfPrice && (
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={isFullPortion}
                  onChange={(e) => setIsFullPortion(e.target.checked)}
                />
                <div className="flex items-center bg-gray-300/90 dark:bg-gray-700/90 backdrop-blur-sm rounded-full relative shadow-sm border border-gray-200 dark:border-gray-600 w-[86px] h-[30px] overflow-hidden">
                  <div
                    className={`absolute h-[26px] rounded-full transition-all duration-300 shadow-sm bg-gradient-to-b from-primary to-primary/90`}
                    style={{
                      width: '43px',
                      left: isFullPortion ? '2px' : 'calc(100% - 45px)',
                      transition: 'all 0.3s ease-in-out',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.3)',
                    }}
                  />
                  <span 
                    className={`relative px-3 py-1 text-xs font-medium z-10 transition-all duration-200 w-1/2 text-center ${
                      isFullPortion ? 'text-white' : 'dark:text-gray-300 text-black'
                    }`}
                  >
                    Full
                  </span>
                  <span 
                    className={`relative px-3 py-1 text-xs font-medium z-10 transition-all duration-200 w-1/2 text-center ${
                      !isFullPortion ? 'text-white' : 'dark:text-gray-300 text-black'
                    }`}
                  >
                    Half
                  </span>
                </div>
              </label>
            )}
          </div>
        ) : null}

        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
          {product.description}
        </p>

        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <FaStar className="text-yellow-400 mr-1" />
            <span>{product.ratingvalue?.toFixed(1)} </span>
            <span className="text-gray-500 text-sm ml-1">({product.ratings?.length || 0} ratings)</span>
          </div>

          {linkToDetail ? (
            <Link
              to={`/menu/${productId}`}
              className="text-primary flex items-center hover:underline"
            >
              <span className="mr-1">View</span>
              <FaArrowRight size={12} />
            </Link>
          ) : (
            <button className="btn btn-primary text-sm px-3 py-1">
              Add to Cart
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
