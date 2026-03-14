import * as React from "react";
import { cn } from "@/lib/utils";

/** Shared base styles for text inputs and textareas */
export const inputBaseStyles = [
  "w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-sand bg-linen/60 text-ink text-base sm:text-lg",
  "placeholder:text-clay/40 font-body",
  "focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/20",
  "transition-colors duration-200",
] as const;

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-base sm:text-lg font-medium text-clay mb-1.5 tracking-wide font-body"
          >
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={cn(
            ...inputBaseStyles,
            error && "border-wine focus:border-wine focus:ring-wine/20",
            className
          )}
          {...props}
        />
        {error && <p className="mt-1.5 text-base sm:text-lg text-wine font-body">{error}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";

export default Input;
