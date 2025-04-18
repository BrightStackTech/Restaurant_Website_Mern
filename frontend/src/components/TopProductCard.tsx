import { FaStar } from 'react-icons/fa';

interface TopProductCardProps {
  product: {
    name: string;
    media?: string[];
    image?: string;
    ratingvalue: number;
    price: number;
    category: string;
    vegornon?: string;
  };
}

const TopProductCard: React.FC<TopProductCardProps> = ({ product }) => {
  const bgImage =
    product.media && product.media.length > 0
      ? product.media[0]
      : product.image || 'https://via.placeholder.com/400x250?text=No+Image';

  return (
    <div
    className="relative rounded-xl overflow-hidden shadow-lg min-h-[320px] flex flex-col justify-end group"
    >
    {/* Background image with zoom on hover */}
        <div
            className="absolute inset-0 transition-transform duration-500 ease-in-out scale-100 group-hover:scale-105"
            style={{
            backgroundImage: `url(${bgImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            zIndex: 0,
            }}
        />
      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-50 p-6"> <h2 className="text-xl font-bold mb-4 dark:text-white">Top Rated Product for this month</h2></div>
      {/* Content */}
      <div className="relative z-10 p-6 text-white">
        {/* Title */}
        <h3 className="text-2xl font-bold mb-2">{product.name}</h3>
        {/* Ratings */}
        <div className="flex items-center mb-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <FaStar
              key={i}
              className={`w-5 h-5 mr-1 ${
                i <= Math.round(product.ratingvalue)
                  ? 'text-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          ))}
          <span className="ml-2 text-sm font-medium">
            {product.ratingvalue?.toFixed(1)}
          </span>
        </div>
        {/* Price */}
        <div className="text-xl font-semibold mb-2">
          ₹{product.price?.toFixed(2)}
        </div>
        {/* Category & Veg/Non-Veg */}
        <div className="flex items-center space-x-2">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white bg-opacity-80 text-gray-900">
            {product.category}
          </span>
          {product.vegornon && (
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold bg-opacity-80 ${
                product.vegornon.toLowerCase() === 'veg'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {product.vegornon.toLowerCase() === 'veg' ? 'Veg' : 'Non-Veg'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopProductCard;