import { cn } from "@/lib/utils";

interface FlowerProps {
  color?: "coral" | "purple";
  size?: number;
  className?: string;
}

const PALETTES = {
  coral: { fill: "#FE5F55", shadow: "#DB5A42" },
  purple: { fill: "#E2C2FF", shadow: "#B084CC" },
};

export default function Flower({
  color = "coral",
  size = 20,
  className,
}: FlowerProps) {
  const petals = PALETTES[color];
  const center = "#FFD84D";

  const r = size / 2;
  const petalR = r * 0.42;
  const petalDist = r * 0.32;
  const centerR = r * 0.22;

  const petalAngles = [0, 72, 144, 216, 288];

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={cn("flower inline-block", className)}
      aria-hidden="true"
    >
      {/* Shadow petals (offset slightly down-right) */}
      {petalAngles.map((angle) => {
        const rad = (angle * Math.PI) / 180;
        const cx = Math.round((r + Math.cos(rad) * petalDist + 0.5) * 100) / 100;
        const cy = Math.round((r + Math.sin(rad) * petalDist + 0.5) * 100) / 100;
        return (
          <circle
            key={`shadow-${angle}`}
            cx={cx}
            cy={cy}
            r={petalR}
            fill={petals.shadow}
          />
        );
      })}
      {/* Main petals */}
      {petalAngles.map((angle) => {
        const rad = (angle * Math.PI) / 180;
        const cx = Math.round((r + Math.cos(rad) * petalDist) * 100) / 100;
        const cy = Math.round((r + Math.sin(rad) * petalDist) * 100) / 100;
        return (
          <circle
            key={`petal-${angle}`}
            cx={cx}
            cy={cy}
            r={petalR}
            fill={petals.fill}
          />
        );
      })}
      {/* Yellow center */}
      <circle cx={r} cy={r} r={centerR} fill={center} />
    </svg>
  );
}
