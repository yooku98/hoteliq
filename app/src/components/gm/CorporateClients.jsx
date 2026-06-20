import { useMemo, useState } from 'react'
import { ExpandablePanel } from '../ui/ExpandablePanel'
import { Badge } from '../ui/Panel'
import CorporateClientForm from './CorporateClientForm'

const STATUS_STYLES = {
  inquiry: 'bg-purple-light text-purple',
  confirmed: 'bg-teal-light text-teal',
  completed: 'bg-green-light text-green',
  cancelled: 'bg-coral-light text-coral',
}

function money(n) {
  return `GH₵ ${Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function RecordPayment({ client, onRecordPayment }) {
  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="text-[11px] text-teal font-medium">
        Add payment
      </button>
    )
  }

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault()
        if (!amount) return
        setSubmitting(true)
        await onRecordPayment(client.id, client.amount_paid, amount)
        setSubmitting(false)
        setAmount('')
        setOpen(false)
      }}
      className="flex items-center gap-1.5"
    >
      <input
        type="number"
        min="0"
        step="0.01"
        autoFocus
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="0.00"
        className="w-20 border border-border rounded-md px-1.5 py-0.5 text-[11px] focus:outline-none focus:border-teal"
      />
      <button type="submit" disabled={submitting} className="text-[11px] text-teal font-medium">
        Save
      </button>
      <button type="button" onClick={() => setOpen(false)} className="text-[11px] text-ink3">
        Cancel
      </button>
    </form>
  )
}

export default function CorporateClients({ clients, loading, staffId, createClient, recordPayment, updateStatus }) {
  const [showForm, setShowForm] = useState(false)

  const summary = useMemo(() => {
    const active = clients.filter((c) => c.status !== 'cancelled')
    const outstanding = active.reduce((sum, c) => sum + (Number(c.total_amount) - Number(c.amount_paid)), 0)
    const pipeline = clients.filter((c) => c.status === 'inquiry').length
    const confirmed = clients.filter((c) => c.status === 'confirmed').length
    return { outstanding, pipeline, confirmed }
  }, [clients])

  return (
    <>
    <ExpandablePanel
      title="Corporate & group clients"
      badge={<Badge tone="coral">{money(summary.outstanding)} pending</Badge>}
    >
      {(expanded) => {
        const visible = expanded ? clients : clients.slice(0, 5)
        return (
          <>
            <div className="flex items-center justify-between mb-3">
              <div className="text-[11px] text-ink3">
                {summary.pipeline} in pipeline · {summary.confirmed} confirmed
              </div>
              <button
                onClick={() => setShowForm(true)}
                className="text-[11px] text-teal font-medium"
              >
                + Log client
              </button>
            </div>

            {loading ? (
              <div className="text-ink3 text-sm py-4 text-center">Loading…</div>
            ) : visible.length === 0 ? (
              <div className="text-ink3 text-[12px] py-4 text-center">
                No corporate or group clients logged yet.
              </div>
            ) : (
              <div className="flex flex-col">
                {visible.map((c) => {
                  const balance = Number(c.total_amount) - Number(c.amount_paid)
                  return (
                    <div
                      key={c.id}
                      className="flex items-center justify-between gap-3 py-2.5 border-b border-border last:border-none"
                    >
                      <div className="min-w-0">
                        <div className="text-[12px] font-medium text-ink flex items-center gap-2">
                          {c.company_name}
                          <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-md ${STATUS_STYLES[c.status]}`}>
                            {c.status}
                          </span>
                        </div>
                        <div className="text-[11px] text-ink3">
                          {c.purpose ?? 'No purpose noted'}
                          {c.event_date && ` · ${c.event_date}`}
                          {expanded && c.contact_name && ` · ${c.contact_name}${c.contact_phone ? ` (${c.contact_phone})` : ''}`}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className={balance > 0 ? 'text-coral font-semibold text-[12px]' : 'text-green font-semibold text-[12px]'}>
                          {balance > 0 ? `${money(balance)} due` : 'Settled'}
                        </div>
                        <div className="text-ink3 text-[11px] mb-1">
                          {money(c.amount_paid)} of {money(c.total_amount)}
                        </div>
                        <div className="flex items-center justify-end gap-2">
                          {c.status === 'inquiry' && (
                            <button
                              onClick={() => updateStatus(c.id, 'confirmed')}
                              className="text-[11px] text-teal font-medium"
                            >
                              Confirm
                            </button>
                          )}
                          {balance > 0 && <RecordPayment client={c} onRecordPayment={recordPayment} />}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )
      }}
    </ExpandablePanel>
    {showForm && (
      <CorporateClientForm
        onClose={() => setShowForm(false)}
        onCreate={(payload) => createClient(payload, staffId)}
      />
    )}
    </>
  )
}
