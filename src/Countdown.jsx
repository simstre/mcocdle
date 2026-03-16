import { useState, useEffect } from 'react'

function getNextReset() {
  // Next reset is at 16:00 UTC (8am PST)
  const now = new Date()
  const todayReset = new Date(Date.UTC(
    now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 16, 0, 0
  ))
  if (now >= todayReset) {
    // Next reset is tomorrow
    todayReset.setUTCDate(todayReset.getUTCDate() + 1)
  }
  return todayReset
}

function formatDiff(ms) {
  if (ms <= 0) return '00:00:00'
  const hours = Math.floor(ms / (1000 * 60 * 60))
  const mins = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))
  const secs = Math.floor((ms % (1000 * 60)) / 1000)
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

export default function Countdown() {
  const [timeLeft, setTimeLeft] = useState('')

  useEffect(() => {
    const update = () => {
      const diff = getNextReset().getTime() - Date.now()
      setTimeLeft(formatDiff(diff))
    }
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [])

  return <span className="countdown">{timeLeft}</span>
}
