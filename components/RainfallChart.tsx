'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface DailyPoint {
  day: string;
  mm: number;
  cumulative: number;
}

export function RainfallChart({
  daily,
  seasonStart,
  thresholdMm,
}: {
  daily: number[];
  seasonStart: string;
  thresholdMm: number;
}) {
  const start = new Date(seasonStart);
  const data: DailyPoint[] = [];
  let cumulative = 0;

  daily.forEach((mm, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    cumulative += mm;
    data.push({
      day: `${d.getMonth() + 1}/${d.getDate()}`,
      mm: Number(mm.toFixed(1)),
      cumulative: Number(cumulative.toFixed(1)),
    });
  });

  return (
    <div className="card p-5">
      <div className="mb-4 flex items-baseline justify-between">
        <div>
          <div className="section-label mb-1">Rainfall</div>
          <h3 className="font-head text-lg text-text">Daily precipitation</h3>
        </div>
        <div className="text-right">
          <div className="font-display text-3xl text-oracle-safe">
            {cumulative.toFixed(1)}mm
          </div>
          <div className="font-mono text-[11px] text-nimbus-300/70">
            threshold · {thresholdMm}mm
          </div>
        </div>
      </div>
      <div className="h-64 w-full">
        <ResponsiveContainer>
          <BarChart data={data} margin={{ top: 10, right: 8, bottom: 0, left: -16 }}>
            <CartesianGrid stroke="rgba(16,185,129,0.08)" strokeDasharray="3 3" />
            <XAxis
              dataKey="day"
              stroke="#6ee7b7"
              tick={{ fontFamily: 'Fira Code', fontSize: 10 }}
              tickLine={false}
            />
            <YAxis
              stroke="#6ee7b7"
              tick={{ fontFamily: 'Fira Code', fontSize: 10 }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              cursor={{ fill: 'rgba(16,185,129,0.05)' }}
              contentStyle={{
                background: '#0c1e14',
                border: '1px solid rgba(16,185,129,0.25)',
                borderRadius: 8,
                fontFamily: 'Fira Code',
                fontSize: 11,
              }}
              labelStyle={{ color: '#6ee7b7' }}
            />
            <ReferenceLine
              y={thresholdMm / Math.max(daily.length, 1)}
              stroke="#fbbf24"
              strokeDasharray="4 4"
            />
            <Bar dataKey="mm" fill="#22d3ee" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
