import { useState, useEffect, ChangeEvent, FormEvent, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { FaArrowLeft, FaTimes, FaPlus } from 'react-icons/fa';
import Select from 'react-select';
import LoadingOverlay from '../../components/LoadingOverlay';
import { getProductById, updateProduct } from '../../api/products.service';


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
];

const EditProduct = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [productData, setProductData] = useState({
    name: '',
    price: '',
    vegornon: 'veg',
    category: categoryOptions[0].value,
    description: ''
  });
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [existingMedia, setExistingMedia] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Fetch the current product details
  useEffect(() => {
    if (!id) return;
    const fetchProduct = async () => {
      try {
        const response = await getProductById(id);
        if (response.success && response.data) {
          const prod = response.data;
          setProductData({
            name: prod.name,
            price: prod.price.toString(),
            vegornon: prod.vegornon || 'veg',
            category: prod.category,
            description: prod.description,
          });
          if (prod.media && prod.media.length > 0) {
            setExistingMedia(prod.media);
          }
        } else {
          toast.error("Failed to load product details");
        }
      } catch (error) {
        console.error(error);
        toast.error("Error fetching product");
      }
    };
    fetchProduct();
  }, [id]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setProductData({ ...productData, [e.target.name]: e.target.value });
  };

  const handleMediaChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setMediaFiles([...mediaFiles, e.target.files[0]]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current && fileInputRef.current.click();
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
            // Append new media files if any
            mediaFiles.forEach(file => {
            if (file) formData.append('media', file);
            });
            // Append text fields to formData
            formData.append('name', productData.name);
            formData.append('price', productData.price);
            formData.append('vegornon', productData.vegornon);
            formData.append('category', productData.category);
            formData.append('description', productData.description);

            // Convert productData.price from string to number for updateProductData
            const updatedData = {
            ...productData,
            price: Number(productData.price)
            };

            // Send update request (PUT /api/products/:id)
            const response = await updateProduct(id!, updatedData, formData);
            if (response.success) {
            toast.success("Product updated successfully!");
            navigate('/admin/products');
            } else {
            throw new Error(response.message || "Failed to update product");
            }
        } catch (error: any) {
            toast.error(error.message || "An error occurred while updating the product");
        } finally {
            setIsSubmitting(false);
        }
    };

    const removeExistingMedia = (index: number) => {
    setExistingMedia(existingMedia.filter((_, i) => i !== index));
    };


  return (
    <div className="container mx-auto px-4 py-8 mt-12">
      {isSubmitting && <LoadingOverlay />}
      <div className="flex items-center mb-4">
        <Link to="/admin/products" className="text-primary-600 hover:text-primary-800 mr-4">
          <FaArrowLeft className="inline mr-1" />
          Back to Products
        </Link>
        <h1 className="text-2xl font-bold dark:text-white">Edit Product</h1>
      </div>
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        {/* Media Upload Section */}
        <div>
        <label className="block text-gray-700 dark:text-gray-300 mb-2">Media</label>
        <div className="overflow-x-auto">
            <div className="flex items-center space-x-4">
            {/* Existing Media */}
            {existingMedia.map((mediaUrl, index) => (
                <div key={`existing-${index}`} className="relative flex-shrink-0">
                {/\.(mp4|webm|ogg)$/i.test(mediaUrl) ? (
                    <video
                    src={mediaUrl}
                    className="w-64 h-64 object-cover rounded-2xl"
                    controls
                    />
                ) : (
                    <img
                    src={mediaUrl}
                    alt={`Existing Media ${index}`}
                    className="w-64 h-64 object-cover rounded-2xl"
                    onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src =
                        'https://via.placeholder.com/150?text=No+Image';
                    }}
                    />
                )}
                <button
                    onClick={() => removeExistingMedia(index)}
                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                    title="Remove existing media"
                >
                    <FaTimes />
                </button>
                </div>
            ))}

            {/* New Media Uploads */}
            {mediaFiles.map((file, index) => (
                <div key={`new-${index}`} className="relative flex-shrink-0">
                {file.type.startsWith('image/') ? (
                    <img
                    src={URL.createObjectURL(file)}
                    alt="Preview"
                    className="w-64 h-64 object-cover rounded-2xl"
                    />
                ) : file.type.startsWith('video/') ? (
                    <video
                    src={URL.createObjectURL(file)}
                    className="w-64 h-64 object-cover rounded-2xl"
                    controls
                    />
                ) : null}
                <button
                    onClick={() => removeMediaField(index)}
                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                    title="Remove selected media"
                >
                    <FaTimes />
                </button>
                </div>
            ))}

            {/* Upload Button */}
            <button
                type="button"
                onClick={triggerFileInput}
                className="w-64 h-64 bg-primary-600 text-white border-2 border-dashed border-gray-300 rounded-2xl flex items-center justify-center hover:bg-primary-700 flex-shrink-0"
            >
                <span className="text-2xl mr-2"><FaPlus/></span>
                Upload
            </button>
            </div>
        </div>
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
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 dark:text-gray-300">₹</span>
            <input
              type="text"
              name="price"
              value={productData.price}
              onChange={handleInputChange}
              className="w-full border border-gray-300 p-2 pl-8 rounded bg-transparent"
              placeholder="Enter price"
              required
            />
          </div>
        </div>

        {/* Category Dropdown */}
        <div>
          <label className="block text-gray-700 dark:text-gray-300 mb-2">Category</label>
          <Select
            options={categoryOptions}
            value={categoryOptions.find(option => option.value === productData.category)}
            onChange={option => setProductData({ ...productData, category: option?.value || '' })}
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

        {/* Veg / Non-Veg Dropdown */}
        <div>
          <label className="block text-gray-700 dark:text-gray-300 mb-2">Veg or Non-Veg</label>
          <Select
            options={vegOrNonOptions}
            value={vegOrNonOptions.find(option => option.value === productData.vegornon)}
            onChange={(option) =>
              setProductData({ ...productData, vegornon: option?.value || '' })
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
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProduct;