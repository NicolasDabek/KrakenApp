export function NautilusMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      aria-hidden="true"
      fill="none"
    >
      <rect width="32" height="32" rx="8" fill="currentColor" className="text-accent" />
      <path
        d="M22.5 16c0 4.14-3.02 7.5-6.75 7.5-2.9 0-5.35-2.02-6.3-4.82"
        stroke="#07080A"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M21.2 16c0 3.2-2.32 5.8-5.18 5.8-2.18 0-4.04-1.5-4.8-3.66"
        stroke="#07080A"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.85"
      />
      <path
        d="M19.6 16c0 2.16-1.55 3.9-3.45 3.9-1.4 0-2.6-.95-3.12-2.32"
        stroke="#07080A"
        strokeWidth="1.35"
        strokeLinecap="round"
        opacity="0.7"
      />
      <circle cx="16.2" cy="16.1" r="1.35" fill="#07080A" />
    </svg>
  );
}
