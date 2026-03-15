import { useMemo } from 'react'

const CLASS_COLORS = {
  Cosmic: '#3b82f6',
  Tech: '#06b6d4',
  Mutant: '#eab308',
  Science: '#22c55e',
  Mystic: '#a855f7',
  Skill: '#ef4444',
}

function compareValue(guessVal, targetVal) {
  if (guessVal === targetVal) return 'correct'
  return 'wrong'
}

function compareArrays(guessArr, targetArr) {
  if (!guessArr?.length && !targetArr?.length) return 'correct'
  if (!guessArr?.length || !targetArr?.length) return 'wrong'

  const guessSet = new Set(guessArr.map(s => s.toLowerCase()))
  const targetSet = new Set(targetArr.map(s => s.toLowerCase()))

  // Check exact match
  if (guessSet.size === targetSet.size && [...guessSet].every(v => targetSet.has(v))) {
    return 'correct'
  }
  // Check partial overlap
  if ([...guessSet].some(v => targetSet.has(v))) {
    return 'partial'
  }
  return 'wrong'
}

function compareYear(guessYear, targetYear) {
  if (guessYear === targetYear) return { status: 'correct', arrow: null }
  if (!guessYear || !targetYear) return { status: 'wrong', arrow: null }
  return {
    status: 'wrong',
    arrow: guessYear > targetYear ? 'down' : 'up',
  }
}

function compareSize(guessSize, targetSize) {
  const order = ['S', 'M', 'L', 'XL']
  const gi = order.indexOf(guessSize)
  const ti = order.indexOf(targetSize)
  if (gi === ti) return { status: 'correct', arrow: null }
  return {
    status: 'wrong',
    arrow: gi > ti ? 'down' : 'up',
  }
}

export default function GuessRow({ guess, target, index }) {
  const cells = useMemo(() => {
    const nameStatus = compareValue(guess.name, target.name)
    const classStatus = compareValue(guess.class, target.class)
    const genderStatus = compareValue(guess.gender, target.gender)
    const sizeResult = compareSize(guess.size, target.size)
    const alignStatus = compareValue(guess.alignment, target.alignment)
    const affStatus = compareArrays(guess.affiliations, target.affiliations)
    const styleStatus = compareValue(guess.fighting_style, target.fighting_style)
    const yearResult = compareYear(guess.release_year, target.release_year)

    return [
      { value: guess.name, status: nameStatus },
      { value: guess.class, status: classStatus, classColor: CLASS_COLORS[guess.class] },
      { value: guess.gender, status: genderStatus },
      { value: guess.size, status: sizeResult.status, arrow: sizeResult.arrow },
      { value: guess.alignment, status: alignStatus },
      { value: guess.affiliations?.join(', ') || 'None', status: affStatus },
      { value: guess.fighting_style, status: styleStatus },
      { value: guess.release_year || '?', status: yearResult.status, arrow: yearResult.arrow },
    ]
  }, [guess, target])

  return (
    <div className="guess-row" style={{ animationDelay: `${index * 0.05}s` }}>
      {cells.map((cell, i) => (
        <div
          key={i}
          className={`cell cell-${cell.status}`}
          style={i === 1 && cell.classColor ? { '--class-accent': cell.classColor } : undefined}
        >
          <span className="cell-text">{cell.value}</span>
          {cell.arrow && (
            <span className="arrow">{cell.arrow === 'up' ? '▲' : '▼'}</span>
          )}
        </div>
      ))}
    </div>
  )
}
