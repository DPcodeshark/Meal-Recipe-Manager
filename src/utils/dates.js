import { startOfWeek, addDays, format } from 'date-fns'

export function getWeekId(date = new Date()) {
  const monday = startOfWeek(date, { weekStartsOn: 1 })
  return format(monday, 'yyyy-MM-dd')
}

export function getWeekDays(weekId) {
  const monday = new Date(weekId + 'T00:00:00')
  return Array.from({ length: 7 }, (_, i) => {
    const day = addDays(monday, i)
    return {
      date: format(day, 'yyyy-MM-dd'),
      label: format(day, 'EEEE'),
      short: format(day, 'EEE'),
      dayOfMonth: format(day, 'd'),
    }
  })
}

export function formatWeekRange(weekId) {
  const monday = new Date(weekId + 'T00:00:00')
  const sunday = addDays(monday, 6)
  return `${format(monday, 'MMM d')} – ${format(sunday, 'MMM d, yyyy')}`
}
