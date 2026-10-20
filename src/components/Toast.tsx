import { useEffect, useState } from 'react';
import { CheckCircle2, X } from 'lucide-react';

type Props = {
  message: string;
  onDone: () => void;
};

export default function Toast({ message, onDone }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    const out = setTimeout(() => setVisible(false), 2800);
    const done = setTimeout(onDone, 3300);
    return () => { clearTimeout(out); clearTimeout(done); };
  }, [onDone]);

  return (
    <div
      className={`fixed bottom-24 left-4 right-4 z-50 transition-all duration-500 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
    >
      <div className="bg-[#0F172A] rounded-2xl px-4 py-3.5 flex items-center gap-3 shadow-2xl border border-white/10">
        <div className="w-8 h-8 rounded-full bg-[#10B981]/20 flex items-center justify-center flex-shrink-0">
          <CheckCircle2 size={18} className="text-[#10B981]" />
        </div>
        <p className="text-white text-sm font-medium flex-1">{message}</p>
        <button onClick={onDone} className="text-white/50 active:text-white">
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
