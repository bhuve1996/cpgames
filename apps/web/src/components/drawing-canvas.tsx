'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { DrawPoint, DrawStroke } from '@playground/shared';
import { cn } from '@/lib/utils';

const COLORS = ['#000000', '#ef4444', '#3b82f6', '#22c55e', '#f59e0b', '#a855f7', '#ec4899'];

export function DrawingCanvas({
  strokes,
  readOnly = false,
  color = '#000000',
  brushSize = 4,
  onStroke,
  className,
}: {
  strokes: DrawStroke[];
  readOnly?: boolean;
  color?: string;
  brushSize?: number;
  onStroke?: (stroke: DrawStroke) => void;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const currentPoints = useRef<DrawPoint[]>([]);
  const [localColor, setLocalColor] = useState(color);
  const [localSize, setLocalSize] = useState(brushSize);

  const drawStroke = useCallback((ctx: CanvasRenderingContext2D, stroke: DrawStroke) => {
    if (stroke.points.length < 2) return;
    ctx.strokeStyle = stroke.color;
    ctx.lineWidth = stroke.width;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
    for (let i = 1; i < stroke.points.length; i++) {
      ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
    }
    ctx.stroke();
  }, []);

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    strokes.forEach((s) => drawStroke(ctx, s));
  }, [strokes, drawStroke]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.scale(dpr, dpr);
      redraw();
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [redraw]);

  useEffect(() => {
    redraw();
  }, [redraw]);

  const getPoint = (e: React.PointerEvent<HTMLCanvasElement>): DrawPoint => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (readOnly) return;
    drawing.current = true;
    currentPoints.current = [getPoint(e)];
    canvasRef.current?.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current || readOnly) return;
    const pt = getPoint(e);
    currentPoints.current.push(pt);
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || currentPoints.current.length < 2) return;
    const pts = currentPoints.current;
    const prev = pts[pts.length - 2];
    ctx.strokeStyle = localColor;
    ctx.lineWidth = localSize;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(prev.x, prev.y);
    ctx.lineTo(pt.x, pt.y);
    ctx.stroke();
  };

  const onPointerUp = () => {
    if (!drawing.current || readOnly) return;
    drawing.current = false;
    if (currentPoints.current.length >= 2 && onStroke) {
      onStroke({
        id: `stroke-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        points: [...currentPoints.current],
        color: localColor,
        width: localSize,
      });
    }
    currentPoints.current = [];
  };

  return (
    <div className={cn('space-y-3', className)}>
      {!readOnly && (
        <div className="flex flex-wrap items-center gap-2">
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              className={cn(
                'h-8 w-8 rounded-full border-2 transition-transform hover:scale-110',
                localColor === c ? 'border-primary ring-2 ring-primary/30' : 'border-border',
              )}
              style={{ backgroundColor: c }}
              onClick={() => setLocalColor(c)}
              aria-label={`Color ${c}`}
            />
          ))}
          <input
            type="range"
            min={2}
            max={12}
            value={localSize}
            onChange={(e) => setLocalSize(Number(e.target.value))}
            className="w-24 ml-2"
            aria-label="Brush size"
          />
        </div>
      )}
      <canvas
        ref={canvasRef}
        className={cn(
          'w-full aspect-[4/3] rounded-xl border-2 border-border bg-white touch-none',
          readOnly ? 'cursor-default' : 'cursor-crosshair',
        )}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      />
    </div>
  );
}
