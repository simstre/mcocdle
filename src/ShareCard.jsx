import { useState, useMemo } from 'react'

// Epoch: today is day #1 (2026-03-15 PST)
const EPOCH_MS = Date.UTC(2026, 2, 15, 16, 0, 0) // 2026-03-15 at 16:00 UTC = 8am PST

function getGameDayIndex() {
  const now = Date.now()
  const adjusted = now - 16 * 60 * 60 * 1000
  const epochAdjusted = EPOCH_MS - 16 * 60 * 60 * 1000
  return Math.floor((adjusted - epochAdjusted) / (24 * 60 * 60 * 1000)) + 1
}

function statusEmoji(status) {
  if (status === 'correct') return '\uD83D\uDFE9' // green
  if (status === 'partial') return '\uD83D\uDFE8' // yellow
  return '\uD83D\uDFE5' // red
}

function compareValue(a, b) {
  return a === b ? 'correct' : 'wrong'
}

function compareArrays(a, b) {
  if (!a?.length && !b?.length) return 'correct'
  if (!a?.length || !b?.length) return 'wrong'
  const sa = new Set(a.map(s => s.toLowerCase()))
  const sb = new Set(b.map(s => s.toLowerCase()))
  if (sa.size === sb.size && [...sa].every(v => sb.has(v))) return 'correct'
  if ([...sa].some(v => sb.has(v))) return 'partial'
  return 'wrong'
}

function getRowEmojis(guess, target) {
  const results = [
    compareValue(guess.class, target.class),
    compareValue(guess.gender, target.gender),
    (() => { const o = ['S','M','L','XL']; return o.indexOf(guess.size) === o.indexOf(target.size) ? 'correct' : 'wrong' })(),
    compareValue(guess.alignment, target.alignment),
    compareArrays(guess.affiliations, target.affiliations),
    compareValue(guess.fighting_style, target.fighting_style),
    (() => guess.release_year === target.release_year ? 'correct' : 'wrong')(),
  ]
  return results.map(statusEmoji).join('')
}

export default function ShareCard({ guesses, target, dailyInfo }) {
  const [copied, setCopied] = useState(false)
  const dayIndex = getGameDayIndex()

  // Determine player's rank (position among solvers)
  const playerName = localStorage.getItem('mcocdle-name') || 'Anonymous'
  const solvers = dailyInfo?.solvers || []
  const rankIdx = solvers.findIndex(s => s.name === playerName)
  const rank = rankIdx >= 0 ? rankIdx + 1 : solvers.length

  const shareText = useMemo(() => {
    // Guesses are stored newest-first, reverse for display
    const ordered = [...guesses].reverse()
    const emojiGrid = ordered.map(g => getRowEmojis(g, target)).join('\n')

    const lines = [
      `MCOCdle #${dayIndex}`,
      `Solved in ${guesses.length} ${guesses.length === 1 ? 'guess' : 'guesses'}${rank ? ` | Rank #${rank}` : ''}`,
      '',
      emojiGrid,
      '',
      'https://mcocdle.vercel.app',
    ]
    return lines.join('\n')
  }, [guesses, target, dayIndex, rank])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback
      const ta = document.createElement('textarea')
      ta.value = shareText
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="share-card">
      <div className="share-header">Share your result</div>
      <pre className="share-preview">{shareText}</pre>
      <button className="share-btn" onClick={handleCopy}>
        {copied ? 'Copied!' : 'Copy to clipboard'}
      </button>
    </div>
  )
}
