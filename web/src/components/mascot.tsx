/** "Bo", the Supaboard mascot: a rounded stack of billboard tiles topped by a coin. */
export function Mascot({ className = "h-16 w-16" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} role="img" aria-label="Bo, the Supaboard mascot">
      <circle cx="32" cy="18" r="11" fill="#FFC800" />
      <circle cx="32" cy="18" r="7" fill="#E5A100" />
      <text
        x="32"
        y="22"
        textAnchor="middle"
        fontSize="10"
        fontWeight="900"
        fill="#FFFDF0"
        fontFamily="inherit"
      >
        S
      </text>
      <rect x="12" y="30" width="40" height="26" rx="8" fill="#58CC02" />
      <rect x="12" y="30" width="40" height="26" rx="8" fill="none" stroke="#46A302" strokeWidth="3" />
      <circle cx="24" cy="43" r="3.2" fill="#FFFFFF" />
      <circle cx="40" cy="43" r="3.2" fill="#FFFFFF" />
      <circle cx="24" cy="43" r="1.4" fill="#131F24" />
      <circle cx="40" cy="43" r="1.4" fill="#131F24" />
      <path d="M27 50c2 2 8 2 10 0" stroke="#FFFFFF" strokeWidth="2.4" fill="none" strokeLinecap="round" />
    </svg>
  );
}
