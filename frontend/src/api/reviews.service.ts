import api from './config';
import { ApiResponse, Review, AddReviewData } from '../types';

export const addReview = async (reviewData: AddReviewData): Promise<ApiResponse<Review>> => {
  const response = await api.post<ApiResponse<Review>>('/reviews', reviewData);
  return response.data;
};

export const getReviewsByProduct = async (productId: string): Promise<ApiResponse<Review[]>> => {
  const response = await api.get<ApiResponse<Review[]>>(`/reviews/product/${productId}`);
  return response.data;
};

export const deleteReview = async (id: string): Promise<ApiResponse<{}>> => {
    const response = await api.delete<ApiResponse<{}>>(`/reviews/${id}`);
    return response.data;
};

export const toggleLike = async (reviewId: string): Promise<ApiResponse<Review>> => {
  const response = await api.put<ApiResponse<Review>>(`/reviews/${reviewId}/like`);
  return response.data;
};

export const toggleDislike = async (reviewId: string): Promise<ApiResponse<Review>> => {
  const response = await api.put<ApiResponse<Review>>(`/reviews/${reviewId}/dislike`);
  return response.data;
};

// Add and export getAllReviews if needed (make sure your backend supports this endpoint)
export const getAllReviews = async (): Promise<ApiResponse<Review[]>> => {
  const response = await api.get<ApiResponse<Review[]>>('/reviews');
  return response.data;
};