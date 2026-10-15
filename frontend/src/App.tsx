import { useState, useEffect } from 'react';
import { AuthProvider } from './hooks/useAuth';
import { Navbar } from './components/Navbar';
import { CheckoutPage } from './pages/CheckoutPage';
import { RegisterPage } from './pages/RegisterPage';
import { api } from './services/api';
import { ShieldCheck } from 'lucide-react';

function AppContent() {
  const [activeTab, setActiveTab] = useState<'checkout' | 'register'>('checkout');
  const [prefilledEmail, setPrefilledEmail] = useState<string>('');
  const [serverHealth, setServerHealth] = useState<'healthy' | 'checking' | 'down'>('checking');

  useEffect(() => {
    async function checkHealth() {
      try {
        const res = await api.checkHealth();
        if (res.status === 'ok') {
          setServerHealth('healthy');
        } else {
          setServerHealth('down');
        }
      } catch {
        setServerHealth('down');
      }
    }
    checkHealth();
  }, []);

  const handleGoToCheckout = (email?: string) => {
    if (email) {
      setPrefilledEmail(email);
    }
    setActiveTab('checkout');
  };

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans text-slate-900 antialiased selection:bg-indigo-500 selection:text-white">
      {/* Header */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col justify-center">
        {activeTab === 'checkout' ? (
          <CheckoutPage key={prefilledEmail} initialEmail={prefilledEmail} />
        ) : (
          <RegisterPage onGoToCheckout={handleGoToCheckout} />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">BoltPay</span>
            <span>&bull;</span>
            <span>OTP Based User Login &amp; Recognition Checkout</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  serverHealth === 'healthy'
                    ? 'bg-emerald-500 animate-pulse'
                    : serverHealth === 'checking'
                    ? 'bg-amber-400'
                    : 'bg-red-500'
                }`}
              />
              <span className="font-medium capitalize">
                API {serverHealth === 'healthy' ? 'Online' : serverHealth}
              </span>
            </div>

            <span className="hidden sm:inline">&bull;</span>
            <div className="hidden sm:flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
              <span>BCrypt OTP + JJWT Auth</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
