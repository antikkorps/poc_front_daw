import { useState, useRef, useEffect } from "react";
import { cn, clamp } from "~/lib/utils";

interface KnobProps {
  value: number; // normalized 0-1 or custom range
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  label?: string;
  valueDisplay?: (value: number) => string;
  className?: string;
}

export function Knob({
  value,
  onChange,
  min = 0,
  max = 1,
  size = "md",
  label,
  valueDisplay,
  className,
}: KnobProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [startValue, setStartValue] = useState(value);

  const sizeClasses = {
    sm: "w-12 h-12",
    md: "w-16 h-16",
    lg: "w-20 h-20",
  };

  // Convert value to angle (-135deg to +135deg)
  const normalized = (value - min) / (max - min);
  const angle = -135 + normalized * 270;

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setStartY(e.clientY);
    setStartValue(value);
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaY = startY - e.clientY;
      const sensitivity = 0.005;
      const delta = deltaY * sensitivity * (max - min);
      const newValue = clamp(startValue + delta, min, max);
      onChange(newValue);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, startY, startValue, min, max, onChange]);

  const displayValue = valueDisplay ? valueDisplay(value) : value.toFixed(2);

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <div
        className={cn(
          "relative rounded-full bg-zinc-900 border-2 border-zinc-700 cursor-ns-resize select-none transition-shadow",
          sizeClasses[size],
          isDragging && "shadow-lg shadow-cyan-500/20"
        )}
        onMouseDown={handleMouseDown}
      >
        {/* Tick marks */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
          {/* Background arc */}
          <path
            d="M 15,85 A 40 40 0 1 1 85,85"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-zinc-800"
          />

          {/* Value arc */}
          <path
            d="M 15,85 A 40 40 0 1 1 85,85"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeDasharray={`${normalized * 188.5} 188.5`}
            strokeLinecap="round"
            className="text-cyan-500 transition-all"
          />

          {/* Indicator line */}
          <line
            x1="50"
            y1="50"
            x2="50"
            y2="20"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            className="text-zinc-200"
            transform={`rotate(${angle} 50 50)`}
          />

          {/* Center dot */}
          <circle cx="50" cy="50" r="4" fill="currentColor" className="text-zinc-200" />
        </svg>
      </div>

      {/* Value display */}
      <div className="text-xs text-zinc-400 font-mono">{displayValue}</div>

      {label && (
        <div className="text-xs text-zinc-500 font-medium">{label}</div>
      )}
    </div>
  );
}
