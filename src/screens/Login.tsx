import { useEffect, useState, useCallback } from 'react';
import { Fingerprint, Shield, Lock, AlertCircle, Loader2 } from 'lucide-react';

type Props = {
  onUnlock: () => void;
};

export default function Login({ onUnlock }: Props) {
  const [authenticating, setAuthenticating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [biometricSupported, setBiometricSupported] = useState<boolean | null>(null);

  useEffect(() => {
    const w = window as unknown as {
      PublicKeyCredential?: { isUserVerifyingPlatformAuthenticatorAvailable?: () => Promise<boolean> };
    };
    if (w.PublicKeyCredential?.isUserVerifyingPlatformAuthenticatorAvailable) {
      w.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
        .then(setBiometricSupported)
        .catch(() => setBiometricSupported(false));
    } else {
      setBiometricSupported(false);
    }
  }, []);

  const authenticate = useCallback(async () => {
    setError(null);
    setAuthenticating(true);
    try {
      const w = window as unknown as {
        PublicKeyCredential?: {
          isUserVerifyingPlatformAuthenticatorAvailable?: () => Promise<boolean>;
          create?: (opts: unknown) => Promise<unknown>;
        };
      };
      const supported = await w.PublicKeyCredential?.isUserVerifyingPlatformAuthenticatorAvailable?.();
      if (supported && w.PublicKeyCredential?.create) {
        const challenge = new Uint8Array(32);
        crypto.getRandomValues(challenge);
        const userId = new Uint8Array(16);
        crypto.getRandomValues(userId);
        await w.PublicKeyCredential.create({
          publicKey: {
            challenge,
            rp: { name: 'NeXu Driver' },
            user: { id: userId, name: 'driver@nexu.app', displayName: 'NeXu Driver' },
            pubKeyCredParams: [{ type: 'public-key', alg: -7 }],
            authenticatorSelection: { userVerification: 'required' },
            timeout: 60000,
          },
        });
      } else {
        await new Promise((r) => setTimeout(r, 900));
      }
      onUnlock();
    } catch {
      setError('Authentication was cancelled or failed. Try again.');
    } finally {
      setAuthenticating(false);
    }
  }, [onUnlock]);

  return (
    <div className="flex flex-col h-full bg-white px-6 pt-16 pb-8">
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 rounded-3xl bg-[#2ECC71]/10 border border-[#2ECC71]/20 flex items-center justify-center mb-6">
          <Shield size={36} className="text-[#2ECC71]" />
        </div>
        <h1 className="text-[#2C3E50] text-3xl font-black tracking-tight mb-2">NeXu Driver</h1>
        <p className="text-gray-500 text-sm mb-1">Secure driver app for Filipino riders</p>
        <p className="text-gray-400 text-xs">Motorcycle · Car · Tricycle · Van</p>

        {biometricSupported === false && (
          <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center gap-2 max-w-xs">
            <AlertCircle size={15} className="text-amber-500 flex-shrink-0" />
            <p className="text-amber-700 text-xs text-left">Biometric hardware not detected. Tap below to simulate unlock.</p>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4 flex items-center gap-2">
          <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <button
        onClick={authenticate}
        disabled={authenticating}
        className="w-full bg-[#2ECC71] active:bg-emerald-600 disabled:opacity-60 text-white font-bold text-lg py-4 rounded-2xl shadow-lg shadow-emerald-100 flex items-center justify-center gap-2.5 transition-all"
      >
        {authenticating ? (
          <>
            <Loader2 size={20} className="animate-spin" />
            Authenticating...
          </>
        ) : (
          <>
            <Fingerprint size={22} />
            Unlock with Biometrics
          </>
        )}
      </button>
      <button
        onClick={() => { setError(null); onUnlock(); }}
        className="mt-3 text-gray-500 text-sm font-medium flex items-center justify-center gap-1.5 py-2"
      >
        <Lock size={13} />
        Skip for now
      </button>
      <p className="text-center text-gray-400 text-xs mt-4">
        Uses WebAuthn (fingerprint / Face ID) when available
      </p>
    </div>
  );
}
