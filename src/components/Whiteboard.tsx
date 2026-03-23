import { useRef, useState, useEffect, useCallback } from 'react';
import { Pen, Eraser, Trash2, X } from 'lucide-react';

interface WhiteboardProps {
  onClose: () => void;
}

type Tool = 'pen' | 'eraser';

export default function Whiteboard({ onClose }: WhiteboardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tool, setTool] = useState<Tool>('pen');
  const [isDrawing, setIsDrawing] = useState(false);
  const [color] = useState('hsl(162, 63%, 41%)');
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  const getCtx = () => canvasRef.current?.getContext('2d') ?? null;

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;
    canvas.width = parent.clientWidth;
    canvas.height = parent.clientHeight;
    const ctx = getCtx();
    if (ctx) {
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }, []);

  useEffect(() => {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [resizeCanvas]);

  const getPos = (e: React.MouseEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const startDraw = (e: React.MouseEvent) => {
    setIsDrawing(true);
    lastPos.current = getPos(e);
  };

  const draw = (e: React.MouseEvent) => {
    if (!isDrawing || !lastPos.current) return;
    const ctx = getCtx();
    if (!ctx) return;
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : color;
    ctx.lineWidth = tool === 'eraser' ? 20 : 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    lastPos.current = pos;
  };

  const stopDraw = () => {
    setIsDrawing(false);
    lastPos.current = null;
  };

  const clearCanvas = () => {
    const ctx = getCtx();
    const canvas = canvasRef.current;
    if (ctx && canvas) {
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-foreground/40 flex items-center justify-center p-6 animate-fade-in">
      <div className="bg-card rounded-2xl shadow-2xl w-full max-w-5xl h-[80vh] flex flex-col overflow-hidden animate-reveal-up">
        <div className="flex items-center justify-between px-5 py-3 border-b border-border">
          <h2 className="font-semibold text-foreground">Whiteboard</h2>
          <div className="flex items-center gap-2">
            <button onClick={() => setTool('pen')} className={`control-btn w-9 h-9 ${tool === 'pen' ? 'control-btn-primary' : 'control-btn-default'}`}>
              <Pen className="w-4 h-4" />
            </button>
            <button onClick={() => setTool('eraser')} className={`control-btn w-9 h-9 ${tool === 'eraser' ? 'control-btn-primary' : 'control-btn-default'}`}>
              <Eraser className="w-4 h-4" />
            </button>
            <button onClick={clearCanvas} className="control-btn-default w-9 h-9">
              <Trash2 className="w-4 h-4" />
            </button>
            <div className="w-px h-6 bg-border mx-1" />
            <button onClick={onClose} className="control-btn-default w-9 h-9">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="flex-1 relative">
          <canvas
            ref={canvasRef}
            onMouseDown={startDraw}
            onMouseMove={draw}
            onMouseUp={stopDraw}
            onMouseLeave={stopDraw}
            className={`absolute inset-0 ${tool === 'eraser' ? 'cursor-cell' : 'cursor-crosshair'}`}
          />
        </div>
      </div>
    </div>
  );
}
