import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const NotFound = () => {
  return (
    <div className="container mx-auto px-4 py-16 mt-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-lg mx-auto text-center"
      >
        <h1 className="text-9xl font-bold text-primary-600 mb-4">404</h1>
        <h2 className="text-3xl font-bold mb-4 dark:text-white">Page Not Found</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex justify-center space-x-4">
          <Link
            to="/"
            className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition"
          >
            Go Home
          </Link>
          <Link
            to="/menu"
            className="px-6 py-2 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-white rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition"
          >
            View Menu
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound; 