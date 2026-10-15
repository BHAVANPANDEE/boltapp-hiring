import axios, { type AxiosError } from 'axios';
import type {
  RegisterRequest,
  RegisterResponse,
  RecognizeResponse,
  VerifyRequest,
  VerifyResponse,
  CheckoutRequest,
  CheckoutResponse,
  User,
  ApiError,
} from '../types';

const BASE_URL = import.meta.env.VITE_API_BASE_URL
  ? `${import.meta.env.VITE_API_BASE_URL}/api`
  : '/api';

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to automatically add JWT Bearer token if present
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('boltpay_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Helper to normalize backend error responses into ApiError
export function parseApiError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    const err = error as AxiosError<ApiError>;
    if (err.response?.data) {
      return {
        status: err.response.status,
        message:
          err.response.data.message ||
          (err.response.data.validationErrors
            ? Object.values(err.response.data.validationErrors)[0]
            : 'An unexpected error occurred.'),
        validationErrors: err.response.data.validationErrors,
        error: err.response.data.error,
      };
    } else if (err.request) {
      return {
        message: 'Unable to reach the server. Please check your network or try again.',
      };
    }
  }
  return {
    message: error instanceof Error ? error.message : 'An unexpected error occurred.',
  };
}

export const api = {
  async checkHealth(): Promise<{ status: string }> {
    const response = await apiClient.get<{ status: string }>('/health');
    return response.data;
  },

  async register(data: RegisterRequest): Promise<RegisterResponse> {
    const response = await apiClient.post<RegisterResponse>('/auth/register', data);
    return response.data;
  },

  async recognize(email: string): Promise<RecognizeResponse> {
    const response = await apiClient.post<RecognizeResponse>('/auth/recognize', { email });
    return response.data;
  },

  async verify(data: VerifyRequest): Promise<VerifyResponse> {
    const response = await apiClient.post<VerifyResponse>('/auth/verify', data);
    return response.data;
  },

  async getMe(): Promise<User> {
    const response = await apiClient.get<User>('/auth/me');
    return response.data;
  },

  async submitCheckout(data: CheckoutRequest): Promise<CheckoutResponse> {
    const response = await apiClient.post<CheckoutResponse>('/checkouts', data);
    return response.data;
  },
};
