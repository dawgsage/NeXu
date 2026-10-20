import { useState } from 'react';
import { User, Fingerprint, Siren, Shield, Bike, ToggleLeft, ToggleRight, X, Phone, AlertTriangle, LayoutDashboard, ChevronRight } from 'lucide-react';
import NexuLogo from '@/components/NexuLogo';

type Props = {
  biometricEnabled: boolean;
  onToggleBiometric: (v: boolean) => void;
};

export default function Profile({ biometricEnabled, onToggleBiometric }: Props) {
  const [showSOS, setShowSOS] = useState(false);

  return (
    <div className="flex flex-col h-full bg-[#F8F9FA]">
      <div className="bg-white px-5 pt-12 pb-8 flex-shrink-0 border-b border-gray-100">
        <h1 className="text-[#2C3E50] text-2xl font-bold">Profile</h1>
        <p className="text-gray-400 text-sm mt-0.5">Account & settings</p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {/* Driver card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center flex-shrink-0">
            <User size={30} className="text-[#2ECC71]" />
          </div>
          <div className="flex-1">
            <p className="text-[#2C3E50] text-lg font-bold">NeXu Driver</p>
            <p className="text-gray-400 text-sm">driver@nexu.app</p>
            <div className="flex items-center gap-1.5 mt-1.5">
              <Bike size={13} className="text-[#2ECC71]" />
              <span className="text-gray-500 text-xs font-medium">All vehicle types</span>
            </div>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-1.5 text-center">
            <p className="text-[#2ECC71] text-xs font-bold">Online</p>
          </div>
        </div>

        {/* Security section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <p className="text-gray-400 text-xs font-semibold uppercase tracking-wide px-5 pt-4 pb-2">Security</p>
          <div className="px-5 pb-4">
            <button
              onClick={() => onToggleBiometric(!biometricEnabled)}
              className="w-full flex items-center gap-3 py-3"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                <Fingerprint size={18} className="text-[#2ECC71]" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-[#2C3E50] font-semibold text-sm">Biometric Unlock</p>
                <p className="text-gray-400 text-xs">Require fingerprint / Face ID to open</p>
              </div>
              {biometricEnabled ? (
                <ToggleRight size={32} className="text-[#2ECC71]" />
              ) : (
                <ToggleLeft size={32} className="text-gray-300" />
              )}
            </button>
          </div>
        </div>

        {/* Safety section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <p className="text-gray-400 text-xs font-semibold uppercase tracking-wide px-5 pt-4 pb-2">Safety</p>
          <div className="px-5 pb-4">
            <button
              onClick={() => setShowSOS(true)}
              className="w-full flex items-center gap-3 py-3"
            >
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
                <Siren size={18} className="text-red-500" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-[#2C3E50] font-semibold text-sm">SOS Emergency</p>
                <p className="text-gray-400 text-xs">Alert support & share location</p>
              </div>
            </button>
          </div>
        </div>

        {/* Admin access */}
        <button
          onClick={() => { window.location.hash = '#/admin'; }}
          className="w-full bg-white border border-gray-100 rounded-2xl shadow-sm p-4 flex items-center gap-3 active:opacity-90 transition-opacity"
        >
          <div className="w-10 h-10 rounded-xl bg-[#2ECC71]/10 border border-[#2ECC71]/20 flex items-center justify-center flex-shrink-0">
            <LayoutDashboard size={18} className="text-[#2ECC71]" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-[#2C3E50] font-semibold text-sm">Admin Dashboard</p>
            <p className="text-gray-400 text-xs">Manage orders, drivers & settings</p>
          </div>
          <ChevronRight size={18} className="text-gray-300" />
        </button>

        {/* About */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <p className="text-gray-400 text-xs font-semibold uppercase tracking-wide mb-3">About</p>
          <div className="space-y-2.5">
            <div className="flex justify-between">
              <span className="text-gray-500 text-sm">App Version</span>
              <span className="text-[#2C3E50] font-medium text-sm">NeXu 2.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 text-sm">Region</span>
              <span className="text-[#2C3E50] font-medium text-sm">Metro Manila · PH</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 text-sm">Support</span>
              <span className="text-[#2ECC71] font-medium text-sm">support@nexu.app</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-1.5 py-3">
          <Shield size={13} className="text-gray-300" />
          <p className="text-gray-400 text-xs">Secured by NeXu · Supabase Realtime</p>
        </div>

        <div className="flex items-center justify-center py-2">
          <NexuLogo size={20} />
          <p className="text-gray-400 text-[11px] font-medium ml-2">Designed & Developed by Angel Kim x Spudsage</p>
        </div>
      </div>

      {showSOS && <SOSSheet onClose={() => setShowSOS(false)} />}
    </div>
  );
}

function SOSSheet({ onClose }: { onClose: () => void }) {
  const [sent, setSent] = useState(false);

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end" onClick={onClose}>
      <div className="bg-white w-full rounded-t-3xl p-5 pb-8" onClick={e => e.stopPropagation()}>
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4" />
        {sent ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-3 animate-pulse">
              <Siren size={30} className="text-red-500" />
            </div>
            <h3 className="text-[#2C3E50] font-bold text-lg">SOS Alert Sent</h3>
            <p className="text-gray-400 text-sm mt-1 mb-1">NeXu support has been notified.</p>
            <p className="text-gray-400 text-xs">Stay safe. Help is on the way.</p>
            <button onClick={onClose} className="mt-5 bg-[#2ECC71] text-white font-medium px-6 py-2.5 rounded-xl">Close</button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-red-600 font-bold text-lg flex items-center gap-2">
                <AlertTriangle size={18} />
                SOS Emergency
              </h3>
              <button onClick={onClose}><X size={18} className="text-gray-400" /></button>
            </div>
            <p className="text-gray-400 text-sm mb-4">This will alert NeXu support and share your last known location. Only use in real emergencies.</p>
            <div className="space-y-2 mb-4">
              <a href="tel:117" className="w-full flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5">
                <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                  <Phone size={18} className="text-red-500" />
                </div>
                <div className="flex-1">
                  <p className="text-[#2C3E50] font-semibold text-sm">Call Emergency Services</p>
                  <p className="text-gray-400 text-xs">117 — Philippines National Hotline</p>
                </div>
              </a>
            </div>
            <button
              onClick={() => setSent(true)}
              className="w-full bg-red-500 active:bg-red-600 text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2"
            >
              <Siren size={18} />
              Send SOS Alert
            </button>
          </>
        )}
      </div>
    </div>
  );
}
