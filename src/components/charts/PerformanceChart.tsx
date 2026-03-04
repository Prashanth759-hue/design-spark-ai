import { useState, useEffect, useRef } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";

interface DataPoint {
  time: number;
  value: number;
}

interface PerformanceChartProps {
  title: string;
  unit: string;
  value: number;
  maxValue: number;
  color: string;
  maxPoints?: number;
}

export function PerformanceChart({ title, unit, value, maxValue, color, maxPoints = 60 }: PerformanceChartProps) {
  const [data, setData] = useState<DataPoint[]>([]);
  const timeRef = useRef(0);

  useEffect(() => {
    const interval = setInterval(() => {
      timeRef.current += 1;
      setData(prev => {
        const next = [...prev, { time: timeRef.current, value: Math.round(value * 100) / 100 }];
        return next.length > maxPoints ? next.slice(-maxPoints) : next;
      });
    }, 500);
    return () => clearInterval(interval);
  }, [value, maxPoints]);

  return (
    <div className="bg-card/60 border border-border rounded-lg p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">{title}</span>
        <span className="text-xs font-mono font-bold text-foreground">{value.toFixed(1)} {unit}</span>
      </div>
      <div className="h-24">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 2, right: 2, bottom: 0, left: -20 }}>
            <defs>
              <linearGradient id={`grad-${title}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={color} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.3} />
            <XAxis dataKey="time" hide />
            <YAxis domain={[0, maxValue]} tick={{ fontSize: 8, fill: "hsl(var(--muted-foreground))" }} tickCount={4} />
            <Area type="monotone" dataKey="value" stroke={color} strokeWidth={1.5} fill={`url(#grad-${title})`} dot={false} isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
