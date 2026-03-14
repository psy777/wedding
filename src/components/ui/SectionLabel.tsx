import Flower from "@/components/ui/Flower";
import { cn } from "@/lib/utils";

interface SectionLabelProps {
  children: React.ReactNode;
  /** Flowers to display before the text. Defaults to none. */
  before?: Array<{ color: "coral" | "purple"; size: number }>;
  /** Flowers to display after the text. Defaults to none. */
  after?: Array<{ color: "coral" | "purple"; size: number }>;
  className?: string;
}

export default function SectionLabel({
  children,
  before = [],
  after = [],
  className,
}: SectionLabelProps) {
  return (
    <div className={cn("flex items-center gap-2 sm:gap-3 mb-3", className)}>
      {before.map((f, i) => (
        <Flower key={`before-${i}`} color={f.color} size={f.size} />
      ))}
      <p className="text-base sm:text-lg uppercase tracking-[0.25em] sm:tracking-[0.3em] text-gold font-body">
        {children}
      </p>
      {after.map((f, i) => (
        <Flower key={`after-${i}`} color={f.color} size={f.size} />
      ))}
    </div>
  );
}
