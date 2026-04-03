/**
 * Format a date string or Date object
 * @param {string|Date} date
 * @param {string} fmt - 'YYYY-MM-DD' | 'MM月DD日' | 'YYYY年MM月DD日' | 'HH:mm'
 */
function formatDate(date, fmt = 'YYYY-MM-DD') {
  const d = typeof date === 'string' ? new Date(date) : date
  const pad = (n) => String(n).padStart(2, '0')

  return fmt
    .replace('YYYY', d.getFullYear())
    .replace('MM', pad(d.getMonth() + 1))
    .replace('DD', pad(d.getDate()))
    .replace('HH', pad(d.getHours()))
    .replace('mm', pad(d.getMinutes()))
}

/**
 * Returns array of all days in a given month
 * @param {number} year
 * @param {number} month - 1-indexed
 * @returns {{ date: string, dayOfWeek: number, isToday: boolean }[]}
 */
function getMonthDays(year, month) {
  const today = formatDate(new Date())
  const firstDay = new Date(year, month - 1, 1)
  const daysInMonth = new Date(year, month, 0).getDate()
  const result = []

  // Leading empty cells for alignment
  const startDow = firstDay.getDay() // 0=Sun
  for (let i = 0; i < startDow; i++) {
    result.push({ date: null, dayOfWeek: i, isToday: false })
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    result.push({
      date: dateStr,
      day: d,
      dayOfWeek: new Date(year, month - 1, d).getDay(),
      isToday: dateStr === today,
      isPast: dateStr < today,
    })
  }

  return result
}

/**
 * Add days to a date string
 */
function addDays(dateStr, days) {
  const d = new Date(dateStr)
  d.setDate(d.getDate() + days)
  return formatDate(d)
}

/**
 * Check if two date strings are the same day
 */
function isSameDay(a, b) {
  return formatDate(a) === formatDate(b)
}

/**
 * Human-readable relative time (e.g. "3天后", "2小时前")
 */
function relativeTime(dateStr) {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diff = then - now
  const absDiff = Math.abs(diff)
  const suffix = diff > 0 ? '后' : '前'

  if (absDiff < 60 * 1000) return '刚刚'
  if (absDiff < 3600 * 1000) return `${Math.floor(absDiff / 60000)}分钟${suffix}`
  if (absDiff < 86400 * 1000) return `${Math.floor(absDiff / 3600000)}小时${suffix}`
  if (absDiff < 30 * 86400 * 1000) return `${Math.floor(absDiff / 86400000)}天${suffix}`
  return formatDate(dateStr, 'MM月DD日')
}

/**
 * Get current date string YYYY-MM-DD
 */
function today() {
  return formatDate(new Date())
}

/**
 * Generate time slots array from 09:00 to 18:00 in 30-min increments
 */
function generateTimeSlots(startHour = 9, endHour = 18, intervalMinutes = 30) {
  const slots = []
  for (let h = startHour; h <= endHour; h++) {
    for (let m = 0; m < 60; m += intervalMinutes) {
      if (h === endHour && m > 0) break
      slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`)
    }
  }
  return slots
}

module.exports = {
  formatDate,
  getMonthDays,
  addDays,
  isSameDay,
  relativeTime,
  today,
  generateTimeSlots,
}
