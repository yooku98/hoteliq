import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Panel, Badge } from '../ui/Panel'

function formatDay(iso) {
  const d = new Date(iso)
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

export default function OccupancyChart({ series, loading }) {
  return (
    <Panel title="Occupancy rate — last 30 days" badge={<Badge tone="teal">Daily</Badge>}>
      {loading ? (
        <div className="text-ink3 text-sm py-12 text-center">Loading…</div>
      ) : (
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={series} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="#E8E4DC" />
              <XAxis
                dataKey="date"
                tickFormatter={formatDay}
                tick={{ fontSize: 10, fill: '#7A7A7A' }}
                axisLine={false}
                tickLine={false}
                interval={2}
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#7A7A7A' }}
                axisLine={false}
                tickLine={false}
                domain={[0, 100]}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip
                formatter={(value) => [`${value}%`, 'Occupancy']}
                labelFormatter={formatDay}
                contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E8E4DC' }}
              />
              <Bar dataKey="occupancyPct" fill="#0E6B6B" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </Panel>
  )
}
