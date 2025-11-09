import { motion, useDragControls, type PanInfo } from "framer-motion";
import { useState } from "react";
import { cn } from "~/lib/utils";
import { ContextMenu, type ContextMenuItem } from "~/components/ui/context-menu";
import type { Clip } from "~/types/audio";
import {
  Copy,
  Scissors,
  Trash2,
  Volume2,
  VolumeX,
  SplitSquareVertical,
} from "lucide-react";

interface DraggableClipProps {
  clip: Clip;
  zoom: number;
  isSelected: boolean;
  onSelect: (clipId: string) => void;
  onMove: (clipId: string, newStartTime: number) => void;
  onResize: (clipId: string, newDuration: number) => void;
  onDuplicate?: (clipId: string) => void;
  onDelete?: (clipId: string) => void;
  onSplit?: (clipId: string) => void;
}

export function DraggableClip({
  clip,
  zoom,
  isSelected,
  onSelect,
  onMove,
  onResize,
  onDuplicate,
  onDelete,
  onSplit,
}: DraggableClipProps) {
  const [isDragging, setIsDragging] = useState(false);
  const dragControls = useDragControls();

  const handleDragStart = () => {
    setIsDragging(true);
    onSelect(clip.id);
  };

  const handleDrag = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    // Calculate new start time based on drag offset
    const pixelOffset = info.offset.x;
    const timeOffset = pixelOffset / zoom;
    const newStartTime = Math.max(0, clip.startTime + timeOffset);

    // Snap to grid (0.25 second intervals)
    const snappedTime = Math.round(newStartTime * 4) / 4;
    onMove(clip.id, snappedTime);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const contextMenuItems: ContextMenuItem[] = [
    {
      label: "Duplicate",
      icon: <Copy className="w-4 h-4" />,
      onClick: () => onDuplicate?.(clip.id),
      shortcut: "Ctrl+D",
    },
    {
      label: "Split at Playhead",
      icon: <Scissors className="w-4 h-4" />,
      onClick: () => onSplit?.(clip.id),
      shortcut: "S",
    },
    {
      separator: true,
    },
    {
      label: clip.gain && clip.gain < -40 ? "Unmute" : "Mute",
      icon: clip.gain && clip.gain < -40 ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />,
      onClick: () => {
        // Toggle mute (mock)
      },
      shortcut: "M",
    },
    {
      label: "Normalize",
      icon: <SplitSquareVertical className="w-4 h-4" />,
      onClick: () => {
        // Normalize audio (mock)
      },
    },
    {
      separator: true,
    },
    {
      label: "Delete",
      icon: <Trash2 className="w-4 h-4" />,
      onClick: () => onDelete?.(clip.id),
      danger: true,
      shortcut: "Del",
    },
  ];

  return (
    <ContextMenu items={contextMenuItems}>
      <motion.div
        drag="x"
        dragControls={dragControls}
        dragMomentum={false}
        dragElastic={0}
        onDragStart={handleDragStart}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        whileHover={{ scale: 1.02, zIndex: 10 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          "absolute top-2 bottom-2 rounded cursor-move transition-all",
          "hover:brightness-110",
          isSelected && "ring-2 ring-white shadow-lg",
          isDragging && "opacity-75 z-50"
        )}
        style={{
          left: clip.startTime * zoom,
          width: clip.duration * zoom,
          backgroundColor: clip.color,
        }}
        onClick={() => onSelect(clip.id)}
      >
        <div className="p-2 h-full flex flex-col justify-between pointer-events-none">
          <div className="text-xs font-medium text-white truncate">
            {clip.name}
          </div>
          <div className="flex justify-between items-end">
            <span className="text-xs text-white/70">
              {clip.type === "audio" ? "♪" : "⌨"}
            </span>
            <span className="text-xs text-white/70 font-mono">
              {clip.duration.toFixed(1)}s
            </span>
          </div>
        </div>

        {/* Fade indicators */}
        {clip.fadeIn && (
          <div
            className="absolute left-0 top-0 bottom-0 bg-black/20 pointer-events-none"
            style={{ width: `${(clip.fadeIn / clip.duration) * 100}%` }}
          />
        )}
        {clip.fadeOut && (
          <div
            className="absolute right-0 top-0 bottom-0 bg-black/20 pointer-events-none"
            style={{ width: `${(clip.fadeOut! / clip.duration) * 100}%` }}
          />
        )}

        {/* Resize handles */}
        <div
          className="absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-white/20 transition-colors pointer-events-auto"
          title="Resize left"
        />
        <div
          className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-white/20 transition-colors pointer-events-auto"
          title="Resize right"
        />
      </motion.div>
    </ContextMenu>
  );
}
