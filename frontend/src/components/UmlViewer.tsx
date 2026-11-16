import { useEffect, useRef, useState, useCallback, type MouseEvent, type TouchEvent, type WheelEvent } from 'react';
import mermaid from 'mermaid';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Minimize2,
  Download,
  Move,
  Loader2,
  AlertTriangle,
  Check,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface UmlViewerProps {
  id: string;
  code: string;
  title: string;
  className?: string;
}

export function UmlViewer({ id, code, title, className = '' }: UmlViewerProps) {
  const { theme } = useTheme();
  const isDark =
    theme === 'dark' ||
    (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);

  const [svgContent, setSvgContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [renderError, setRenderError] = useState<string | null>(null);

  // Pan & Zoom Transform States
  const [scale, setScale] = useState<number>(1.0);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isDownloaded, setIsDownloaded] = useState<boolean>(false);

  // Drag coordinates ref to avoid stale state in window listeners
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const posRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    posRef.current = position;
  }, [position]);

  // Touch pinch-to-zoom tracking
  const initialPinchDistRef = useRef<number | null>(null);
  const initialScaleRef = useRef<number>(1.0);

  // Render Mermaid Diagram to SVG
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setRenderError(null);

    const renderDiagram = async () => {
      try {
        mermaid.initialize({
          startOnLoad: false,
          theme: isDark ? 'dark' : 'default',
          securityLevel: 'loose',
          fontFamily: 'Poppins, system-ui, -apple-system, sans-serif',
          flowchart: {
            useMaxWidth: false,
            htmlLabels: true,
            curve: 'basis',
            padding: 15,
          },
          sequence: {
            useMaxWidth: false,
            actorFontFamily: 'Poppins, sans-serif',
            messageFontFamily: 'Poppins, sans-serif',
            boxMargin: 10,
          },
          state: {
            useMaxWidth: false,
          },
          class: {
            useMaxWidth: false,
          },
          themeVariables: isDark
            ? {
                darkMode: true,
                background: '#0d1017',
                primaryColor: '#1e293b',
                primaryTextColor: '#f8fafc',
                primaryBorderColor: '#3b82f6',
                lineColor: '#60a5fa',
                secondaryColor: '#1e2230',
                tertiaryColor: '#131824',
                fontSize: '12px',
              }
            : {
                darkMode: false,
                background: '#ffffff',
                primaryColor: '#f1f5f9',
                primaryTextColor: '#0f172a',
                primaryBorderColor: '#2563eb',
                lineColor: '#2563eb',
                secondaryColor: '#f8fafc',
                tertiaryColor: '#e2e8f0',
                fontSize: '12px',
              },
        });

        // Clean unique ID without colons or spaces
        const sanitizedId = `mermaid_${id.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}`;
        const { svg } = await mermaid.render(sanitizedId, code);

        if (isMounted) {
          // Ensure SVG has proper scaling attributes and does not squish
          let processedSvg = svg;
          // Remove inline max-width that may force shrinking
          processedSvg = processedSvg.replace(/max-width:\s*[^;"]+;?/gi, '');
          setSvgContent(processedSvg);
          setIsLoading(false);
        }
      } catch (err: any) {
        if (isMounted) {
          console.error(`[UmlViewer] Error rendering diagram ${id}:`, err);
          setRenderError(err?.message || 'Gagal merender diagram Mermaid');
          setIsLoading(false);
        }
      }
    };

    renderDiagram();

    return () => {
      isMounted = false;
    };
  }, [id, code, isDark]);

  // Reset transform when diagram changes
  useEffect(() => {
    setScale(1.0);
    setPosition({ x: 0, y: 0 });
  }, [id]);

  // Zoom In / Out Handlers
  const handleZoomIn = () => {
    setScale((prev) => Math.min(Number((prev + 0.25).toFixed(2)), 3.5));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(Number((prev - 0.25).toFixed(2)), 0.35));
  };

  const handleResetZoom = () => {
    setScale(1.0);
    setPosition({ x: 0, y: 0 });
  };

  // Mouse Wheel Zooming
  const handleWheel = (e: WheelEvent<HTMLDivElement>) => {
    // Only zoom when mouse is over canvas
    e.preventDefault();
    const zoomFactor = -e.deltaY * 0.0015;
    setScale((prev) => {
      const next = prev + zoomFactor;
      return Math.min(Math.max(Number(next.toFixed(2)), 0.35), 3.5);
    });
  };

  // Mouse Drag to Pan
  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    // Left click only
    if (e.button !== 0) return;
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX - posRef.current.x,
      y: e.clientY - posRef.current.y,
    };
  };

  const handleMouseMove = useCallback((e: globalThis.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y,
    });
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Touch Drag & Pinch Zoom for Mobile / Tablet
  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      setIsDragging(true);
      dragStartRef.current = {
        x: touch.clientX - posRef.current.x,
        y: touch.clientY - posRef.current.y,
      };
    } else if (e.touches.length === 2) {
      // 2 fingers: pinch zoom
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const dist = Math.hypot(touch1.clientX - touch2.clientX, touch1.clientY - touch2.clientY);
      initialPinchDistRef.current = dist;
      initialScaleRef.current = scale;
    }
  };

  const handleTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 1 && isDragging) {
      const touch = e.touches[0];
      setPosition({
        x: touch.clientX - dragStartRef.current.x,
        y: touch.clientY - dragStartRef.current.y,
      });
    } else if (e.touches.length === 2 && initialPinchDistRef.current !== null) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const currentDist = Math.hypot(touch1.clientX - touch2.clientX, touch1.clientY - touch2.clientY);
      const ratio = currentDist / initialPinchDistRef.current;
      const nextScale = Number((initialScaleRef.current * ratio).toFixed(2));
      setScale(Math.min(Math.max(nextScale, 0.35), 3.5));
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    initialPinchDistRef.current = null;
  };

  // Download SVG file directly
  const handleDownloadSvg = () => {
    if (!svgContent) return;
    const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sipatir-uml-${id}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setIsDownloaded(true);
    setTimeout(() => setIsDownloaded(false), 2500);
  };

  // Fullscreen escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  const percentage = Math.round(scale * 100);

  return (
    <>
      <div
        ref={containerRef}
        className={`relative rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0c0f17] overflow-hidden flex flex-col shadow-xs select-none ${className} ${
          isFullscreen
            ? 'fixed inset-2 sm:inset-6 z-50 pt-[max(0.5rem,env(safe-area-inset-top,0px))] pb-[max(0.5rem,env(safe-area-inset-bottom,0px))] pl-[max(0.5rem,env(safe-area-inset-left,0px))] pr-[max(0.5rem,env(safe-area-inset-right,0px))] shadow-2xl border-blue-500/50'
            : ''
        }`}
      >
        {/* Top Control Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-2.5 sm:px-4 py-2 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/90 dark:bg-[#111420]/90 backdrop-blur-sm z-10">
          {/* Title & Zoom Info */}
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
            <span className="font-semibold text-xs text-zinc-900 dark:text-white flex items-center gap-1.5 truncate max-w-[140px] xs:max-w-[200px] sm:max-w-xs md:max-w-md">
              <Move className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
              <span className="truncate">{title}</span>
            </span>
            <span className="text-[10px] sm:text-[11px] font-mono px-1.5 sm:px-2 py-0.5 rounded-md bg-zinc-200/80 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium shrink-0">
              {percentage}%
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={handleZoomOut}
              className="p-1.5 rounded-md bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 transition cursor-pointer shadow-2xs active:scale-95 touch-manipulation"
              title="Perkecil Diagram (Zoom Out)"
              aria-label="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={handleZoomIn}
              className="p-1.5 rounded-md bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 transition cursor-pointer shadow-2xs active:scale-95 touch-manipulation"
              title="Perbesar Diagram (Zoom In)"
              aria-label="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={handleResetZoom}
              className="p-1.5 rounded-md bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 transition cursor-pointer shadow-2xs active:scale-95 touch-manipulation"
              title="Reset Zoom & Posisi (100%)"
              aria-label="Reset Zoom"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <div className="h-4 w-px bg-zinc-300 dark:bg-zinc-700 mx-0.5" />

            <button
              type="button"
              onClick={handleDownloadSvg}
              className="p-1.5 rounded-md bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 transition cursor-pointer shadow-2xs active:scale-95 touch-manipulation"
              title="Unduh Berkas Vektor SVG Bersih"
              aria-label="Unduh SVG"
            >
              {isDownloaded ? (
                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setIsFullscreen((prev) => !prev)}
              className="p-1.5 rounded-md bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 transition cursor-pointer shadow-2xs active:scale-95 touch-manipulation"
              title={isFullscreen ? 'Keluar dari Layar Penuh (Esc)' : 'Buka Kanvas Penuh (Fullscreen)'}
              aria-label="Toggle Fullscreen"
            >
              {isFullscreen ? (
                <Minimize2 className="w-3.5 h-3.5" />
              ) : (
                <Maximize2 className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>

        {/* Canvas Body (Pan & Zoom Viewport) */}
        <div
          ref={viewportRef}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{
            backgroundImage: isDark
              ? 'radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)'
              : 'radial-gradient(circle, rgba(0,0,0,0.06) 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
          className={`relative flex-1 min-h-[320px] xs:min-h-[360px] sm:min-h-[440px] md:min-h-[500px] overflow-hidden flex items-center justify-center touch-none overscroll-contain ${
            isDragging ? 'cursor-grabbing' : 'cursor-grab'
          }`}
        >
          {/* Loading State */}
          {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/70 dark:bg-[#0c0f17]/70 backdrop-blur-xs z-20">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600 dark:text-blue-400" />
              <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                Merender diagram vektor SVG...
              </span>
            </div>
          )}

          {/* Error State */}
          {renderError && !isLoading && (
            <div className="p-4 rounded-md bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2 max-w-md m-4">
              <AlertTriangle className="w-5 h-5 shrink-0 text-rose-600" />
              <div className="space-y-1">
                <p className="font-semibold">Gagal Menampilkan Diagram</p>
                <p className="text-[11px] opacity-90">{renderError}</p>
              </div>
            </div>
          )}

          {/* Diagram Canvas with Pan & Zoom Transform */}
          {!renderError && (
            <div
              className="will-change-transform transition-transform duration-75 ease-out select-none"
              style={{
                transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                transformOrigin: 'center center',
              }}
            >
              <div
                className="mermaid-viewport [&_svg]:max-w-none [&_svg]:h-auto [&_svg]:overflow-visible [&_text]:select-none"
                dangerouslySetInnerHTML={{ __html: svgContent }}
              />
            </div>
          )}

          {/* Bottom Hint Floating Badge - Desktop */}
          <div className="hidden sm:flex absolute bottom-2.5 left-1/2 -translate-x-1/2 pointer-events-none px-3 py-1 rounded-full bg-zinc-900/80 dark:bg-zinc-800/80 backdrop-blur-md text-[11px] text-zinc-200 dark:text-zinc-300 shadow-md items-center gap-1.5 whitespace-nowrap">
            <span>✋ Klik &amp; geser untuk panning</span>
            <span className="text-zinc-500">•</span>
            <span>Scroll mouse atau tombol +/- untuk zoom</span>
          </div>

          {/* Bottom Hint Floating Badge - Mobile */}
          <div className="sm:hidden flex absolute bottom-2 left-1/2 -translate-x-1/2 pointer-events-none px-2.5 py-1 rounded-full bg-zinc-900/85 dark:bg-zinc-800/85 backdrop-blur-md text-[10px] text-zinc-200 dark:text-zinc-300 shadow-md items-center gap-1 max-w-[92%] truncate">
            <span>✋ Sentuh &amp; geser</span>
            <span className="text-zinc-500">•</span>
            <span>Cubit / tombol +/- zoom</span>
          </div>
        </div>
      </div>

      {/* Backdrop for fullscreen mode */}
      {isFullscreen && (
        <div
          onClick={() => setIsFullscreen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 animate-in fade-in duration-150"
        />
      )}
    </>
  );
}
