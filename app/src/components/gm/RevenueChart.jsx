import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Panel, Badge } from '../ui/Panel'

const METHOD_COLORS = {
  cash: '#B8860B',
  momo_mtn: '#0E6B6B',
  momo_vodafone: '#2A7A4B',
  momo_airteltigo: '#534AB7',
  card: '#C94F3A',
}

const METHOD_LABEL = {
  cash: 'Cash',
  momo_mtn: 'MoMo MTN',
  momo_vodafone: 'MoMo Vodafone',
  momo_airteltigo: 'MoMo AirtelTigo',
  card: 'Card',
}

function formatDay(iso) {
  const d = new Date(iso)
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

function money(n) {
  return `GH₵ ${Number(n).toLocaleString()}`
}

export default function RevenueChart({ series, loading }) {
  const data = series.map((d) => ({ date: d.date, ...d.revenueByMethod }))

  return (
    <Panel title="Revenue trend — last 30 days" badge={<Badge tone="gold">By payment method</Badge>}>
      {loading ? (
        <div className="text-ink3 text-sm py-12 text-center">Loading…</div>
      ) : (
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
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
                tickFormatter={(v) => `₵${Math.round(v / 1000)}k`}
              />
              <Tooltip
                formatter={(value, name) => [money(value), METHOD_LABEL[name]]}
                labelFormatter={formatDay}
                contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E8E4DC' }}
              />
              <Legend
                formatter={(value) => METHOD_LABEL[value]}
                wrapperStyle={{ fontSize: 11 }}
              />
              {Object.keys(METHOD_COLORS).map((method) => (
                <Bar key={method} dataKey={method} stackId="rev" fill={METHOD_COLORS[method]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </Panel>
  )
}
