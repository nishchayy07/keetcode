import { useState, useCallback, useRef, useEffect } from "react";

interface ResizableSplitProps {
  left: React.ReactNode;
  right: React.ReactNode;
  defaultLeftPercent?: number;
  minLeftPercent?: number;
  maxLeftPercent?: number;
}

/**
 * A reliable CSS-based horizontal resizable split pane.
 * Uses mouse events directly — no third-party library quirks.
 */
export function ResizableSplit({
  left,
  right,
  defaultLeftPercent = 42,
  minLeftPercent = 20,
  maxLeftPercent = 70,
}: ResizableSplitProps) {
  const [leftPercent, setLeftPercent] = useState(defaultLeftPercent);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const onMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const raw = ((e.clientX - rect.left) / rect.width) * 100;
      setLeftPercent(Math.max(minLeftPercent, Math.min(maxLeftPercent, raw)));
    },
    [minLeftPercent, maxLeftPercent],
  );

  const onMouseUp = useCallback(() => {
    isDragging.current = false;
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);
  }, [onMouseMove]);

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      isDragging.current = true;
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    },
    [onMouseMove, onMouseUp],
  );

  // Clean up listeners if component unmounts while dragging
  useEffect(() => {
    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };
  }, [onMouseMove, onMouseUp]);

  return (
    <div ref={containerRef} className="flex h-full w-full overflow-hidden">
      {/* Left pane */}
      <div
        className="h-full overflow-y-auto flex-shrink-0"
        style={{ width: `${leftPercent}%` }}
      >
        {left}
      </div>

      {/* Drag handle */}
      <div
        className="group flex-shrink-0 w-1 h-full relative cursor-col-resize select-none"
        onMouseDown={onMouseDown}
      >
        <div className="absolute inset-0 bg-zinc-800 group-hover:bg-cyan-500/50 transition-colors duration-150" />
        {/* Visual grip dots */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col gap-[3px]">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-1 w-1 rounded-full bg-zinc-600 group-hover:bg-cyan-400/70 transition-colors"
            />
          ))}
        </div>
      </div>

      {/* Right pane */}
      <div className="flex-1 min-w-0 h-full overflow-hidden">
        {right}
      </div>
    </div>
  );
}
