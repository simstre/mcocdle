import { useMemo } from 'react'

const ATTR_PRIORITY = ['class', 'gender', 'release_year', 'size', 'affiliation', 'alignment', 'fighting_style']

const ATTR_LABELS = {
  class: 'Class',
  gender: 'Gender',
  release_year: 'Release Year',
  size: 'Size',
  alignment: 'Alignment',
  affiliation: 'Affiliation',
  fighting_style: 'Fighting Style',
}

function attrMatch(champ, target, attr) {
  if (attr === 'affiliation') {
    const a = champ.affiliations || []
    const b = target.affiliations || []
    if (!a.length && !b.length) return true
    if (!a.length || !b.length) return false
    const sa = new Set(a.map(s => s.toLowerCase()))
    const sb = new Set(b.map(s => s.toLowerCase()))
    if (sa.size !== sb.size) return false
    return [...sa].every(v => sb.has(v))
  }
  return champ[attr] === target[attr]
}

function getAttrValue(champion, attr) {
  if (attr === 'affiliation') return champion.affiliations?.join(', ') || 'None'
  if (attr === 'release_year') return champion.release_year || '?'
  return champion[attr] || '?'
}

export default function HintPanel({ target, champions, guesses, onClose }) {
  const hint = useMemo(() => {
    // For each attribute, compute hit ratio across guesses
    const ratios = {}
    const known = {}
    for (const attr of ATTR_PRIORITY) {
      const hits = guesses.filter(g => attrMatch(g, target, attr)).length
      ratios[attr] = guesses.length > 0 ? hits / guesses.length : 0
      known[attr] = hits > 0
    }

    // Find the attribute with lowest hit ratio (skip already-matched)
    // Priority order breaks ties
    let bestAttr = null
    let bestRatio = Infinity
    for (const attr of ATTR_PRIORITY) {
      if (known[attr]) continue
      if (ratios[attr] < bestRatio) {
        bestRatio = ratios[attr]
        bestAttr = attr
      }
    }
    if (!bestAttr) {
      bestAttr = ATTR_PRIORITY[0]
    }

    const revealedValue = getAttrValue(target, bestAttr)

    // Find champions matching ONLY the hint attribute (not all revealed ones)
    const guessedNames = new Set(guesses.map(g => g.name))
    const candidates = champions.filter(c =>
      !guessedNames.has(c.name) &&
      c.name !== target.name &&
      attrMatch(c, target, bestAttr)
    )

    // Pick 4 random candidates + target, shuffled
    const shuffled = candidates.sort(() => Math.random() - 0.5).slice(0, 4)
    const picks = [...shuffled, target].sort(() => Math.random() - 0.5)

    return {
      attr: bestAttr,
      label: ATTR_LABELS[bestAttr],
      value: revealedValue,
      picks,
    }
  }, [target, champions, guesses])

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal hint-modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>&times;</button>
        <h2>Hint</h2>

        <div className="hint-reveal">
          <div className="hint-reveal-label">The champion's <strong>{hint.label}</strong> is:</div>
          <div className="hint-reveal-value">{hint.value}</div>
        </div>

        <div className="hint-candidates">
          <div className="hint-candidates-label">Possible champions:</div>
          <div className="hint-candidates-list">
            {hint.picks.map(champ => (
              <div key={champ.name} className="hint-candidate">
                <div className="hint-candidate-portrait">
                  {champ.portrait && <img src={champ.portrait} alt={champ.name} />}
                </div>
                <div className="hint-candidate-info">
                  <span className="hint-candidate-name">{champ.name}</span>
                  <span className={`hint-candidate-class ${champ.class.toLowerCase()}`}>{champ.class}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button className="modal-action-btn" onClick={onClose}>Got it</button>
      </div>
    </div>
  )
}
