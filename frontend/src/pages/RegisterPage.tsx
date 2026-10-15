import React, { useState } from 'react';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { ErrorMessage } from '../components/ErrorMessage';
import { api, parseApiError } from '../services/api';
import { isValidEmail } from '../utils/validation';
import { Mail, User, CheckCircle2, Copy, ArrowRight, ShieldAlert } from 'lucide-react';

interface RegisterPageProps {
  onGoToCheckout: (email?: string) => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onGoToCheckout }) => {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Registration success state
  const [registeredCode, setRegisteredCode] = useState<string | null>(null);
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const trimmedEmail = email.trim();
    const trimmedFirst = firstName.trim();
    const trimmedLast = lastName.trim();

    const errors: Record<string, string> = {};
    if (!trimmedEmail) {
      errors.email = 'Email is required';
    } else if (!isValidEmail(trimmedEmail)) {
      errors.email = 'Please provide a valid email (e.g. user@example.com)';
    }

    if (!trimmedFirst) {
      errors.firstName = 'First name is required';
    }

    if (!trimmedLast) {
      errors.lastName = 'Last name is required';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.register({
        email: trimmedEmail,
        firstName: trimmedFirst,
        lastName: trimmedLast,
      });

      if (response.success && response.loginCode) {
        setRegisteredCode(response.loginCode);
        setRegisteredEmail(response.user.email);
      }
    } catch (err) {
      const parsed = parseApiError(err);
      setError(parsed.message);
      if (parsed.validationErrors) {
        setFieldErrors(parsed.validationErrors);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (registeredCode) {
      navigator.clipboard.writeText(registeredCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // SUCCESS VIEW: Registration Complete
  if (registeredCode && registeredEmail) {
    return (
      <div className="max-w-md mx-auto my-8 p-6 sm:p-8 bg-white rounded-2xl shadow-xl border border-slate-100 text-center animate-in fade-in zoom-in-95 duration-200">
        <div className="w-16 h-16 mx-auto mb-4 bg-emerald-50 rounded-full border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-xs">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <h2 className="text-2xl font-bold text-slate-900">Registration Complete</h2>
        <p className="text-sm text-slate-600 mt-1">
          Account created for <span className="font-semibold text-slate-900">{registeredEmail}</span>
        </p>

        <div className="my-6 p-6 bg-gradient-to-br from-indigo-50/70 via-slate-50 to-violet-50/70 rounded-2xl border border-indigo-100/80 shadow-inner">
          <span className="text-xs font-semibold tracking-wider text-indigo-700 uppercase">
            Your 6-Digit Login Code
          </span>
          <div className="text-4xl font-extrabold tracking-widest text-indigo-950 font-mono my-3 selection:bg-indigo-200">
            {registeredCode}
          </div>
          <p className="text-xs text-slate-500">
            Save this code for checkout login. You will not see it again.
          </p>

          <button
            onClick={handleCopyCode}
            type="button"
            className="mt-3.5 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50 shadow-xs transition-colors cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5" />
            {copied ? 'Copied to Clipboard!' : 'Copy Code'}
          </button>
        </div>

        <Button
          onClick={() => onGoToCheckout(registeredEmail)}
          size="lg"
          variant="primary"
          className="w-full"
        >
          <span>Go to Checkout</span>
          <ArrowRight className="w-4 h-4 ml-1.5" />
        </Button>
      </div>
    );
  }

  // REGISTRATION FORM VIEW
  return (
    <div className="max-w-md mx-auto my-8 p-6 sm:p-8 bg-white rounded-2xl shadow-xl border border-slate-100 animate-in fade-in duration-200">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Create Account</h1>
        <p className="text-sm text-slate-600 mt-1">
          Sign up to get a 6-digit login code for instant checkout recognition.
        </p>
      </div>

      {error && <ErrorMessage message={error} onDismiss={() => setError(null)} className="mb-4" />}

      <form onSubmit={handleSubmit} className="space-y-4">
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
          required
          autoComplete="email"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <Input
            label="First Name"
            type="text"
            name="firstName"
            placeholder="John"
            value={firstName}
            onChange={(e) => {
              setFirstName(e.target.value);
              if (fieldErrors.firstName) setFieldErrors((prev) => ({ ...prev, firstName: '' }));
            }}
            error={fieldErrors.firstName}
            icon={<User className="w-4 h-4" />}
            required
            autoComplete="given-name"
          />

          <Input
            label="Last Name"
            type="text"
            name="lastName"
            placeholder="Doe"
            value={lastName}
            onChange={(e) => {
              setLastName(e.target.value);
              if (fieldErrors.lastName) setFieldErrors((prev) => ({ ...prev, lastName: '' }));
            }}
            error={fieldErrors.lastName}
            icon={<User className="w-4 h-4" />}
            required
            autoComplete="family-name"
          />
        </div>

        <div className="pt-2">
          <Button
            type="submit"
            size="lg"
            variant="primary"
            className="w-full"
            isLoading={isLoading}
            loadingText="Creating account..."
            disabled={isLoading}
          >
            Create Account
          </Button>
        </div>
      </form>

      <div className="mt-6 pt-5 border-t border-slate-100 text-center">
        <p className="text-xs text-slate-500 flex items-center justify-center gap-1">
          <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />
          A 6-digit numeric login code will be generated upon creation.
        </p>
      </div>
    </div>
  );
};
