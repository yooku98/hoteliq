import { useState } from 'react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ExpandablePanel } from '../ui/ExpandablePanel'
import { useMonthlyOccupancy } from '../../hooks/useMonthlyOccupancy'

function formatDay(iso) {
  const d = new Date(iso)
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

function formatMonth(ym) {
  const [year, month] = ym.split('-').map(Number)
  const d = new Date(year, month - 1, 1)
  return d.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' })
}

function ViewToggle({ view, onChange }) {
  return (
    <div className="flex">
      {[
        ['daily', 'Daily'],
        ['monthly', 'Monthly'],
      ].map(([value, label], i) => (
        <button
          key={value}
          onClick={() => onChange(value)}
          className={[
            'px-2.5 py-1 text-[11px] font-medium border transition-colors duration-150',
            i === 0 ? 'rounded-l-md' : 'rounded-r-md border-l-0',
            view === value
              ? 'bg-ink text-white border-ink'
              : 'bg-transparent text-ink3 border-border hover:text-ink',
          ].join(' ')}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

export default function OccupancyChart({ series, loading, hotelId, totalRooms }) {
  const [view, setView] = useState('daily')
  const monthly = useMonthlyOccupancy(hotelId, totalRooms, 6, view === 'monthly')

  const isMonthly = view === 'monthly'
  const activeSeries = isMonthly ? monthly.series : series
  const activeLoading = isMonthly ? monthly.loading : loading
  const dataKey = isMonthly ? 'month' : 'date'
  const formatTick = isMonthly ? formatMonth : formatDay

  return (
    <ExpandablePanel
      title={isMonthly ? 'Occupancy rate — last 6 months' : 'Occupancy rate — last 30 days'}
      badge={<ViewToggle view={view} onChange={setView} />}
    >
      {(expanded) =>
        activeLoading ? (
          <div className="text-ink3 text-sm py-12 text-center">Loading…</div>
        ) : (
          <div className={expanded ? 'h-[440px]' : 'h-[220px]'}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activeSeries} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="#E8E4DC" />
                <XAxis
                  dataKey={dataKey}
                  tickFormatter={formatTick}
                  tick={{ fontSize: 10, fill: '#7A7A7A' }}
                  axisLine={false}
                  tickLine={false}
                  interval={isMonthly || expanded ? 0 : 2}
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
                  labelFormatter={formatTick}
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E8E4DC' }}
                />
                <Bar dataKey="occupancyPct" fill="#0E6B6B" radius={[3, 3, 0, 0]} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )
      }
    </ExpandablePanel>
  )
}
