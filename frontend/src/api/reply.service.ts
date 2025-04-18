import api from './config';
import { ApiResponse, Reply, AddReplyData } from '../types';

// Create a reply (POST /api/replies)
export const addReply = async (replyData: AddReplyData): Promise<ApiResponse<Reply>> => {
  const response = await api.post<ApiResponse<Reply>>('/replies', replyData);
  return response.data;
};

export const getReplyById = async (id: string): Promise<ApiResponse<Reply>> => {
  const response = await api.get<ApiResponse<Reply>>(`/replies/${id}`);
  return response.data;
};

// Delete a reply (DELETE /api/replies/:id)
export const deleteReply = async (id: string): Promise<ApiResponse<{}>> => {
  const response = await api.delete<ApiResponse<{}>>(`/replies/${id}`);
  return response.data;
};