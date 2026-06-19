import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { Panel, Badge } from '../ui/Panel'

const SOURCE_COLORS = {
  direct: '#0E6B6B',
  booking_com: '#B8860B',
  phone: '#534AB7',
  expedia: '#C94F3A',
  walk_in: '#2A7A4B',
}

const SOURCE_LABEL = {
  direct: 'Direct / website',
  booking_com: 'Booking.com',
  phone: 'Phone',
  expedia: 'Expedia / OTA',
  walk_in: 'Walk-in',
}

export default function BookingSourceChart({ breakdown, loading }) {
  const data = breakdown.filter((b) => b.revenue > 0)

  return (
    <Panel title="Booking sources" badge={<Badge tone="green">Last 30 days</Badge>}>
      {loading ? (
        <div className="text-ink3 text-sm py-12 text-center">Loading…</div>
      ) : data.length === 0 ? (
        <div className="text-ink3 text-sm py-12 text-center">No bookings in range</div>
      ) : (
        <>
          <div className="h-[160px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="revenue"
                  nameKey="source"
                  innerRadius="62%"
                  outerRadius="90%"
                  paddingAngle={2}
                >
                  {data.map((d) => (
                    <Cell key={d.source} fill={SOURCE_COLORS[d.source]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, _name, item) => [`${item.payload.pct}%`, SOURCE_LABEL[item.payload.source]]}
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E8E4DC' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-1.5 mt-2">
            {data.map((d) => (
              <div key={d.source} className="flex items-center gap-1.5 text-[11px] text-ink2">
                <span
                  className="w-2 h-2 rounded-sm inline-block"
                  style={{ background: SOURCE_COLORS[d.source] }}
                />
                {SOURCE_LABEL[d.source]} {d.pct}%
              </div>
            ))}
          </div>
        </>
      )}
    </Panel>
  )
}
