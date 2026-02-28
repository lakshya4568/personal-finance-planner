import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { GlassCard } from "./GlassCard";

interface DataPoint {
  month: string;
  value: number;
}

interface CumulativeGrowthChartProps {
  data?: DataPoint[];
  title?: string;
  delay?: number;
}

const MOCK_DATA: DataPoint[] = [
  { month: "Aug", value: 12000 },
  { month: "Sep", value: 18500 },
  { month: "Oct", value: 15200 },
  { month: "Nov", value: 22800 },
  { month: "Dec", value: 28400 },
  { month: "Jan", value: 35100 },
  { month: "Feb", value: 42600 },
  { month: "Mar", value: 48200 },
];

/* Custom speech-bubble tooltip */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip(props: any) {
  const { active, payload, label } = props;
  if (!active || !payload?.length) return null;
  const val = payload[0].value as number;

  return (
    <div className="relative">
      <div
        className="rounded-lg px-3 py-2"
        style={{
          background: "linear-gradient(135deg, #2e1065, #4c1d95)",
          boxShadow:
            "0 4px 20px rgba(139, 92, 246, 0.40), 0 0 0 1px rgba(255,255,255,0.10) inset",
        }}
      >
        <p className="text-[10px] font-medium text-purple-300">{label}</p>
        <p className="text-sm font-bold text-white">
          ₹{val.toLocaleString("en-IN")}
        </p>
      </div>
      {/* Speech bubble arrow */}
      <div
        className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 h-3 w-3 rotate-45"
        style={{ background: "#4c1d95" }}
      />
    </div>
  );
}

/* Custom dot with glow */
function CustomDot(props: Record<string, unknown>) {
  const { cx, cy } = props as { cx: number; cy: number };
  return (
    <g>
      <circle cx={cx} cy={cy} r={6} fill="rgba(139, 92, 246, 0.3)" />
      <circle
        cx={cx}
        cy={cy}
        r={3}
        fill="#a78bfa"
        stroke="#7c3aed"
        strokeWidth={1.5}
      />
    </g>
  );
}

export function CumulativeGrowthChart({
  data,
  title = "Cumulative Growth",
  delay = 0,
}: CumulativeGrowthChartProps) {
  const chartData = data ?? MOCK_DATA;

  return (
    <GlassCard tint="purple" delay={delay} hover={false}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-zinc-200">{title}</h3>
        <span className="rounded-full bg-purple-500/15 px-2.5 py-0.5 text-[10px] font-semibold text-purple-300">
          +32.4%
        </span>
      </div>

      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 8, right: 8, left: -12, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#a78bfa" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#7c3aed" stopOpacity={0.02} />
              </linearGradient>
              {/* Glow filter for the stroke */}
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.04)"
              vertical={false}
            />
            <XAxis
              dataKey="month"
              tick={{ fill: "#71717a", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "#71717a", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) =>
                v >= 1000 ? `${(v / 1000).toFixed(0)}K` : String(v)
              }
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{
                stroke: "rgba(139, 92, 246, 0.2)",
                strokeWidth: 1,
                strokeDasharray: "4 4",
              }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#a78bfa"
              strokeWidth={2.5}
              fill="url(#colorUv)"
              filter="url(#glow)"
              dot={<CustomDot />}
              activeDot={{
                r: 5,
                fill: "#c4b5fd",
                stroke: "#7c3aed",
                strokeWidth: 2,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
}
