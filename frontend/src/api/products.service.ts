import api from './config';
import { AddProductData, ApiResponse, Product, UpdateProductData } from '../types';

// Get all products
export const getAllProducts = async (): Promise<ApiResponse<Product[]>> => {
  const response = await api.get<ApiResponse<Product[]>>('/products');
  return response.data;
};

// Get product by ID
export const getProductById = async (id: string): Promise<ApiResponse<Product>> => {
  const response = await api.get<ApiResponse<Product>>(`/products/${id}`);
  return response.data;
};

// Get products by category
export const getProductsByCategory = async (category: string): Promise<ApiResponse<Product[]>> => {
  const response = await api.get<ApiResponse<Product[]>>(`/products/category/${category}`);
  return response.data;
};

// Create a new product (admin only)
export const createProduct = async (productData: AddProductData): Promise<ApiResponse<Product>> => {
  // Need to use FormData for image upload
  const formData = new FormData();
  
  formData.append('name', productData.name);
  formData.append('description', productData.description);
  formData.append('price', productData.price.toString());
  formData.append('category', productData.category);
  
  if (productData.image) {
    formData.append('image', productData.image);
  }
  
  const response = await api.post<ApiResponse<Product>>('/products', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
};

// Update an existing product (admin only)
export const updateProduct = async (id: string, productData: UpdateProductData, formData?: FormData): Promise<ApiResponse<Product>> => {
  // If you’re using FormData (which supports file uploads) pass that; otherwise, send JSON
  if (formData) {
    const response = await api.put<ApiResponse<Product>>(`/products/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } else {
    const response = await api.put<ApiResponse<Product>>(`/products/${id}`, productData);
    return response.data;
  }
};

// Delete a product (admin only)
export const deleteProduct = async (id: string): Promise<ApiResponse<{ message: string }>> => {
  const response = await api.delete<ApiResponse<{ message: string }>>(`/products/${id}`);
  return response.data;
}; 