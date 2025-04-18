import api from './config';
import { ApiResponse, AddRatingData, Rating } from '../types';

export const addRating = async (ratingData: AddRatingData): Promise<ApiResponse<Rating>> => {
  const response = await api.post<ApiResponse<Rating>>('/ratings', ratingData);
  return response.data;
};

export const getProductRatings = async (productId: string): Promise<ApiResponse<Rating[]>> => {
  const response = await api.get<ApiResponse<Rating[]>>(`/ratings/product/${productId}`);
  return response.data;
};