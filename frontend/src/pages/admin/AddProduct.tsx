import { useState, ChangeEvent, FormEvent, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../../api/config';
import { FaArrowLeft, FaPlus } from "react-icons/fa";
import Select from 'react-select';
import LoadingOverlay from '../../components/LoadingOverlay'

// Define dropdown options first
const vegOrNonOptions = [
  { value: 'veg', label: 'Veg' },
  { value: 'non-veg', label: 'Non-Veg' },
];

const categoryOptions = [
  { value: 'starters', label: 'Starters' },
  { value: 'rice', label: 'Rice' },
  { value: 'soup', label: 'Soup' },
  { value: 'noodles', label: 'Noodles' },
  { value: 'specialities', label: 'Specialities Dry & Gravy' },
  { value: 'beverages', label: 'Beverages' },
];

const AddProduct = () => {
  const navigate = useNavigate();
  // Set default category to first option to prevent empty validation error.
  const [productData, setProductData] = useState({
    name: '',
    price: '',
    vegornon: 'veg',
    category: categoryOptions[0].value,
    description: ''
  });
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [selectedMedia, setSelectedMedia] = useState<File | null>(null); // State for modal
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setProductData({ ...productData, [e.target.name]: e.target.value });
  };

  const handleMediaChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setMediaFiles([...mediaFiles, e.target.files[0]]);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const removeMediaField = (index: number) => {
    const newMediaFiles = mediaFiles.filter((_, i) => i !== index);
    setMediaFiles(newMediaFiles);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      mediaFiles.forEach(file => {
        if (file) formData.append('media', file);
      });
      formData.append('name', productData.name);
      formData.append('price', productData.price);
      formData.append('vegornon', productData.vegornon);
      formData.append('category', productData.category);
      formData.append('description', productData.description);
      
      const response = await api.post('/products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        toast.success('Product added successfully!');
        navigate('/admin/products');
      } else {
        throw new Error(response.data.message || 'Failed to add product');
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
      <div className="container mx-auto px-4 py-8 mt-12">
      {isSubmitting && <LoadingOverlay />}
      <div className="flex items-center mb-4 md:mb-0">
        <Link to="/admin/products" className="text-primary-600 hover:text-primary-800 mr-4">
          <FaArrowLeft className="inline mr-1" />Manage Products
        </Link>
        <h1 className="text-2xl font-bold dark:text-white">Add New Product</h1>
      </div>
      <h1 className="text-2xl font-bold mb-6 dark:text-white text-center"></h1>
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        
        {/* Media Upload */}
        <div>
          <label className="block text-gray-700 dark:text-gray-300 mb-2">Upload Images/Videos</label>
          <div className="overflow-x-auto">
            <div className="flex items-center space-x-4">
              {mediaFiles.map((file, index) => (
                <div key={index} className="relative flex-shrink-0">
                  {file.type.startsWith('image/') ? (
                    <img
                      src={URL.createObjectURL(file)}
                      alt="Preview"
                      className="w-64 h-64 object-cover rounded-2xl cursor-pointer"
                      onClick={() => setSelectedMedia(file)} // Open modal on click
                    />
                  ) : file.type.startsWith('video/') ? (
                    <video
                      src={URL.createObjectURL(file)}
                      className="w-auto h-64 object-cover rounded-2xl cursor-pointer"
                      onClick={() => setSelectedMedia(file)} // Open modal on click
                      controls
                    />
                  ) : (
                    <span className="text-gray-500">Unsupported</span>
                  )}
                  <button
                    type="button"
                    onClick={() => removeMediaField(index)}
                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                  >
                    &times;
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={triggerFileInput}
                className="w-64 h-64 bg-primary-600 text-white border-2 border-dashed border-gray-300 rounded-2xl flex items-center justify-center hover:bg-primary-700 flex-shrink-0"
              >
                <FaPlus size={34} className="text-white" />
                <span className="ml-2 text-xl">Upload</span>
              </button>
            </div>
          </div>
          {/* Hidden file input */}
          <input
            type="file"
            accept="image/*,video/*,audio/*"
            ref={fileInputRef}
            onChange={handleMediaChange}
            className="hidden"
            title="Upload media files"
          />
        </div>

        {/* Product Name */}
        <div>
          <label className="block text-gray-700 dark:text-gray-300 mb-2">Product Name</label>
          <input 
            type="text" 
            name="name" 
            value={productData.name} 
            onChange={handleInputChange} 
            className="w-full border border-gray-300 p-2 rounded bg-transparent" 
            placeholder="Enter product name" 
            required 
          />
        </div>

        {/* Product Price */}
        <div>
          <label className="block text-gray-700 dark:text-gray-300 mb-2">Product Price</label>
          <div className="relative">
            {/* Rupee Symbol */}
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 dark:text-gray-300">₹</span>
            {/* Input Field */}
            <input
              type="text" // Using text to avoid up/down arrows
              name="price"
              value={productData.price}
              onChange={handleInputChange}
              className="w-full border border-gray-300 p-2 pl-8 rounded bg-transparent"
              placeholder="Enter price"
              required
            />
          </div>
        </div>

        {/* Veg/Nonveg Dropdown using React Select */}
        <div>
          <label className="block text-gray-700 dark:text-gray-300 mb-2">Veg or Non-Veg</label>
          <Select
            options={vegOrNonOptions}
            value={vegOrNonOptions.find(option => option.value === productData.vegornon)}
            onChange={(selectedOption) =>
              setProductData({ ...productData, vegornon: selectedOption?.value || '' })
            }
            className="w-full"
            styles={{
              control: (provided, state) => ({
                ...provided,
                backgroundColor: 'transparent',
                borderColor: state.isFocused ? '#4F46E5' : '#D1D5DB',
                color: 'black',
                boxShadow: state.isFocused ? '0 0 0 1px #4F46E5' : 'none',
              }),
              menu: (provided) => ({
                ...provided,
                backgroundColor: document.documentElement.classList.contains('dark')
                  ? '#1F2937'
                  : 'white',
                zIndex: 9999,
              }),
              option: (provided, state) => ({
                ...provided,
                backgroundColor: state.isFocused
                  ? '#4F46E5'
                  : document.documentElement.classList.contains('dark')
                  ? '#1F2937'
                  : 'white',
                color: state.isFocused
                  ? 'white'
                  : document.documentElement.classList.contains('dark')
                  ? '#D1D5DB'
                  : 'black',
              }),
              singleValue: (provided) => ({
                ...provided,
                color: document.documentElement.classList.contains('dark') ? 'white' : 'black',
              }),
            }}
          />
        </div>

        {/* Category Dropdown using React Select */}
        <div>
          <label className="block dark:text-white mb-2">Category</label>
          <Select
            options={categoryOptions}
            value={categoryOptions.find(option => option.value === productData.category)}
            onChange={(selectedOption) =>
              setProductData({ ...productData, category: selectedOption?.value || '' })
            }
            className="w-full"
            styles={{
              control: (provided, state) => ({
                ...provided,
                backgroundColor: 'transparent',
                borderColor: state.isFocused ? '#4F46E5' : '#D1D5DB',
                color: 'black',
                boxShadow: state.isFocused ? '0 0 0 1px #4F46E5' : 'none',
              }),
              menu: (provided) => ({
                ...provided,
                backgroundColor: document.documentElement.classList.contains('dark')
                  ? '#1F2937'
                  : 'white',
                zIndex: 9999,
              }),
              option: (provided, state) => ({
                ...provided,
                backgroundColor: state.isFocused
                  ? '#4F46E5'
                  : document.documentElement.classList.contains('dark')
                  ? '#1F2937'
                  : 'white',
                color: state.isFocused
                  ? 'white'
                  : document.documentElement.classList.contains('dark')
                  ? '#D1D5DB'
                  : 'black',
              }),
              singleValue: (provided) => ({
                ...provided,
                color: document.documentElement.classList.contains('dark') ? 'white' : 'black',
              }),
            }}
          />
        </div>

        {/* Product Description */}
        <div>
          <label className="block text-gray-700 dark:text-gray-300 mb-2">Product Description</label>
          <textarea 
            name="description" 
            value={productData.description} 
            onChange={handleInputChange} 
            className="w-full border border-gray-300 p-2 rounded bg-transparent" 
            placeholder="Enter product description" 
            rows={4}
            required 
          />
        </div>

        {/* Submit Button */}
        <div className="text-center">
          <button 
            type="submit" 
            className="btn btn-primary px-6 py-2 rounded-lg"
          >
            Submit
          </button>
        </div>
      </form>

      {/* Modal for Media Preview */}
      {selectedMedia && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="relative bg-transparent dark:transparent p-4 rounded-lg shadow-lg">
            <button
              onClick={() => setSelectedMedia(null)}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center"
            >
              &times;
            </button>
            {selectedMedia.type.startsWith('image/') ? (
              <img
                src={URL.createObjectURL(selectedMedia)}
                alt="Preview"
                className="w-auto lg:h-[500px] h-[300px] rounded"
              />
            ) : selectedMedia.type.startsWith('video/') ? (
              <video
                src={URL.createObjectURL(selectedMedia)}
                className="w-auto lg:h-[500px] h-[300px] rounded"
                controls
              />
            ) : (
              <span className="text-gray-500">Unsupported Media</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AddProduct;