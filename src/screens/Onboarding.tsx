import { useState, useRef } from 'react';
import { ChevronRight, ArrowLeft } from 'lucide-react';
import NexuLogo from '@/components/NexuLogo';

type Props = {
  onComplete: () => void;
};

type Slide = {
  image: string;
  title: string;
  subtitle: string;
};

const slides: Slide[] = [
  {
    image: 'https://images.unsplash.com/photo-1526367790999-0150786686a2?w=600',
    title: 'Shop, deliver, and earn.',
    subtitle: 'Start your side hustle or full-time business with NeXu.',
  },
  {
    image: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=600',
    title: 'Where do we deliver?',
    subtitle: 'Available across NCR, Bulacan, Calabarzon, and Dagupan.',
  },
  {
    image: 'https://images.unsplash.com/photo-1512428559087-560fa5ceab42?w=600',
    title: 'How does it work?',
    subtitle: 'Choose the offers you want to accept and when you want to drive.',
  },
  {
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600',
    title: 'Ready to hit the road?',
    subtitle: "Let us know where you want to drive.",
  },
];

export default function Onboarding({ onComplete }: Props) {
  const [index, setIndex] = useState(0);
  const startX = useRef<number | null>(null);

  const isLast = index === slides.length - 1;

  const goNext = () => {
    if (isLast) {
      onComplete();
    } else {
      setIndex(i => Math.min(i + 1, slides.length - 1));
    }
  };

  const goPrev = () => setIndex(i => Math.max(i - 1, 0));

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (startX.current === null) return;
    const delta = e.changedTouches[0].clientX - startX.current;
    if (delta < -40) goNext();
    else if (delta > 40) goPrev();
    startX.current = null;
  };

  const slide = slides[index];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col max-w-md mx-auto" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      {/* Skip button */}
      <div className="flex justify-end px-5 pt-14 pb-2 flex-shrink-0">
        <button onClick={onComplete} className="text-gray-400 text-sm font-medium active:opacity-70">
          Skip
        </button>
      </div>

      {/* Slide content */}
      <div className="flex-1 flex flex-col items-center px-6 pb-6">
        <NexuLogo size={56} showWordmark className="mb-8" />

        {/* Image */}
        <div className="w-full aspect-[4/3] rounded-3xl overflow-hidden mb-8 shadow-sm">
          <img
            src={slide.image}
            alt={slide.title}
            className="w-full h-full object-cover"
            loading="eager"
          />
        </div>

        {/* Text */}
        <h2 className="text-[#0F172A] text-2xl font-black text-center tracking-tight mb-3 leading-snug">
          {slide.title}
        </h2>
        <p className="text-gray-500 text-base text-center leading-relaxed max-w-xs">
          {slide.subtitle}
        </p>
      </div>

      {/* Dots + buttons */}
      <div className="flex-shrink-0 px-6 pb-10 space-y-6">
        <div className="flex items-center justify-center gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`h-2 rounded-full transition-all ${
                i === index ? 'w-8 bg-[#10B981]' : 'w-2 bg-gray-200'
              }`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>

        <div className="flex items-center gap-3">
          {index > 0 && (
            <button
              onClick={goPrev}
              className="w-12 h-12 rounded-2xl bg-gray-100 text-gray-500 flex items-center justify-center active:opacity-70 flex-shrink-0"
            >
              <ArrowLeft size={20} />
            </button>
          )}
          <button
            onClick={goNext}
            className="flex-1 bg-gradient-to-r from-[#10B981] to-[#059669] hover:scale-[1.02] active:scale-95 text-white font-bold tracking-wide text-lg py-4 rounded-full shadow-lg shadow-[#10B981]/30 flex items-center justify-center gap-2 transition-all duration-200"
          >
            {isLast ? 'Get Started' : 'Next'}
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
