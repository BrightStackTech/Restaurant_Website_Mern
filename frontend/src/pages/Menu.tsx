import { useState, useEffect } from 'react';
import { FaSearch, FaTimes } from 'react-icons/fa';
import { getAllProducts } from '../api/products.service';
import { toast } from 'react-hot-toast';
import ProductCard from '../components/ProductCard';
import { Product } from '../types';
import { motion } from 'framer-motion';
import Select from 'react-select';

const categoryOptions = [
  { value: 'starters', label: 'Starters' },
  { value: 'rice', label: 'Rice' },
  { value: 'soup', label: 'Soup' },
  { value: 'noodles', label: 'Noodles' },
  { value: 'specialities', label: 'Specialities Dry & Gravy' },
  { value: 'beverages', label: 'Beverages' },
];

const vegOptions = [
  { value: 'all', label: 'Veg & Non-veg' },
  { value: 'veg', label: 'Veg' },
  { value: 'non-veg', label: 'Non-Veg' },
];

const Menu = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showMenuCard, setShowMenuCard] = useState(false);
  // Defaults: no filter for category and veg
  const [selectedCategory, setSelectedCategory] = useState<string>(
    localStorage.getItem('menuSelectedCategory') || 'all'
  );
  const [selectedVeg, setSelectedVeg] = useState<string>(
    localStorage.getItem('menuSelectedVeg') || 'all'
  );
  const [currentPage, setCurrentPage] = useState<'veg' | 'non-veg'>('veg');

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    localStorage.setItem('menuSelectedCategory', category);
  };

  const handleVegChange = (option: any) => {
    const value = option?.value || 'all';
    setSelectedVeg(value);
    localStorage.setItem('menuSelectedVeg', value);
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await getAllProducts();
        if (response.success && response.data) {
          // Sort products by order field
          const sortedProducts = [...response.data].sort((a, b) => (a.order || 0) - (b.order || 0));
          setProducts(sortedProducts);
          setFilteredProducts(sortedProducts);
        } else {
          toast.error('Failed to load menu items');
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        toast.error('Failed to load menu items');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    if (showMenuCard) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showMenuCard]);

  useEffect(() => {
    let filtered = [...products]; // Create a copy to maintain original order

    // Filter by category if not "all"
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(
        (product) =>
          product.category &&
          product.category.toLowerCase() === selectedCategory
      );
    }

    // Then filter by veg/non-veg if not "all"
    if (selectedVeg !== 'all') {
      filtered = filtered.filter(
        (product) =>
          product.vegornon &&
          product.vegornon.toLowerCase() === selectedVeg
      );
    }

    // Then filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(term) ||
          product.description.toLowerCase().includes(term)
      );
    }

    // No need to sort again as we maintain the original sorted order
    setFilteredProducts(filtered);
  }, [searchTerm, selectedCategory, selectedVeg, products]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  return (
    <motion.div
      className="pt-24 pb-16 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto">
        {/* Heading */}
        <motion.div
          className="text-center mb-6"
          initial={{ y: +50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold mb-2">Our Menu</h1>
          <p className="dark:text-gray-400 text-gray-700 mt-10 mb-8">
            Explore our wide range of delicious chinese dishes prepared with fresh ingredients <br/> and authentic recipes.
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          className="mb-6 flex justify-start"
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="relative max-w-md w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search menu..."
              value={searchTerm}
              onChange={handleSearchChange}
              // Light mode: white bg, gray border & text; dark mode: dark bg/border/text
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 
                        focus:outline-none focus:ring-2 focus:ring-primary
                        dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            />
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          className="flex flex-col md:flex-row gap-4 justify-start mb-8"
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          {/* Category Buttons */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleCategoryChange('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === 'all'
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            All
          </button>
          {categoryOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleCategoryChange(option.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === option.value
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

          {/* Veg/Non-Veg Dropdown */}
        <div className="w-48">
          <Select
            value={vegOptions.find(option => option.value === selectedVeg)}
            onChange={handleVegChange}
            options={vegOptions}
            placeholder="Veg / Non-Veg"
            classNamePrefix="react-select"
            styles={{
              control: (base: any, _state: any) => ({
                ...base,
                backgroundColor: document.documentElement.classList.contains('dark')
                  ? "#1F2937"
                  : "#fff",
                borderColor: document.documentElement.classList.contains('dark')
                  ? "#374151"
                  : "#d1d5db",
                minHeight: "40px",
              }),
              singleValue: (base: any) => ({
                ...base,
                color: document.documentElement.classList.contains('dark')
                  ? "#fff"
                  : "#1f2937",
              }),
              menu: (base: any) => ({
                ...base,
                backgroundColor: document.documentElement.classList.contains('dark')
                  ? "#1F2937"
                  : "#fff",
              }),
              option: (base: any, state: any) => ({
                ...base,
                backgroundColor: state.isFocused
                  ? (document.documentElement.classList.contains('dark')
                      ? "#374151"
                      : "#f3f4f6")
                  : (document.documentElement.classList.contains('dark')
                      ? "#1F2937"
                      : "#fff"),
                color: document.documentElement.classList.contains('dark')
                  ? "#D1D5DB"
                  : "#1f2937",
                cursor: 'pointer'
              }),
            }}
          />
          </div>
          <button 
            className='btn btn-primary'
            onClick={() => setShowMenuCard(true)}
          >
            OR use Traditional Menu Card
          </button>
    </motion.div>

        {/* Products */}
        {loading ? (
          <motion.div
            className="flex justify-center items-center h-64"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
          </motion.div>
        ) : filteredProducts.length === 0 ? (
          <motion.div
            className="text-center text-gray-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            No products found.
          </motion.div>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            {filteredProducts.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                showCategory={true}
                linkToDetail={true}
              />
            ))}
          </motion.div>
        )}
      {showMenuCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowMenuCard(false)}
          />
          <div className="relative w-full md:h-[90vh] h-[75vh] max-w-4xl mx-4 bg-white dark:bg-gray-800 rounded-lg shadow-xl">
            <button
              onClick={() => setShowMenuCard(false)}
              className="absolute md:top-4 md:right-4 top-2 right-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors z-10"
              aria-label="Close menu card"
            >
              <FaTimes className="w-6 h-6" />
            </button>

            {/* Flip Page Button - Mobile Only */}
            <button
              onClick={() => setCurrentPage(current => current === 'veg' ? 'non-veg' : 'veg')}
              className="md:hidden absolute bottom-4 right-4 btn btn-primary z-10 "
            >
              Flip to {currentPage === 'veg' ? 'Non-Veg' : 'Veg'} Menu
            </button>

            <div className="md:h-full h-[70vh] p-4 flex flex-col">
              <h2 className="md:text-2xl text-xl font-bold dark:text-white text-center ">
                Traditional Menu Card
              </h2>
              <div className="flex-1 flex flex-col md:flex-row gap-4 justify-center items-center">
                {/* Veg Menu Page */}
                <div className={`w-full md:w-1/2 md:h-[75vh] h-[55vh] bg-gray-100 dark:bg-gray-700 rounded-lg shadow-lg transform transition-all duration-300 hover:scale-105 overflow-hidden
                  ${currentPage === 'veg' ? 'block' : 'hidden md:block'}`}>
                  <img 
                    src="https://res.cloudinary.com/dvb5mesnd/image/upload/v1753643002/veg_menu_chwsxi.jpg" 
                    alt="Veg Menu"
                    className="w-full h-full object-contain rounded-lg"
                    loading="lazy"
                  />
                </div>
                {/* Non-Veg Menu Page */}
                <div className={`w-full md:w-1/2 md:h-[75vh] h-[55vh] bg-gray-100 dark:bg-gray-700 rounded-lg shadow-lg transform transition-all duration-300 hover:scale-105 overflow-hidden
                  ${currentPage === 'non-veg' ? 'block' : 'hidden md:block'}`}>
                  <img 
                    src="https://res.cloudinary.com/dvb5mesnd/image/upload/v1753643002/nonveg_menu_we7gyb.jpg" 
                    alt="Non-Veg Menu"
                    className="w-full h-full object-contain rounded-lg"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </motion.div>
  );
};

export default Menu;