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
