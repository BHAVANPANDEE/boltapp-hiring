export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
}

export interface RegisterRequest {
  email: string;
  firstName: string;
  lastName: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  loginCode: string;
  user: User;
}

export interface RecognizeRequest {
  email: string;
}

export interface RecognizeResponse {
  recognized: boolean;
}

export interface VerifyRequest {
  email: string;
  code: string;
}

export interface VerifyResponse {
  authenticated: boolean;
  token?: string;
  user?: User;
  message?: string;
}

export interface CheckoutRequest {
  email: string;
  phone: string;
  shippingAddress: string;
}

export interface CheckoutResponse {
  success: boolean;
  message: string;
  checkoutId: number;
  userId: number | null;
  guest: boolean;
}

export interface ApiError {
  timestamp?: string;
  status?: number;
  error?: string;
  message: string;
  validationErrors?: Record<string, string>;
}
