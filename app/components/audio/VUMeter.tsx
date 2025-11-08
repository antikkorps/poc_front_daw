import { useEffect, useState } from "react";
import { cn } from "~/lib/utils";
import type { VUMeterData } from "~/types/audio";

interface VUMeterProps {
  trackId: string;
  className?: string;
  orientation?: "vertical" | "horizontal";
}

export function VUMeter({ trackId, className, orientation = "vertical" }: VUMeterProps) {
  const [meterData, setMeterData] = useState<VUMeterData>({
    peak: -60,
    rms: -60,
    peakHold: -60,
  });

  // Simulate real-time meter updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Generate mock meter data with some randomness
      const basePeak = -30 + Math.random() * 25;
      setMeterData((prev) => ({
        peak: basePeak,
        rms: basePeak - 3 - Math.random() * 6,
        peakHold: Math.max(prev.peakHold * 0.98, basePeak),
      }));
    }, 50); // Update at ~20fps

    return () => clearInterval(interval);
  }, [trackId]);

  const min = -60;
  const max = 6;

  // Convert dB to percentage
  const dbToPercent = (db: number) => {
    return ((db - min) / (max - min)) * 100;
  };

  const peakPercent = dbToPercent(meterData.peak);
  const rmsPercent = dbToPercent(meterData.rms);
  const peakHoldPercent = dbToPercent(meterData.peakHold);

  // Determine segment colors based on dB level
  const getSegmentColor = (db: number) => {
    if (db > 0) return "bg-red-500";
    if (db > -6) return "bg-yellow-500";
    if (db > -18) return "bg-green-500";
    return "bg-green-600";
  };

  const renderVerticalMeter = () => (
    <div className="relative w-6 h-full bg-zinc-900 rounded-sm border border-zinc-700 overflow-hidden">
      {/* RMS (darker background) */}
      <div
        className="absolute bottom-0 left-0 right-0 bg-green-700/40 transition-all"
        style={{ height: `${rmsPercent}%` }}
      />

      {/* Peak (bright) */}
      <div
        className={cn("absolute bottom-0 left-0 right-0 transition-all", getSegmentColor(meterData.peak))}
        style={{ height: `${peakPercent}%` }}
      />

      {/* Peak hold line */}
      <div
        className="absolute left-0 right-0 h-0.5 bg-white transition-all duration-100"
        style={{ bottom: `${peakHoldPercent}%` }}
      />

      {/* dB marks */}
      {[0, -6, -12, -18, -24, -30, -40, -50].map((db) => (
        <div
          key={db}
          className="absolute left-0 right-0 h-px bg-zinc-700"
          style={{ bottom: `${dbToPercent(db)}%` }}
        />
      ))}

      {/* 0dB mark (red line) */}
      <div
        className="absolute left-0 right-0 h-0.5 bg-red-500/50"
        style={{ bottom: `${dbToPercent(0)}%` }}
      />
    </div>
  );

  const renderHorizontalMeter = () => (
    <div className="relative h-6 w-full bg-zinc-900 rounded-sm border border-zinc-700 overflow-hidden">
      {/* RMS (darker background) */}
      <div
        className="absolute left-0 top-0 bottom-0 bg-green-700/40 transition-all"
        style={{ width: `${rmsPercent}%` }}
      />

      {/* Peak (bright) */}
      <div
        className={cn("absolute left-0 top-0 bottom-0 transition-all", getSegmentColor(meterData.peak))}
        style={{ width: `${peakPercent}%` }}
      />

      {/* Peak hold line */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-white transition-all duration-100"
        style={{ left: `${peakHoldPercent}%` }}
      />

      {/* 0dB mark (red line) */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-red-500/50"
        style={{ left: `${dbToPercent(0)}%` }}
      />
    </div>
  );

  return (
    <div className={cn("flex items-center justify-center", className)}>
      {orientation === "vertical" ? renderVerticalMeter() : renderHorizontalMeter()}
    </div>
  );
}
