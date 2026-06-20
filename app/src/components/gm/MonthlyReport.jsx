import { useState } from 'react'
import { Panel, Badge } from '../ui/Panel'
import { fetchMonthlyReportData, buildMonthlySummary } from '../../lib/monthlyReport'

function defaultMonthValue() {
  const d = new Date()
  d.setMonth(d.getMonth() - 1)
  return d.toISOString().slice(0, 7)
}

export default function MonthlyReport({ hotelId }) {
  const [monthValue, setMonthValue] = useState(defaultMonthValue)
  const [generating, setGenerating] = useState(null)
  const [error, setError] = useState(null)

  async function buildSummary() {
    const [year, month] = monthValue.split('-').map(Number)
    const data = await fetchMonthlyReportData(hotelId, year, month)
    return buildMonthlySummary(data)
  }

  async function handleDownload(format) {
    setError(null)
    setGenerating(format)
    try {
      const summary = await buildSummary()
      if (format === 'pdf') {
        const { generateMonthlyReportPdf } = await import('../../lib/reportPdf')
        generateMonthlyReportPdf(summary)
      } else {
        const { generateMonthlyReportExcel } = await import('../../lib/reportExcel')
        generateMonthlyReportExcel(summary)
      }
    } catch (e) {
      setError(e.message ?? 'Could not generate the report.')
    } finally {
      setGenerating(null)
    }
  }

  return (
    <Panel title="Monthly board report" badge={<Badge tone="purple">PDF / Excel</Badge>}>
      <div className="flex items-center gap-3">
        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-wider text-ink3 mb-1.5">
            Month
          </label>
          <input
            type="month"
            value={monthValue}
            onChange={(e) => setMonthValue(e.target.value)}
            className="input"
          />
        </div>
        <button
          onClick={() => handleDownload('pdf')}
          disabled={generating !== null}
          className="bg-ink text-white text-[12px] font-medium rounded-lg px-4 py-2.5 disabled:opacity-50 mt-5"
        >
          {generating === 'pdf' ? 'Building PDF…' : 'Download PDF'}
        </button>
        <button
          onClick={() => handleDownload('excel')}
          disabled={generating !== null}
          className="bg-teal text-white text-[12px] font-medium rounded-lg px-4 py-2.5 disabled:opacity-50 mt-5"
        >
          {generating === 'excel' ? 'Building Excel…' : 'Download Excel'}
        </button>
      </div>
      <p className="text-[11px] text-ink3 mt-3">
        Occupancy, revenue, maintenance, handovers and corporate-client activity for the
        selected month — formatted for board presentations (PDF) or further analysis (Excel).
      </p>
      {error && <p className="text-coral text-[12px] mt-2">{error}</p>}
    </Panel>
  )
}
