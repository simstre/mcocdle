import { useMemo, useState, useEffect } from 'react'

const CLASS_COLORS = {
  Cosmic: '#3b82f6',
  Tech: '#06b6d4',
  Mutant: '#eab308',
  Science: '#22c55e',
  Mystic: '#a855f7',
  Skill: '#ef4444',
}

const CLASS_ICON_PATHS = {
  Cosmic: '/icons/cosmic.png',
  Tech: '/icons/tech.png',
  Mutant: '/icons/mutant.png',
  Science: '/icons/science.png',
  Mystic: '/icons/mystic.png',
  Skill: '/icons/skill.png',
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
  if (guessSet.size === targetSet.size && [...guessSet].every(v => targetSet.has(v))) return 'correct'
  if ([...guessSet].some(v => targetSet.has(v))) return 'partial'
  return 'wrong'
}

function compareYear(guessYear, targetYear) {
  if (guessYear === targetYear) return { status: 'correct', arrow: null }
  if (!guessYear || !targetYear) return { status: 'wrong', arrow: null }
  return { status: 'wrong', arrow: guessYear > targetYear ? 'down' : 'up' }
}

function compareSize(guessSize, targetSize) {
  const order = ['S', 'M', 'L', 'XL']
  const gi = order.indexOf(guessSize)
  const ti = order.indexOf(targetSize)
  if (gi === ti) return { status: 'correct', arrow: null }
  return { status: 'wrong', arrow: gi > ti ? 'down' : 'up' }
}

export default function GuessRow({ guess, target, isNew, onRevealDone }) {
  const [phase, setPhase] = useState(isNew ? 'loading' : 'done')
  // 'loading' -> show shimmer bar (anticipation)
  // 'revealing' -> cells flip in one by one
  // 'done' -> static display

  const isCorrect = guess.name === target.name

  useEffect(() => {
    if (!isNew) return
    // Phase 1: shimmer bar for anticipation (400ms)
    const t1 = setTimeout(() => setPhase('revealing'), 400)
    // Phase 2: after all cells revealed, mark done
    const totalRevealTime = 400 + 8 * 80 + 350 // shimmer + stagger + last animation
    const t2 = setTimeout(() => {
      setPhase('done')
      onRevealDone?.()
    }, totalRevealTime)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [isNew, onRevealDone])

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
      {
        type: 'champion',
        value: guess.name,
        status: nameStatus,
        portrait: guess.portrait,
        champClass: guess.class,
      },
      {
        value: guess.class,
        status: classStatus,
        iconSrc: CLASS_ICON_PATHS[guess.class],
        accentColor: CLASS_COLORS[guess.class],
      },
      { value: guess.gender, status: genderStatus },
      { value: guess.size, status: sizeResult.status, arrow: sizeResult.arrow },
      { value: guess.alignment, status: alignStatus },
      { value: guess.affiliations?.join(', ') || 'None', status: affStatus },
      { value: guess.fighting_style, status: styleStatus },
      { value: guess.release_year || '?', status: yearResult.status, arrow: yearResult.arrow },
    ]
  }, [guess, target])

  // Phase: loading shimmer
  if (phase === 'loading') {
    return (
      <div className={`guess-row-shimmer ${isCorrect ? 'shimmer-correct' : 'shimmer-wrong'}`}>
        <div className="shimmer-bar" />
      </div>
    )
  }

  const animate = phase === 'revealing'

  return (
    <div className={`guess-row ${isCorrect && animate ? 'guess-row-correct' : ''}`}>
      {cells.map((cell, i) => {
        const cellDelay = animate ? `${i * 0.08}s` : '0s'
        const animClass = animate
          ? (isCorrect ? 'cell-anim-correct' : 'cell-anim-wrong')
          : ''

        if (cell.type === 'champion') {
          return (
            <div
              key={i}
              className={`cell cell-champion cell-neutral ${animClass}`}
              style={{ animationDelay: cellDelay }}
            >
              <div className="champ-portrait-wrap">
                {cell.portrait ? (
                  <img src={cell.portrait} alt={cell.value} className="champ-portrait" />
                ) : (
                  <div className={`champ-portrait-placeholder ${cell.champClass?.toLowerCase()}`} />
                )}
                <span className="champ-tooltip">{cell.value}</span>
              </div>
            </div>
          )
        }

        return (
          <div
            key={i}
            className={`cell cell-${cell.status} ${animClass}`}
            style={{
              animationDelay: cellDelay,
              ...(cell.accentColor ? { '--cell-accent': cell.accentColor } : {}),
            }}
          >
            {cell.iconSrc && <img src={cell.iconSrc} alt="" className="cell-class-icon" />}
            <span className="cell-text">{cell.value}</span>
            {cell.arrow && (
              <span className={`arrow arrow-${cell.arrow}`}>
                {cell.arrow === 'up' ? '\u25B2' : '\u25BC'}
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}
