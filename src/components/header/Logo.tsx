export default function Logo({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Капля воды */}
      <path
        d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0L12 2.69z"
        fill="currentColor"
        opacity="0.8"
      />
      {/* Волны */}
      <path
        d="M3 15c2 0 4-1 5-2s3-2 5-2 4 1 5 2"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
      />
      <path
        d="M3 19c2 0 4-1 5-2s3-2 5-2 4 1 5 2"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
      />
      {/* Контроль/мониторинг - круг */}
      <circle
        cx="12"
        cy="10"
        r="2"
        fill="currentColor"
        opacity="0.6"
      />
    </svg>
  );
}

