import { useState, useMemo } from 'react'

// Epoch: today is day #1 (2026-03-15 PST)
const EPOCH_MS = Date.UTC(2026, 2, 15, 16, 0, 0)
const MAX_ROWS = 5

function getGameDayIndex() {
  const now = Date.now()
  const adjusted = now - 16 * 60 * 60 * 1000
  const epochAdjusted = EPOCH_MS - 16 * 60 * 60 * 1000
  return Math.floor((adjusted - epochAdjusted) / (24 * 60 * 60 * 1000)) + 1
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

function cellEmoji(status, arrow) {
  if (status === 'correct') return '\uD83D\uDFE9'
  if (status === 'partial') return '\uD83D\uDFE8'
  if (arrow === 'up') return '\u2B06\uFE0F'
  if (arrow === 'down') return '\u2B07\uFE0F'
  return '\uD83D\uDFE5'
}

function getRowEmojis(guess, target) {
  const sizeOrder = ['S', 'M', 'L', 'XL']
  const gi = sizeOrder.indexOf(guess.size)
  const ti = sizeOrder.indexOf(target.size)

  const cells = [
    // Class
    { status: guess.class === target.class ? 'correct' : 'wrong' },
    // Size (with arrows)
    {
      status: gi === ti ? 'correct' : 'wrong',
      arrow: gi === ti ? null : gi > ti ? 'down' : 'up',
    },
    // Alignment
    { status: guess.alignment === target.alignment ? 'correct' : 'wrong' },
    // Affiliation
    { status: compareArrays(guess.affiliations, target.affiliations) },
    // Fighting Style
    { status: guess.fighting_style === target.fighting_style ? 'correct' : 'wrong' },
    // Release Year (with arrows)
    {
      status: guess.release_year === target.release_year ? 'correct' : 'wrong',
      arrow: guess.release_year === target.release_year ? null
        : (!guess.release_year || !target.release_year) ? null
        : guess.release_year > target.release_year ? 'down' : 'up',
    },
  ]

  return cells.map(c => cellEmoji(c.status, c.arrow)).join('')
}

export default function ShareCard({ guesses, target, dailyInfo, hintUsed }) {
  const [copied, setCopied] = useState(false)
  const dayIndex = getGameDayIndex()

  const playerName = localStorage.getItem('mcocdle-name') || 'Anonymous'
  const solvers = dailyInfo?.solvers || []
  const rankIdx = solvers.findIndex(s => s.name === playerName)
  const rank = rankIdx >= 0 ? rankIdx + 1 : solvers.length

  const shareText = useMemo(() => {
    // Guesses are newest-first (matches screen order)
    const rows = guesses.map(g => getRowEmojis(g, target))
    const shown = rows.slice(0, MAX_ROWS)
    const extra = rows.length - MAX_ROWS

    const lines = [
      `MCOCdle #${dayIndex}`,
      `Solved in ${guesses.length} ${guesses.length === 1 ? 'guess' : 'guesses'}${rank ? ` | Rank #${rank}` : ''}${hintUsed ? ' | \uD83D\uDCA1 Hint used' : ''}`,
      '',
      ...shown,
    ]

    if (extra > 0) {
      lines.push(`+${extra} more`)
    }

    lines.push('', 'https://mcocdle.vercel.app')
    return lines.join('\n')
  }, [guesses, target, dayIndex, rank])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
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
