import { useState, useRef, useEffect } from "react";
import { cn, clamp, linearToDb, dbToLinear } from "~/lib/utils";

interface FaderProps {
  value: number; // dB value (-60 to +6)
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  className?: string;
  label?: string;
}

export function Fader({
  value,
  onChange,
  min = -60,
  max = 6,
  className,
  label,
}: FaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const faderRef = useRef<HTMLDivElement>(null);

  const percentage = ((value - min) / (max - min)) * 100;

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    updateValue(e.clientY);
  };

  const updateValue = (clientY: number) => {
    if (!faderRef.current) return;

    const rect = faderRef.current.getBoundingClientRect();
    const y = clamp(clientY - rect.top, 0, rect.height);
    const percentage = 1 - y / rect.height;
    const newValue = min + percentage * (max - min);
    onChange(clamp(newValue, min, max));
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      updateValue(e.clientY);
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
  }, [isDragging, min, max]);

  // Determine color based on dB value
  const getColor = () => {
    if (value > 0) return "bg-red-500";
    if (value > -6) return "bg-yellow-500";
    return "bg-cyan-500";
  };

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <div
        ref={faderRef}
        className="relative w-8 h-48 bg-zinc-900 rounded-sm border border-zinc-700 cursor-ns-resize select-none"
        onMouseDown={handleMouseDown}
      >
        {/* 0dB mark */}
        <div className="absolute left-0 right-0 h-px bg-zinc-600" style={{ bottom: `${((0 - min) / (max - min)) * 100}%` }} />

        {/* Fill */}
        <div
          className={cn("absolute bottom-0 left-0 right-0 transition-colors", getColor())}
          style={{ height: `${percentage}%` }}
        />

        {/* Thumb */}
        <div
          className={cn(
            "absolute left-0 right-0 h-3 bg-zinc-200 border border-zinc-400 rounded-sm shadow-lg transition-shadow",
            isDragging && "shadow-xl"
          )}
          style={{ bottom: `calc(${percentage}% - 6px)` }}
        />
      </div>

      {/* Value display */}
      <div className="text-xs text-zinc-400 font-mono w-12 text-center">
        {value > -60 ? `${value.toFixed(1)}dB` : "-∞"}
      </div>

      {label && (
        <div className="text-xs text-zinc-500 font-medium">{label}</div>
      )}
    </div>
  );
}
