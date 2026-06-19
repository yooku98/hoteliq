import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { user, loading, signInWithPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  if (!loading && user) return <Navigate to="/" replace />

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    const { error: signInError } = await signInWithPassword(email, password)
    setSubmitting(false)
    if (signInError) setError(signInError.message)
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4">
      <div className="w-full max-w-[380px]">
        <div className="font-display text-3xl text-ink text-center mb-1">
          Hotel<span className="text-gold">IQ</span>
        </div>
        <p className="text-center text-ink3 text-[12px] tracking-wide uppercase mb-8">
          Occupancy, revenue &amp; operations
        </p>
        <form
          onSubmit={handleSubmit}
          className="bg-card border border-border rounded-xl p-6 flex flex-col gap-4"
        >
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-ink3 mb-1.5">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              placeholder="you@hotel.com"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-ink3 mb-1.5">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
              placeholder="••••••••"
            />
          </div>
          {error && <p className="text-coral text-[12px]">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="bg-ink text-white text-[12px] font-medium tracking-wide rounded-lg py-2.5 mt-1 disabled:opacity-50"
          >
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
        <p className="text-center text-ink3 text-[11px] mt-6">
          Powered by <span className="text-teal font-semibold">HotelIQ</span>
        </p>
      </div>
    </div>
  )
}
