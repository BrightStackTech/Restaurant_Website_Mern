import { createContext, useContext, useEffect, useReducer, ReactNode } from 'react';
import { AuthState, User, UserLoginCredentials, UserRegisterData, ApiResponse } from '../types';
import { getCurrentUser, loginUser, logoutUser, registerUser} from '../api/auth.service';
import { toast } from 'react-hot-toast';

// Initial state
const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('auth_token'),
  isAuthenticated: !!localStorage.getItem('auth_token'),
  loading: false,
  error: null,
};

// Action types
type AuthAction = 
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User | null; token: string | null } }
  | { type: 'AUTH_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'RESET_ERROR' };

// Reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        loading: true,
        error: null,
      };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        loading: false,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: !!action.payload.token,
        error: null,
      };
    case 'AUTH_FAILURE':
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
      };
    case 'RESET_ERROR':
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

// Create context
interface AuthContextProps {
  state: AuthState;
  login: (credentials: UserLoginCredentials) => Promise<boolean>;
  register: (userData: UserRegisterData) => Promise<ApiResponse<any> | void>;
  logout: () => void;
  resetError: () => void;
  setUser: (user: User | null) => void;  // <--- added setUser
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

// Provider component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // New function to update user data
  const setUser = (user: User | null) => {
    dispatch({
      type: 'AUTH_SUCCESS',
      payload: { user, token: state.token },
    });
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  };

  useEffect(() => {
    const loadUser = async () => {
      if (state.token && !state.user) {
        try {
          const response = await getCurrentUser();
          if (response.success && response.data) {
            dispatch({
              type: 'AUTH_SUCCESS',
              payload: { user: response.data, token: state.token },
            });
          }
        } catch (err) {
          localStorage.removeItem('auth_token');
          dispatch({ type: 'LOGOUT' });
        }
      }
    };

    loadUser();
  }, [state.token]);

  const login = async (credentials: UserLoginCredentials) => {
    dispatch({ type: 'AUTH_START' });
    try {
      const response = await loginUser(credentials);
      
      if (!response.success) {
        throw new Error(response.message || 'Login failed');
      }
      
      if (response.token && response.user) {
        localStorage.setItem('auth_token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: { user: response.user, token: response.token },
        });
      } else if (response.data) {
        const { token, user } = response.data;
        
        if (!token) {
          throw new Error('Token not found in response');
        }

        localStorage.setItem('auth_token', token);
        
        if (user) {
          dispatch({
            type: 'AUTH_SUCCESS',
            payload: { user, token },
          });
          localStorage.setItem('user', JSON.stringify(user));
        } else {
          dispatch({
            type: 'AUTH_SUCCESS',
            payload: { user: null, token },
          });
        }
      } else {
        throw new Error('Invalid response format');
      }
      
      toast.success('Login successful!');
      return true;
    } catch (error: any) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Login failed';
      dispatch({
        type: 'AUTH_FAILURE',
        payload: errorMessage,
      });
      toast.error(errorMessage);
      return false;
    }
  };

  const register = async (userData: UserRegisterData) => {
    dispatch({ type: 'AUTH_START' });
    try {
      const response = await registerUser(userData);
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user: null, token: null },
      });
      toast.success(response.message || 'Registration successful! Please check your email to verify your account.');
      return response;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Registration failed';
      dispatch({
        type: 'AUTH_FAILURE',
        payload: errorMessage,
      });
      toast.error(errorMessage);
      throw err;
    }
  };

  const logout = () => {
    logoutUser();
    dispatch({ type: 'LOGOUT' });
    toast.success('Logged out successfully');
  };

  const resetError = () => {
    dispatch({ type: 'RESET_ERROR' });
  };

  return (
    <AuthContext.Provider
      value={{
        state,
        login,
        register,
        logout,
        resetError,
        setUser,  // <--- include setUser in the context value
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for using the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};