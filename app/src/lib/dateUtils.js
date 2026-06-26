export function toISODate(date) {
  return date.toISOString().slice(0, 10)
}

export function addDays(date, n) {
  const d = new Date(date)
  d.setDate(d.getDate() + n)
  return d
}

export function todayISO() {
  return toISODate(new Date())
}

export function addMonths(date, n) {
  const d = new Date(date)
  d.setMonth(d.getMonth() + n)
  return d
}

export function startOfMonth(date) {
  const d = new Date(date)
  return new Date(d.getFullYear(), d.getMonth(), 1)
}

// Inclusive list of ISO date strings from start to end.
export function dateRange(start, end) {
  const dates = []
  let cursor = new Date(start)
  const last = new Date(end)
  while (cursor <= last) {
    dates.push(toISODate(cursor))
    cursor = addDays(cursor, 1)
  }
  return dates
}

// { start, end } ISO dates for a calendar month. `month` is 1-12.
export function monthRange(year, month) {
  const start = new Date(year, month - 1, 1)
  const end = new Date(year, month, 0)
  return { start: toISODate(start), end: toISODate(end) }
}
