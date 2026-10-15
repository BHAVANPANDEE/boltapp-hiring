import React, { useState, useRef, useEffect } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { ErrorMessage } from './ErrorMessage';
import { api, parseApiError } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { KeyRound, ShieldCheck } from 'lucide-react';
import type { User } from '../types';

interface LoginModalProps {
  isOpen: boolean;
  email: string;
  onClose: () => void;
  onContinueAsGuest: () => void;
  onSuccess: (user: User) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  email,
  onClose,
  onContinueAsGuest,
  onSuccess,
}) => {
  const { login } = useAuth();
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Reset inputs when modal opens
  useEffect(() => {
    if (isOpen) {
      setDigits(['', '', '', '', '', '']);
      setError(null);
      setIsVerifying(false);
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }
  }, [isOpen]);

  const handleDigitChange = (index: number, value: string) => {
    setError(null);

    // Handle full 6-digit paste
    if (value.length > 1) {
      const sanitized = value.replace(/\D/g, '').slice(0, 6);
      if (sanitized.length > 0) {
        const nextDigits = [...digits];
        for (let i = 0; i < 6; i++) {
          nextDigits[i] = sanitized[i] || '';
        }
        setDigits(nextDigits);
        const nextFocusIndex = Math.min(sanitized.length, 5);
        inputRefs.current[nextFocusIndex]?.focus();
        return;
      }
    }

    const singleDigit = value.replace(/\D/g, '').slice(-1);
    const nextDigits = [...digits];
    nextDigits[index] = singleDigit;
    setDigits(nextDigits);

    // Move to next input if digit entered
    if (singleDigit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const code = digits.join('');
    if (code.length !== 6) {
      setError('Please enter all 6 digits of your login code.');
      return;
    }

    setIsVerifying(true);
    setError(null);

    try {
      const response = await api.verify({ email, code });
      if (response.authenticated && response.token && response.user) {
        login(response.token, response.user);
        onSuccess(response.user);
      } else {
        setError(response.message || 'Invalid login code. Please check and try again.');
      }
    } catch (err) {
      const parsed = parseApiError(err);
      setError(parsed.message || 'Invalid login code');
    } finally {
      setIsVerifying(false);
    }
  };

  const codeComplete = digits.every((d) => d.length === 1);

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="md">
      <div className="text-center space-y-4">
        {/* Top Icon Badge */}
        <div className="mx-auto w-12 h-12 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
          <KeyRound className="w-6 h-6" />
        </div>

        <div>
          <h2 className="text-xl font-bold text-slate-900">Welcome back!</h2>
          <p className="text-sm text-slate-600 mt-1">
            We found an existing account for{' '}
            <span className="font-semibold text-slate-900">{email}</span>.
          </p>
          <p className="text-xs text-slate-500 mt-0.5">
            Enter your 6-digit login code to access your saved details.
          </p>
        </div>

        {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}

        {/* 6 Digit OTP Input Grid */}
        <form onSubmit={handleVerify} className="space-y-5">
          <div className="flex justify-center items-center gap-2 sm:gap-2.5">
            {digits.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => {
                  inputRefs.current[idx] = el;
                }}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={digit}
                disabled={isVerifying}
                onChange={(e) => handleDigitChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                className={`w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-bold rounded-xl border transition-all outline-none 
                  ${
                    digit
                      ? 'border-indigo-600 bg-indigo-50/30 text-indigo-900 ring-1 ring-indigo-600'
                      : 'border-slate-300 bg-white text-slate-900 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100'
                  }
                  disabled:bg-slate-50 disabled:text-slate-400`}
                autoComplete="one-time-code"
              />
            ))}
          </div>

          <div className="flex flex-col gap-2.5 pt-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              isLoading={isVerifying}
              loadingText="Verifying..."
              disabled={!codeComplete || isVerifying}
            >
              <ShieldCheck className="w-4 h-4 mr-1.5" />
              Login
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="md"
              className="w-full text-slate-600 hover:text-slate-900"
              onClick={onContinueAsGuest}
              disabled={isVerifying}
            >
              Continue as guest
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};
