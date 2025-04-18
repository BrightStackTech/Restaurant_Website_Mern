import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import ProductCard from '../components/ProductCard';
import { getAllProducts } from '../api/products.service';
import { toast } from 'react-hot-toast';
import { Product } from '../types';
import ChatBotActionButton from '../components/ChatBotActionButton';
import ChatBotDrawer from '../components/ChatBotDrawer';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [chatOpen, setChatOpen] = useState(false);


  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setLoading(true);
        const response = await getAllProducts();
        // Optionally filter featured products if needed,
        // for now we assume all products are featured
        setFeaturedProducts(response.data || []);
      } catch (error) {
        console.error('Error fetching products:', error);
        toast.error('Failed to load featured dishes');
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);
  return (
    <div className="pt-16">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://res.cloudinary.com/domckasfk/image/upload/v1744989128/Screenshot_2025-04-18_204104_yigs4v.png" 
            alt="Hero" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-60"></div>
        </div>
        
        <div className="container relative z-10 text-white">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Delicious Chinese Food for Every Mood
            </h1>
            <p className="text-xl mb-8 text-gray-300">
              Experience the variety of chinese dieshes prepared by our expert chefs using fresh ingredients.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/menu" className="btn btn-primary">
                Explore Menu
              </Link>
              <Link to="/payment" className="btn btn-primary">
                Pay your Bill
              </Link>
              <Link to="/about" className="btn btn-outline border-white text-white hover:bg-white hover:text-gray-900">
                About Us
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* Featured Products */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Explore Dishes</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Discover our most popular dishes that customers love. Made with the freshest ingredients and authentic recipes.
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
            </div>
          ) : featuredProducts.length === 0 ? (
            <div className="text-center text-gray-400">
              No featured dishes found.
            </div>
          ) : (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              {featuredProducts.slice(0, 4).map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </motion.div>
          )}

          <div className="text-center mt-12">
            <Link to="/menu" className="btn btn-primary">
              View All Menu
            </Link>
          </div>
        </div>
      </section>
      
      {/* About Section */}
      <section className="py-20">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <img 
                src="https://res.cloudinary.com/domckasfk/image/upload/v1744989541/Screenshot_2025-04-18_204848_juihqo.png" 
                alt="Restaurant interior" 
                className="rounded-lg shadow-lg"
              />
            </div>
            
            <div>
              <h2 className="text-3xl font-bold mb-6">About {import.meta.env.VITE_RESTAURANT_NAME}</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Located in the vibrant heart of Virar East, {import.meta.env.VITE_RESTAURANT_NAME} Fast Food Centre is a cherished culinary haven where tradition meets innovation. 
              </p>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Known for its commitment to quality ingredients, delightful flavors, and exceptional service, {import.meta.env.VITE_RESTAURANT_NAME} Fast Food Centre invites you to savor a dining experience like no other.
              </p>
              
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <span className="text-3xl font-bold text-primary">15+</span>
                  <span className="text-gray-600 dark:text-gray-400">Years Experience</span>
                </div>
                <div className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <span className="text-3xl font-bold text-primary">50+</span>
                  <span className="text-gray-600 dark:text-gray-400">Menu Items</span>
                </div>
              </div>
              
              <Link to="/about" className="btn btn-primary">
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>
      <ChatBotActionButton onClick={() => setChatOpen(true)} />
      <ChatBotDrawer open={chatOpen} onClose={() => setChatOpen(false)} />
    </div>
  );
};

export default Home; 