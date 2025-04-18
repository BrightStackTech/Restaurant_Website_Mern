import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaPlus, FaArrowLeft, FaSearch, FaEdit, FaTrash } from 'react-icons/fa';
import { getAllProducts } from '../../api/products.service';
import { Product } from '../../types';
import { toast } from 'react-hot-toast';
import Select from 'react-select';
import { deleteProduct } from '../../api/products.service';

const ManageProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProduct, _setCurrentProduct] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const navigate = useNavigate();

  // Mock data for categories - replace with actual categories if needed
  const categories = ['all', 'starters', 'rice', 'soup', 'noodles', 'specialities', 'beverages'];

  const categoryOptions = categories.map(cat => ({
    value: cat,
    label: cat.charAt(0).toUpperCase() + cat.slice(1)
  }));

  
  // Fetch products from backend
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const response = await getAllProducts();
        if (response.success && response.data) {
          setProducts(response.data);
        } else {
          toast.error("Failed to fetch products");
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        toast.error("Error fetching products");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Filter products based on search term and category
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Handle delete confirmation
  const handleDeleteClick = (id: string) => {
    setProductToDelete(id);
    setIsDeleting(true);
  };

  const confirmDelete = async () => {
    if (productToDelete) {
      try {
        const response = await deleteProduct(productToDelete);
        if (response.success) {
          setProducts(products.filter(p => p._id !== productToDelete));
          toast.success("Product deleted successfully");
        } else {
          toast.error(response.message || "Failed to delete product");
        }
      } catch (error: any) {
        console.error(error);
        toast.error("Error deleting product");
      } finally {
        setIsDeleting(false);
        setProductToDelete(null);
      }
    }
  };

  // Cancel delete action
  const cancelDelete = () => {
    setIsDeleting(false);
    setProductToDelete(null);
  };
  

  return (
    <div className="container mx-auto px-4 py-8 mt-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between mb-6">
          <div className="flex items-center mb-4 md:mb-0">
            <Link to="/admin" className="text-primary-600 hover:text-primary-800 mr-4">
              <FaArrowLeft className="inline mr-1" /> Back to Dashboard
            </Link>
            <h1 className="text-2xl font-bold dark:text-white">Manage Products</h1>
          </div>
          <button
            onClick={() => navigate("/admin/add-product")}
            className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 flex items-center"
          >
            <FaPlus className="mr-2" /> Add New Product
          </button>
        </div>

        {/* Search and Filter */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:space-x-4">
            <div className="relative flex-1 mb-4 md:mb-0">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div className="flex-shrink-0">
              <Select
                options={categoryOptions}
                value={categoryOptions.find(option => option.value === selectedCategory)}
                onChange={option => setSelectedCategory(option?.value || 'all')}
                className="lg:w-[200px] w-full"
                classNamePrefix="react-select"
                placeholder="Filter by category"
                styles={{
                  control: (provided) => {
                    const isDark = document.documentElement.classList.contains("dark");
                    return {
                      ...provided,
                      backgroundColor: isDark ? "#2d3748" : "#fff",
                      borderColor: isDark ? "#4a5568" : provided.borderColor,
                      color: isDark ? "#fff" : provided.color,
                    };
                  },
                  menu: (provided) => {
                    const isDark = document.documentElement.classList.contains("dark");
                    return {
                      ...provided,
                      backgroundColor: isDark ? "#2d3748" : "#fff",
                    };
                  },
                  singleValue: (provided) => {
                    const isDark = document.documentElement.classList.contains("dark");
                    return {
                      ...provided,
                      color: isDark ? "#fff" : provided.color,
                    };
                  },
                  option: (provided, state) => {
                    const isDark = document.documentElement.classList.contains("dark");
                    return {
                      ...provided,
                      backgroundColor: state.isFocused
                        ? (isDark ? "#4a5568" : "#f0f0f0")
                        : (isDark ? "#2d3748" : "#fff"),
                      color: isDark ? "#fff" : "#000",
                    };
                  },
                }}
              />
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          {isLoading ? (
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-300">Loading products...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-gray-600 dark:text-gray-300">No products found. Try a different search or category.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Image</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Veg/Non-Veg</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredProducts.map(product => {
                // Compute primary image from the media array if available, otherwise fallback to product.image
                const primaryImage =
                  product.media && product.media.length > 0
                    ? product.media[0]
                    : product.image;
                return (
                  <tr key={product._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="w-12 h-12 rounded-md overflow-hidden">
                        <img
                          src={primaryImage}
                          alt={product.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'https://via.placeholder.com/150?text=No+Image';
                          }}
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link to={`/menu/${product._id}`} className="flex items-center space-x-2">
                        <div className="text-sm font-medium text-gray-900 dark:text-white underline">
                          {product.name}
                        </div>
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        ₹{product.price.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200">
                        {product.category.charAt(0).toUpperCase() +
                          product.category.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          product.vegornon?.toLowerCase() === 'veg'
                            ? 'bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-300'
                            : 'bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-300'
                        }`}
                      >
                        {product.vegornon
                          ? product.vegornon.toLowerCase() === 'veg'
                            ? 'Veg'
                            : 'Non-Veg'
                          : ''}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => navigate(`/admin/edit-product/${product._id}`)}
                        className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300 mr-3"
                        title="Edit Product"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(product._id)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        title="Delete Product"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                );
              })}
              </tbody>
            </table>
          </div>
          )}
        </div>
      </motion.div>

      {/* Add/Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4 dark:text-white">
                {currentProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
              <form className="space-y-4">
                {/* Form fields would go here */}
                <p className="text-gray-600 dark:text-gray-300">
                  This is a placeholder for the product form. In a real app, you would add form fields here.
                </p>
                <div className="flex justify-end space-x-2 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                  >
                    {currentProduct ? 'Save Changes' : 'Add Product'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4 dark:text-white">Confirm Delete</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Are you sure you want to delete this product? This action cannot be undone.
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

export default ManageProducts;