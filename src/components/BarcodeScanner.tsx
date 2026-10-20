import { useEffect, useRef, useState, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X, Camera, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

type Props = {
  expectedBarcode: string | null;
  onScan: (barcode: string) => void;
  onClose: () => void;
};

export default function BarcodeScanner({ expectedBarcode, onScan, onClose }: Props) {
  const containerId = 'barcode-scanner-region';
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [status, setStatus] = useState<'starting' | 'scanning' | 'error'>('starting');
  const [errorMsg, setErrorMsg] = useState('');
  const scannedRef = useRef(false);

  useEffect(() => {
    let mounted = true;
    const start = async () => {
      try {
        const scanner = new Html5Qrcode(containerId, { verbose: false });
        scannerRef.current = scanner;
        await scanner.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 250, height: 180 } },
          (_decodedText: string) => {
            if (scannedRef.current || !mounted) return;
            scannedRef.current = true;
            scanner.stop().then(() => onScan(_decodedText)).catch(() => onScan(_decodedText));
          },
          () => {}
        );
        if (mounted) setStatus('scanning');
      } catch (err) {
        if (mounted) {
          setStatus('error');
          setErrorMsg((err as Error).message || 'Camera access denied. Check browser permissions.');
        }
      }
    };
    start();

    return () => {
      mounted = false;
      const s = scannerRef.current;
      if (s) {
        s.stop().then(() => s.clear()).catch(() => {});
      }
    };
  }, [onScan]);

  return (
    <div className="fixed inset-0 bg-black z-[60] flex flex-col">
      <div className="flex items-center justify-between px-4 pt-12 pb-4 bg-black/80">
        <div>
          <p className="text-white font-bold text-lg">Scan Barcode</p>
          {expectedBarcode && (
            <p className="text-blue-300 text-xs mt-0.5">Expected: {expectedBarcode}</p>
          )}
        </div>
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center active:bg-white/20"
        >
          <X size={20} className="text-white" />
        </button>
      </div>

      <div className="flex-1 relative flex items-center justify-center">
        {status === 'starting' && (
          <div className="flex flex-col items-center gap-3">
            <Loader2 size={32} className="text-[#2ECC71] animate-spin" />
            <p className="text-white/70 text-sm">Starting camera...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center gap-3 px-8 text-center">
            <AlertCircle size={36} className="text-red-400" />
            <p className="text-white font-medium">Camera unavailable</p>
            <p className="text-white/60 text-sm">{errorMsg}</p>
            <button onClick={onClose} className="mt-2 bg-white/10 text-white px-5 py-2.5 rounded-xl text-sm">Close</button>
          </div>
        )}

        {status === 'scanning' && (
          <>
            <div id={containerId} className="w-full h-full" />
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-[250px] h-[180px] border-2 border-[#2ECC71] rounded-2xl shadow-lg" />
            </div>
            <div className="absolute bottom-8 left-0 right-0 text-center">
              <p className="text-white/80 text-sm flex items-center justify-center gap-1.5">
                <Camera size={14} /> Point at the barcode
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export function useBarcodeScanner() {
  const [open, setOpen] = useState(false);
  const openScanner = useCallback(() => setOpen(true), []);
  const closeScanner = useCallback(() => setOpen(false), []);
  return { open, openScanner, closeScanner };
}

export function ScanSuccess({ name, brand }: { name: string; brand: string }) {
  return (
    <div className="flex items-center gap-2 text-[#2ECC71]">
      <CheckCircle2 size={16} />
      <span className="text-sm font-medium">{name}{brand && ` — ${brand}`}</span>
    </div>
  );
}
