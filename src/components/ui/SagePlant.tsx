interface SagePlantProps {
  size?: number;
  flip?: boolean;
  className?: string;
}

export default function SagePlant({
  size = 48,
  flip = false,
  className = "",
}: SagePlantProps) {
  return (
    <svg
      width={size}
      height={size * 1.6}
      viewBox="0 0 40 64"
      className={`flower inline-block ${className}`}
      style={flip ? { transform: "scaleX(-1)" } : undefined}
      aria-hidden="true"
    >
      {/* Stem */}
      <path
        d="M20 60 C20 45, 18 30, 20 10"
        stroke="#606D5D"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />
      {/* Leaves - alternating sides */}
      <ellipse cx="13" cy="14" rx="8" ry="4" fill="#C5DCA0" transform="rotate(-30 13 14)" />
      <ellipse cx="12" cy="14" rx="7" ry="3.5" fill="#606D5D" opacity="0.2" transform="rotate(-30 12 14)" />

      <ellipse cx="28" cy="22" rx="8" ry="4" fill="#C5DCA0" transform="rotate(25 28 22)" />
      <ellipse cx="27" cy="22" rx="7" ry="3.5" fill="#606D5D" opacity="0.2" transform="rotate(25 27 22)" />

      <ellipse cx="12" cy="30" rx="7" ry="3.5" fill="#C5DCA0" transform="rotate(-25 12 30)" />
      <ellipse cx="11" cy="30" rx="6" ry="3" fill="#606D5D" opacity="0.2" transform="rotate(-25 11 30)" />

      <ellipse cx="27" cy="38" rx="7" ry="3.5" fill="#C5DCA0" transform="rotate(20 27 38)" />
      <ellipse cx="26" cy="38" rx="6" ry="3" fill="#606D5D" opacity="0.2" transform="rotate(20 26 38)" />

      <ellipse cx="14" cy="46" rx="6" ry="3" fill="#C5DCA0" transform="rotate(-20 14 46)" />
      <ellipse cx="13" cy="46" rx="5" ry="2.5" fill="#606D5D" opacity="0.2" transform="rotate(-20 13 46)" />

      {/* Top leaf (bud) */}
      <ellipse cx="20" cy="8" rx="4" ry="6" fill="#C5DCA0" transform="rotate(5 20 8)" />
      <ellipse cx="19.5" cy="8" rx="3" ry="5" fill="#606D5D" opacity="0.15" transform="rotate(5 19.5 8)" />
    </svg>
  );
}
