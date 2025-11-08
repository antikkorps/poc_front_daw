import { useState } from "react";
import { Layout } from "~/components/layout/Layout";
import { mockTracks, mockClips } from "~/lib/mockData";
import type { Track, Clip } from "~/types/audio";
import { cn } from "~/lib/utils";

export default function TimelinePage() {
  const [tracks] = useState<Track[]>(mockTracks);
  const [zoom, setZoom] = useState(50); // pixels per second
  const [selectedClips, setSelectedClips] = useState<Set<string>>(new Set());

  const maxTime = Math.max(...mockClips.map((c) => c.startTime + c.duration), 16);
  const timelineWidth = maxTime * zoom;

  const toggleClipSelection = (clipId: string) => {
    setSelectedClips((prev) => {
      const next = new Set(prev);
      if (next.has(clipId)) {
        next.delete(clipId);
      } else {
        next.add(clipId);
      }
      return next;
    });
  };

  return (
    <Layout>
      <div className="h-full flex flex-col bg-zinc-900">
        {/* Timeline Header */}
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Timeline</h2>
            <p className="text-zinc-400 text-sm mt-1">Arrange your audio and MIDI clips</p>
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center gap-4">
            <label className="text-sm text-zinc-400">Zoom</label>
            <input
              type="range"
              min={20}
              max={100}
              value={zoom}
              onChange={(e) => setZoom(parseInt(e.target.value))}
              className="w-32"
            />
            <span className="text-sm text-zinc-500 font-mono">{zoom}px/s</span>
          </div>
        </div>

        {/* Timeline Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Track Names */}
          <div className="w-48 bg-zinc-950 border-r border-zinc-800 overflow-y-auto">
            <div className="h-12 border-b border-zinc-800 flex items-center px-4 bg-zinc-900">
              <span className="text-xs text-zinc-500 font-semibold uppercase">Tracks</span>
            </div>
            {tracks.map((track) => (
              <div
                key={track.id}
                className="h-20 border-b border-zinc-800 flex items-center px-4 gap-3"
              >
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: track.color }}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{track.name}</div>
                  <div className="text-xs text-zinc-500">{track.type}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Timeline Grid and Clips */}
          <div className="flex-1 overflow-auto">
            <div className="relative" style={{ width: timelineWidth + 100 }}>
              {/* Time Ruler */}
              <div className="sticky top-0 z-10 h-12 bg-zinc-900 border-b border-zinc-800 flex items-center">
                {Array.from({ length: Math.ceil(maxTime) + 1 }).map((_, i) => (
                  <div
                    key={i}
                    className="absolute flex flex-col items-start"
                    style={{ left: i * zoom }}
                  >
                    <span className="text-xs text-zinc-500 font-mono">{i}s</span>
                    <div className="w-px h-2 bg-zinc-700" />
                  </div>
                ))}
              </div>

              {/* Track Lanes */}
              {tracks.map((track) => (
                <div
                  key={track.id}
                  className="relative h-20 border-b border-zinc-800 bg-zinc-950"
                >
                  {/* Grid lines */}
                  <div className="absolute inset-0 flex">
                    {Array.from({ length: Math.ceil(maxTime) + 1 }).map((_, i) => (
                      <div
                        key={i}
                        className="border-r border-zinc-900"
                        style={{ width: zoom }}
                      />
                    ))}
                  </div>

                  {/* Clips for this track */}
                  {track.clips.map((clip) => (
                    <div
                      key={clip.id}
                      className={cn(
                        "absolute top-2 bottom-2 rounded cursor-pointer transition-all",
                        "hover:brightness-110",
                        selectedClips.has(clip.id) && "ring-2 ring-white"
                      )}
                      style={{
                        left: clip.startTime * zoom,
                        width: clip.duration * zoom,
                        backgroundColor: clip.color,
                      }}
                      onClick={() => toggleClipSelection(clip.id)}
                    >
                      <div className="p-2 h-full flex flex-col justify-between">
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
                          className="absolute left-0 top-0 bottom-0 bg-black/20"
                          style={{ width: `${(clip.fadeIn / clip.duration) * 100}%` }}
                        />
                      )}
                      {clip.fadeOut && (
                        <div
                          className="absolute right-0 top-0 bottom-0 bg-black/20"
                          style={{ width: `${(clip.fadeOut! / clip.duration) * 100}%` }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Info Bar */}
        <div className="h-8 bg-zinc-950 border-t border-zinc-800 flex items-center px-4 text-xs text-zinc-500">
          {selectedClips.size > 0 ? (
            <span>{selectedClips.size} clip{selectedClips.size > 1 ? "s" : ""} selected</span>
          ) : (
            <span>Click clips to select · Drag to move (mock)</span>
          )}
        </div>
      </div>
    </Layout>
  );
}
