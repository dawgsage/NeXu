import { useState } from 'react';
import { Lock, Shield, ArrowLeft, AlertCircle } from 'lucide-react';

type Props = {
  onUnlock: () => void;
  onBack: () => void;
};

const ADMIN_PIN = '1234';

export default function AdminLogin({ onUnlock, onBack }: Props) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === ADMIN_PIN) {
      sessionStorage.setItem('nexu_admin', '1');
      onUnlock();
    } else {
      setError(true);
      setPin('');
    }
  };

  return (
    <div className="min-h-screen bg-[#001F3F] flex flex-col items-center justify-center px-6">
      <button onClick={onBack} className="absolute top-6 left-6 flex items-center gap-2 text-blue-300 text-sm">
        <ArrowLeft size={16} /> Back to app
      </button>

      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-[#2ECC71]/15 border border-[#2ECC71]/30 flex items-center justify-center mb-4">
            <Shield size={30} className="text-[#2ECC71]" />
          </div>
          <h1 className="text-white text-2xl font-bold">NeXu Admin</h1>
          <p className="text-blue-300 text-sm mt-1">Enter your PIN to access the dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400" />
            <input
              type="password"
              inputMode="numeric"
              value={pin}
              onChange={e => { setPin(e.target.value); setError(false); }}
              placeholder="Enter PIN"
              autoFocus
              className="w-full bg-white/10 border border-white/20 rounded-xl pl-11 pr-4 py-3.5 text-white text-lg tracking-widest placeholder:text-blue-400/50 focus:outline-none focus:border-[#2ECC71]"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-400 text-sm">
              <AlertCircle size={15} /> Incorrect PIN. Try again.
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-[#2ECC71] active:bg-emerald-600 text-white font-bold py-3.5 rounded-xl transition-colors"
          >
            Unlock Dashboard
          </button>
        </form>

        <p className="text-center text-blue-400/50 text-xs mt-6">Demo PIN: 1234</p>
      </div>
    </div>
  );
}
