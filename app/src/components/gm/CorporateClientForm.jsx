import { useState } from 'react'

const initialForm = {
  company_name: '',
  contact_name: '',
  contact_phone: '',
  purpose: '',
  event_date: '',
  total_amount: '',
  deposit_amount: '',
  notes: '',
}

export default function CorporateClientForm({ onClose, onCreate }) {
  const [form, setForm] = useState(initialForm)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.company_name.trim()) {
      setError('Company name is required.')
      return
    }
    setSubmitting(true)
    const deposit = Number(form.deposit_amount) || 0
    const { error: insertError } = await onCreate({
      company_name: form.company_name.trim(),
      contact_name: form.contact_name.trim() || null,
      contact_phone: form.contact_phone.trim() || null,
      purpose: form.purpose.trim() || null,
      event_date: form.event_date || null,
      total_amount: Number(form.total_amount) || 0,
      deposit_amount: deposit,
      amount_paid: deposit,
      status: 'inquiry',
      notes: form.notes.trim() || null,
    })
    setSubmitting(false)
    if (insertError) {
      setError(insertError.message)
      return
    }
    onClose()
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-[210] px-4 animate-overlay-in"
      onClick={onClose}
    >
      <div
        className="glass-light rounded-2xl p-5 w-full max-w-[420px] max-h-[90vh] overflow-y-auto animate-modal-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-4">
          <div className="text-[15px] font-semibold text-ink">Log a corporate / group client</div>
          <button onClick={onClose} className="text-ink3 text-[11px] hover:text-ink transition-colors duration-150">
            Close
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <Field label="Company name">
            <input
              required
              value={form.company_name}
              onChange={(e) => update('company_name', e.target.value)}
              className="input"
              placeholder="Globex Ltd"
            />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Contact name">
              <input
                value={form.contact_name}
                onChange={(e) => update('contact_name', e.target.value)}
                className="input"
              />
            </Field>
            <Field label="Contact phone">
              <input
                value={form.contact_phone}
                onChange={(e) => update('contact_phone', e.target.value)}
                className="input"
                placeholder="+233…"
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Purpose">
              <input
                value={form.purpose}
                onChange={(e) => update('purpose', e.target.value)}
                className="input"
                placeholder="Team building retreat"
              />
            </Field>
            <Field label="Event date">
              <input
                type="date"
                value={form.event_date}
                onChange={(e) => update('event_date', e.target.value)}
                className="input"
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Total agreed (GH₵)">
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.total_amount}
                onChange={(e) => update('total_amount', e.target.value)}
                className="input"
                placeholder="0.00"
              />
            </Field>
            <Field label="Deposit received (GH₵)">
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.deposit_amount}
                onChange={(e) => update('deposit_amount', e.target.value)}
                className="input"
                placeholder="0.00"
              />
            </Field>
          </div>

          <Field label="Notes">
            <textarea
              value={form.notes}
              onChange={(e) => update('notes', e.target.value)}
              rows={2}
              className="input resize-none"
              placeholder="How the deal was sourced, special requirements…"
            />
          </Field>

          {error && <p className="text-coral text-[12px]">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="bg-teal text-white text-[12px] font-medium rounded-lg py-2.5 transition-all duration-150 hover:shadow-md hover:bg-teal/90 active:scale-[0.99] disabled:opacity-50"
          >
            {submitting ? 'Logging…' : 'Log client'}
          </button>
        </form>
      </div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-[10px] font-semibold uppercase tracking-wider text-ink3 mb-1.5">
        {label}
      </label>
      {children}
    </div>
  )
}
