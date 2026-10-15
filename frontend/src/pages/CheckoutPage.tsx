import React, { useState, useEffect, useRef } from 'react';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { ErrorMessage } from '../components/ErrorMessage';
import { LoginModal } from '../components/LoginModal';
import { useAuth } from '../hooks/useAuth';
import { useDebounce } from '../hooks/useDebounce';
import { api, parseApiError } from '../services/api';
import { isValidEmail, isValidPhone } from '../utils/validation';
import {
  Mail,
  Phone,
  MapPin,
  CheckCircle2,
  Sparkles,
  ShoppingBag,
  ShieldCheck,
  UserCheck,
  LogOut,
  RotateCcw,
} from 'lucide-react';
import type { CheckoutResponse } from '../types';

interface CheckoutPageProps {
  initialEmail?: string;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ initialEmail = '' }) => {
  const {
    user,
    isAuthenticated,
    logout,
    guestEmails,
    markEmailAsGuest,
  } = useAuth();

  // Form State
  const [email, setEmail] = useState<string>(user?.email || initialEmail);
  const [phone, setPhone] = useState<string>('');
  const [shippingAddress, setShippingAddress] = useState<string>('');

  // UI & Flow States
  const [isRecognizing, setIsRecognizing] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalEmail, setModalEmail] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Checkout submission success state
  const [checkoutSuccess, setCheckoutSuccess] = useState<CheckoutResponse | null>(null);

  // Debounced email for recognition trigger (500ms delay)
  const debouncedEmail = useDebounce(email, 500);
  const lastRecognizedEmailRef = useRef<string>('');

  // Keep email in sync if authenticated user changes
  useEffect(() => {
    if (user?.email) {
      setEmail(user.email);
    }
  }, [user]);

  // Handle Debounced User Recognition API call
  useEffect(() => {
    const trimmed = debouncedEmail.trim().toLowerCase();

    // Reset if email was cleared
    if (!trimmed) {
      lastRecognizedEmailRef.current = '';
      return;
    }

    // Only recognize when valid format
    if (!isValidEmail(trimmed)) {
      return;
    }

    // Avoid duplicate calls for the same email
    if (lastRecognizedEmailRef.current === trimmed) {
      return;
    }

    // If currently authenticated as this user, no need to modal prompt
    if (isAuthenticated && user?.email.toLowerCase() === trimmed) {
      return;
    }

    // If the user already skipped for this email in this session, do not re-prompt automatically
    if (guestEmails.has(trimmed)) {
      return;
    }

    async function checkUserRecognition() {
      setIsRecognizing(true);
      setError(null);

      try {
        const response = await api.recognize(trimmed);
        lastRecognizedEmailRef.current = trimmed;

        if (response.recognized) {
          // Found registered user -> prompt login modal
          setModalEmail(trimmed);
          setIsModalOpen(true);
        }
      } catch (err) {
        console.error('Email recognition error:', err);
        // Do not block user from filling form on recognition network failure
      } finally {
        setIsRecognizing(false);
      }
    }

    checkUserRecognition();
  }, [debouncedEmail, isAuthenticated, user, guestEmails]);

  // Modal Handlers
  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleContinueAsGuest = () => {
    if (modalEmail) {
      markEmailAsGuest(modalEmail);
    }
    setIsModalOpen(false);
  };

  const handleLoginSuccess = () => {
    setIsModalOpen(false);
  };

  // Submit Checkout Form
  const handleSubmitCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const trimmedEmail = email.trim();
    const trimmedPhone = phone.trim();
    const trimmedAddress = shippingAddress.trim();

    const errors: Record<string, string> = {};
    if (!trimmedEmail) {
      errors.email = 'Email is required';
    } else if (!isValidEmail(trimmedEmail)) {
      errors.email = 'Please enter a valid email (e.g. user@example.com)';
    }

    if (!trimmedPhone) {
      errors.phone = 'Phone number is required';
    } else if (!isValidPhone(trimmedPhone)) {
      errors.phone = 'Please enter a valid phone number';
    }

    if (!trimmedAddress) {
      errors.shippingAddress = 'Shipping address is required';
    } else if (trimmedAddress.length < 5) {
      errors.shippingAddress = 'Please enter a full shipping address';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await api.submitCheckout({
        email: trimmedEmail,
        phone: trimmedPhone,
        shippingAddress: trimmedAddress,
      });

      setCheckoutSuccess(response);
    } catch (err) {
      const parsed = parseApiError(err);
      setError(parsed.message);
      if (parsed.validationErrors) {
        setFieldErrors(parsed.validationErrors);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNewCheckout = () => {
    setCheckoutSuccess(null);
    setPhone('');
    setShippingAddress('');
    setError(null);
    setFieldErrors({});
  };

  // SUCCESS VIEW: Checkout Completed
  if (checkoutSuccess) {
    return (
      <div className="max-w-lg mx-auto my-8 p-6 sm:p-8 bg-white rounded-2xl shadow-xl border border-slate-100 text-center animate-in fade-in zoom-in-95 duration-200">
        <div className="w-16 h-16 mx-auto mb-4 bg-emerald-50 rounded-full border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-xs">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <h2 className="text-2xl font-bold text-slate-900">Order Placed Successfully!</h2>
        <p className="text-sm text-slate-600 mt-1">
          {checkoutSuccess.message}
        </p>

        <div className="my-6 p-5 bg-slate-50 rounded-xl border border-slate-200/80 text-left space-y-2.5 text-sm">
          <div className="flex justify-between items-center pb-2 border-b border-slate-200">
            <span className="text-slate-500 font-medium">Checkout Confirmation #</span>
            <span className="font-mono font-bold text-slate-900 text-base">
              BP-{checkoutSuccess.checkoutId.toString().padStart(6, '0')}
            </span>
          </div>

          <div className="flex justify-between items-center text-xs sm:text-sm">
            <span className="text-slate-500">Checkout Type:</span>
            <span className={`font-semibold px-2 py-0.5 rounded-full text-xs ${
              checkoutSuccess.guest
                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
            }`}>
              {checkoutSuccess.guest ? 'Guest Checkout' : `Authenticated User (ID: ${checkoutSuccess.userId})`}
            </span>
          </div>

          <div className="flex justify-between items-center text-xs sm:text-sm">
            <span className="text-slate-500">Email:</span>
            <span className="font-medium text-slate-900">{email}</span>
          </div>

          <div className="flex justify-between items-center text-xs sm:text-sm">
            <span className="text-slate-500">Phone:</span>
            <span className="font-medium text-slate-900">{phone}</span>
          </div>

          <div className="pt-1 text-xs sm:text-sm">
            <span className="text-slate-500 block mb-0.5">Shipping Address:</span>
            <span className="font-medium text-slate-800 bg-white p-2.5 rounded-lg border border-slate-200 block">
              {shippingAddress}
            </span>
          </div>
        </div>

        <Button
          onClick={handleNewCheckout}
          variant="primary"
          size="lg"
          className="w-full flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Place Another Order</span>
        </Button>
      </div>
    );
  }

  // CHECKOUT FORM VIEW
  return (
    <div className="max-w-lg mx-auto my-8 p-6 sm:p-8 bg-white rounded-2xl shadow-xl border border-slate-100 animate-in fade-in duration-200">
      {/* Top Banner: Logged-in User Recognition Display (Requirement #10 & #14) */}
      {isAuthenticated && user ? (
        <div className="mb-6 p-4 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 rounded-xl border border-emerald-200/80 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
                Logged in User
              </p>
              <h2 className="text-base font-bold text-slate-900">
                Welcome, {user.firstName} {user.lastName}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={logout}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 underline flex items-center gap-1 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            Switch
          </button>
        </div>
      ) : (
        <div className="mb-6 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Instant User Recognition Checkout
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Checkout</h1>
          <p className="text-sm text-slate-600 mt-1">
            Enter your email. Registered users will be recognized automatically.
          </p>
        </div>
      )}

      {error && <ErrorMessage message={error} onDismiss={() => setError(null)} className="mb-4" />}

      <form onSubmit={handleSubmitCheckout} className="space-y-4">
        {/* Email Input with Real-time Debounced Recognition */}
        <Input
          label="Email"
          type="email"
          name="email"
          placeholder="user@example.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: '' }));
          }}
          error={fieldErrors.email}
          icon={<Mail className="w-4 h-4" />}
          isLoading={isRecognizing}
          hint={
            isRecognizing
              ? 'Checking email...'
              : !isAuthenticated && isValidEmail(email) && !guestEmails.has(email.toLowerCase().trim())
              ? 'Email format verified. Checking for registered account...'
              : undefined
          }
          required
          autoComplete="email"
          disabled={isAuthenticated} // Lock email to authenticated user
        />

        {/* Phone Input */}
        <Input
          label="Phone Number"
          type="tel"
          name="phone"
          placeholder="+1 (555) 234-5678"
          value={phone}
          onChange={(e) => {
            setPhone(e.target.value);
            if (fieldErrors.phone) setFieldErrors((prev) => ({ ...prev, phone: '' }));
          }}
          error={fieldErrors.phone}
          icon={<Phone className="w-4 h-4" />}
          required
          autoComplete="tel"
        />

        {/* Shipping Address Textarea / Custom Input */}
        <div className="w-full text-left space-y-1.5">
          <label
            htmlFor="shipping-address"
            className="block text-sm font-medium text-slate-700"
          >
            Shipping Address
            <span className="text-red-500 ml-1">*</span>
          </label>
          <div className="relative rounded-lg shadow-xs">
            <div className="absolute top-3 left-3 text-slate-400 pointer-events-none">
              <MapPin className="w-4 h-4" />
            </div>
            <textarea
              id="shipping-address"
              rows={3}
              placeholder="123 Market St, Suite 400, San Francisco, CA 94105"
              value={shippingAddress}
              onChange={(e) => {
                setShippingAddress(e.target.value);
                if (fieldErrors.shippingAddress) {
                  setFieldErrors((prev) => ({ ...prev, shippingAddress: '' }));
                }
              }}
              className={`block w-full rounded-lg border text-sm transition-all outline-none pl-10 pr-3.5 py-2.5 resize-none
                ${
                  fieldErrors.shippingAddress
                    ? 'border-red-400 bg-red-50/20 text-red-900 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                    : 'border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100'
                }`}
              required
            />
          </div>
          {fieldErrors.shippingAddress && (
            <p className="text-xs text-red-600 font-medium">
              {fieldErrors.shippingAddress}
            </p>
          )}
        </div>

        {/* Order Summary Teaser */}
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-indigo-600" />
            <span className="font-medium text-slate-800">Sample Order: 1x Tech Gadget</span>
          </div>
          <span className="font-bold text-slate-900 text-sm">$49.00</span>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <Button
            type="submit"
            size="lg"
            variant="primary"
            className="w-full"
            isLoading={isSubmitting}
            loadingText="Submitting..."
            disabled={isSubmitting}
          >
            <ShieldCheck className="w-4 h-4 mr-1.5" />
            Submit Checkout
          </Button>
        </div>
      </form>

      {/* Login Modal for Recognized Users */}
      <LoginModal
        isOpen={isModalOpen}
        email={modalEmail}
        onClose={handleModalClose}
        onContinueAsGuest={handleContinueAsGuest}
        onSuccess={handleLoginSuccess}
      />
    </div>
  );
};
