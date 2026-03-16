import { useMemo } from 'react'

// Attribute keys in priority order for tie-breaking
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

function compareArrays(a, b) {
  if (!a?.length && !b?.length) return true
  if (!a?.length || !b?.length) return false
  const sa = new Set(a.map(s => s.toLowerCase()))
  const sb = new Set(b.map(s => s.toLowerCase()))
  if (sa.size !== sb.size) return false
  return [...sa].every(v => sb.has(v))
}

function attrMatch(guess, target, attr) {
  if (attr === 'affiliation') {
    return compareArrays(guess.affiliations, target.affiliations)
  }
  return guess[attr] === target[attr]
}

function getKnownAttrs(guesses, target) {
  // For each attribute, check if any guess got it correct
  const known = {}
  for (const attr of ATTR_PRIORITY) {
    known[attr] = guesses.some(g => attrMatch(g, target, attr))
  }
  return known
}

function getHitRatios(guesses, target) {
  // For each attribute, ratio of correct guesses
  const ratios = {}
  for (const attr of ATTR_PRIORITY) {
    const hits = guesses.filter(g => attrMatch(g, target, attr)).length
    ratios[attr] = guesses.length > 0 ? hits / guesses.length : 0
  }
  return ratios
}

function getAttrValue(champion, attr) {
  if (attr === 'affiliation') return champion.affiliations?.join(', ') || 'None'
  if (attr === 'release_year') return champion.release_year || '?'
  return champion[attr] || '?'
}

function champMatchesKnown(champ, target, knownAttrs, revealedAttr) {
  // Must match all already-correct attributes AND the newly revealed one
  for (const attr of ATTR_PRIORITY) {
    if (knownAttrs[attr] || attr === revealedAttr) {
      if (!attrMatch(champ, target, attr)) return false
    }
  }
  // For size/year, also respect directional info from guesses
  return true
}

export default function HintPanel({ target, champions, guesses, onClose }) {
  const hint = useMemo(() => {
    const known = getKnownAttrs(guesses, target)
    const ratios = getHitRatios(guesses, target)

    // Find the attribute with lowest hit ratio (that isn't already known)
    // Use priority order for tie-breaking
    let bestAttr = null
    let bestRatio = Infinity

    for (const attr of ATTR_PRIORITY) {
      if (known[attr]) continue // skip already matched
      const r = ratios[attr]
      if (r < bestRatio) {
        bestRatio = r
        bestAttr = attr
      }
      // Equal ratio: priority order wins (earlier in loop = higher priority)
    }

    // If all attrs are known, pick the first non-matched (shouldn't happen)
    if (!bestAttr) {
      bestAttr = ATTR_PRIORITY.find(a => !known[a]) || ATTR_PRIORITY[0]
    }

    // The revealed value
    const revealedValue = getAttrValue(target, bestAttr)

    // Find 5 champions who match all known + revealed attributes
    const guessedNames = new Set(guesses.map(g => g.name))
    const candidates = champions.filter(c =>
      !guessedNames.has(c.name) && champMatchesKnown(c, target, known, bestAttr)
    )

    // Ensure target is included
    let picks = []
    const targetInCandidates = candidates.some(c => c.name === target.name)

    if (targetInCandidates) {
      // Shuffle candidates, pick 4 others + target
      const others = candidates.filter(c => c.name !== target.name)
      const shuffled = others.sort(() => Math.random() - 0.5).slice(0, 4)
      picks = [...shuffled, target].sort(() => Math.random() - 0.5)
    } else {
      // Target was already guessed or filtered out, add manually
      const shuffled = candidates.sort(() => Math.random() - 0.5).slice(0, 4)
      picks = [...shuffled, target].sort(() => Math.random() - 0.5)
    }

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
