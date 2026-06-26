import { useState } from 'react'
import { Panel } from '../ui/Panel'
import { createBooking } from '../../hooks/useBookings'

const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash' },
  { value: 'momo_mtn', label: 'MoMo · MTN' },
  { value: 'momo_vodafone', label: 'MoMo · Vodafone' },
  { value: 'momo_airteltigo', label: 'MoMo · AirtelTigo' },
  { value: 'card', label: 'Card' },
]

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

const initialForm = {
  guest_name: '',
  guest_phone: '',
  room_id: '',
  check_in_date: todayISO(),
  check_out_date: '',
  total_amount: '',
  payment_method: 'cash',
  corporate_client_id: '',
}

export default function QuickBookingForm({ hotelId, rooms, corporateClients = [], onCreated, onUpdateRoomStatus }) {
  const [form, setForm] = useState(initialForm)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const availableRooms = rooms.filter((r) => r.status !== 'occupied' && r.status !== 'blocked')

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)

    if (!form.room_id || !form.check_out_date || !form.guest_name.trim()) {
      setError('Guest name, room and checkout date are required.')
      return
    }

    setSubmitting(true)
    const { error: insertError } = await createBooking(hotelId, {
      guest_name: form.guest_name.trim(),
      guest_phone: form.guest_phone.trim() || null,
      room_id: form.room_id,
      check_in_date: form.check_in_date,
      check_out_date: form.check_out_date,
      status: 'checked_in',
      source: form.corporate_client_id ? 'corporate' : 'walk_in',
      total_amount: Number(form.total_amount) || 0,
      amount_paid: Number(form.total_amount) || 0,
      payment_method: form.payment_method,
      corporate_client_id: form.corporate_client_id || null,
    })
    setSubmitting(false)

    if (insertError) {
      setError(insertError.message)
      return
    }

    await onUpdateRoomStatus?.(form.room_id, 'occupied')
    setForm(initialForm)
    onCreated?.()
  }

  return (
    <Panel title="Quick walk-in booking">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Guest name">
            <input
              required
              value={form.guest_name}
              onChange={(e) => update('guest_name', e.target.value)}
              className="input"
              placeholder="Yaw Boateng"
            />
          </Field>
          <Field label="Phone">
            <input
              value={form.guest_phone}
              onChange={(e) => update('guest_phone', e.target.value)}
              className="input"
              placeholder="+233…"
            />
          </Field>
        </div>

        <Field label="Room">
          <select
            required
            value={form.room_id}
            onChange={(e) => update('room_id', e.target.value)}
            className="input"
          >
            <option value="">Select a room…</option>
            {availableRooms.map((r) => (
              <option key={r.id} value={r.id}>
                {r.room_number} — {r.room_type} ({r.status})
              </option>
            ))}
          </select>
        </Field>

        {corporateClients.length > 0 && (
          <Field label="Corporate / group client (optional)">
            <select
              value={form.corporate_client_id}
              onChange={(e) => update('corporate_client_id', e.target.value)}
              className="input"
            >
              <option value="">None — individual guest</option>
              {corporateClients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.company_name}
                  {c.purpose ? ` — ${c.purpose}` : ''}
                </option>
              ))}
            </select>
          </Field>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Check-in">
            <input
              type="date"
              required
              value={form.check_in_date}
              onChange={(e) => update('check_in_date', e.target.value)}
              className="input"
            />
          </Field>
          <Field label="Check-out">
            <input
              type="date"
              required
              min={form.check_in_date}
              value={form.check_out_date}
              onChange={(e) => update('check_out_date', e.target.value)}
              className="input"
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Total amount (GH₵)">
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
          <Field label="Payment method">
            <select
              value={form.payment_method}
              onChange={(e) => update('payment_method', e.target.value)}
              className="input"
            >
              {PAYMENT_METHODS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </Field>
        </div>

        {error && <p className="text-coral text-[12px]">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="bg-teal text-white text-[12px] font-medium rounded-lg py-2.5 transition-all duration-150 hover:shadow-md hover:bg-teal/90 active:scale-[0.99] disabled:opacity-50"
        >
          {submitting ? 'Booking…' : 'Check in guest'}
        </button>
      </form>
    </Panel>
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
