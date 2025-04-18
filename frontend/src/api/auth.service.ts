import api from './config';
import { ApiResponse, User, UserLoginCredentials, UserRegisterData } from '../types';
import axios from 'axios';

// Login user
export const loginUser = async (credentials: UserLoginCredentials): Promise<ApiResponse<{ user: User; token: string }>> => {
  try {
    console.log('Sending login request with credentials:', JSON.stringify(credentials));
    
    // Try direct axios call instead of using the api instance
    const baseUrl = `${import.meta.env.VITE_BACKEND_URL}/api` || 'http://localhost:8000/api';
    console.log('Using base URL:', baseUrl);
    
    const response = await axios.post(`${baseUrl}/auth/login`, credentials, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    console.log('Login response received:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Login API error:', error);
    console.error('Error response data:', error.response?.data);
    console.error('Error status:', error.response?.status);
    console.error('Error message:', error.message);
    throw error;
  }
};

// Register user
export const registerUser = async (userData: UserRegisterData): Promise<ApiResponse<{ user: User; token: string }>> => {
  try {
    const response = await api.post<ApiResponse<{ user: User; token: string }>>('/auth/register', userData);
    return response.data;
  } catch (error) {
    console.error('Register API error:', error);
    throw error;
  }
};

// Google sign in
export const googleSignIn = async (token: string): Promise<ApiResponse<{ user: User; token: string }>> => {
  try {
    const response = await api.post<ApiResponse<{ user: User; token: string }>>('/auth/google', { token });
    return response.data;
  } catch (error) {
    console.error('Google sign-in API error:', error);
    throw error;
  }
};

// Password reset request
export const requestPasswordReset = async (email: string): Promise<ApiResponse<{ message: string }>> => {
  const response = await api.post<ApiResponse<{ message: string }>>('/auth/reset-password', { email });
  return response.data;
};

// Reset password with token
export const resetPassword = async (token: string, newPassword: string): Promise<ApiResponse<{ message: string }>> => {
  const response = await api.put<ApiResponse<{ message: string }>>('/auth/resetpassword/' + token, { password: newPassword });
  return response.data;
};

// Get current user
export const getCurrentUser = async (): Promise<ApiResponse<User>> => {
  const response = await api.get<ApiResponse<User>>('/auth/me');
  return response.data;
};

// Logout user (client-side only - clears local storage)
export const logoutUser = (): void => {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user');
}; 

export const deleteCurrentUser = async (userId: string): Promise<ApiResponse<{}>> => {
  const response = await api.delete<ApiResponse<{}>>(`/users/${userId}`);
  return response.data;
};
