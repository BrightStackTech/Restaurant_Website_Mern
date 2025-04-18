// User related types
export interface User {
  _id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  createdAt: string;
  updatedAt: string;
  profilePicture?: string; 
}

export interface UserLoginCredentials {
  email: string;
  password: string;
}

export interface UserRegisterData {
  name: string;
  email: string;
  password: string;
}

// Product related types
export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  media?: string[]; 
  ratings: Rating[];
  ratingvalue: number; // <-- add this line
  numReviews: number;
  createdAt: string;
  updatedAt: string;
  vegornon?: string; // <-- add this line
}

export interface Rating {
  _id: string;
  user: User | string;
  rating: number;
  comment: string;
  replies: Reply[];
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
  user: User | string;
  product: string;
  images?: string[];
  likeCount?: number;
  dislikeCount?: number;
  replies?: Reply[];
  likedBy?: string[];     // New field: array of user IDs who liked the review
  dislikedBy?: string[];  // New field: array of user IDs who disliked the review
}

export interface Reply {
  _id: string;
  user: User ;
  content: string;
  reviewId: string;
  productId: string; // or reviewId if your reply attaches to a review – adjust the field name accordingly
  createdAt: string;
  updatedAt: string;
}

export interface AddProductData {
  name: string;
  description: string;
  price: number;
  category: string;
  image: File | null;
}

export interface UpdateProductData {
  name?: string;
  description?: string;
  price?: number;
  category?: string;
  image?: File | null;
}

export interface AddRatingData {
  rating: number;
  product: string;
  comment: string;
}

export interface AddReviewData {
  content: string;
  product: string;
  images?: string[];
}

export interface AddReplyData {
  content: string;
  reviewId: string;
  productId: string// or reviewId if your reply attaches to a review – adjust the field name accordingly
}

// Auth state
export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  // For some endpoints like register, the response might have a different shape
  token?: string;
  user?: User | null;
}

export interface ErrorResponse {
  success: boolean;
  message: string;
} 