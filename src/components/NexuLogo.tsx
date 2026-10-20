type Props = {
  size?: number;
  showWordmark?: boolean;
  className?: string;
};

export default function NexuLogo({ size = 40, showWordmark = false, className = '' }: Props) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="NeXu logo"
      >
        {/* Rounded background */}
        <rect width="48" height="48" rx="12" fill="#10B981" fillOpacity="0.08" />
        <rect x="0.5" y="0.5" width="47" height="47" rx="11.5" stroke="#10B981" strokeOpacity="0.2" />

        {/* Stylized N with delivery route arrow */}
        <path
          d="M14 34V14L28 28V14"
          stroke="#0F172A"
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        {/* Route arrow cutting through the N diagonal */}
        <path
          d="M16 30L34 16"
          stroke="#10B981"
          strokeWidth="4.5"
          strokeLinecap="round"
          fill="none"
        />
        {/* Arrowhead */}
        <path
          d="M28 14L35 15.5L33.5 22.5"
          stroke="#10B981"
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
      {showWordmark && (
        <span className="text-[#0F172A] font-black text-xl tracking-tight">NeXu</span>
      )}
    </div>
  );
}
