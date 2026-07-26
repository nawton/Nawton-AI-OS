import type { RevenuePoint } from "@/server/analytics/revenue";
import { formatSEK } from "@/lib/utils";

const WIDTH = 280;
const HEIGHT = 56;
const PAD_X = 4;
const PAD_Y = 8;

export function Sparkline({ data }: { data: RevenuePoint[] }) {
  const values = data.map((d) => d.value);
  const max = Math.max(...values, 1);
  const min = 0;
  const span = Math.max(max - min, 1);

  const points = data.map((d, i) => {
    const x = PAD_X + (i / (data.length - 1)) * (WIDTH - PAD_X * 2);
    const y = HEIGHT - PAD_Y - ((d.value - min) / span) * (HEIGHT - PAD_Y * 2);
    return { x, y, ...d };
  });

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const areaPath = `${linePath} L${points[points.length - 1].x.toFixed(1)},${HEIGHT - PAD_Y} L${points[0].x.toFixed(1)},${HEIGHT - PAD_Y} Z`;
  const last = points[points.length - 1];

  return (
    <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="h-14 w-full overflow-visible" role="img" aria-label="Omsättning senaste 7 dagarna">
      <defs>
        <linearGradient id="sparkline-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.28" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <line x1={PAD_X} y1={HEIGHT - PAD_Y} x2={WIDTH - PAD_X} y2={HEIGHT - PAD_Y} stroke="var(--border-hairline)" strokeWidth="1" />
      <path d={areaPath} fill="url(#sparkline-fill)" stroke="none" />
      <path d={linePath} fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={i === points.length - 1 ? 3 : 0} fill="var(--accent)">
          <title>{`${p.label}: ${formatSEK(p.value)}`}</title>
        </circle>
      ))}
      <circle cx={last.x} cy={last.y} r="6" fill="var(--accent)" opacity="0.16" />
    </svg>
  );
}
