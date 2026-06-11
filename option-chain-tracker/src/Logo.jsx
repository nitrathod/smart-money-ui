// ============================================================================
// Logo — four ascending bars representing the 4 intervals (9:20, 11:00, 1:00, 3:00)
// Last bar is amber for brand continuity. Slate-900 for the rest.
// ============================================================================
export function Logo({ size = 22, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 22 22"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Smart Money logo"
      role="img"
    >
      <rect x="2"  y="13" width="3" height="7"  rx="0.5" fill="#0f172a" />
      <rect x="7"  y="9"  width="3" height="11" rx="0.5" fill="#0f172a" />
      <rect x="12" y="6"  width="3" height="14" rx="0.5" fill="#0f172a" />
      <rect x="17" y="2"  width="3" height="18" rx="0.5" fill="#f59e0b" />
    </svg>
  );
}
