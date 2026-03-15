import { useState, useEffect, useRef, useCallback } from 'react'
import GuessRow from './GuessRow'
import SearchInput from './SearchInput'
import HelpModal from './HelpModal'

const COLUMNS = ['Champion', 'Class', 'Gender', 'Size', 'Alignment', 'Affiliation', 'Fighting Style', 'Release Year']

function getDailyChampion(champions) {
  // Deterministic daily champion based on date
  const today = new Date()
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate()
  // Simple hash
  let hash = seed
  hash = ((hash >> 16) ^ hash) * 0x45d9f3b
  hash = ((hash >> 16) ^ hash) * 0x45d9f3b
  hash = (hash >> 16) ^ hash
  const index = Math.abs(hash) % champions.length
  return champions[index]
}

function getStorageKey() {
  const today = new Date()
  return `mcocdle-${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`
}

export default function App() {
  const [champions, setChampions] = useState([])
  const [target, setTarget] = useState(null)
  const [guesses, setGuesses] = useState([])
  const [won, setWon] = useState(false)
  const [showHelp, setShowHelp] = useState(false)

  useEffect(() => {
    fetch('/data/champions.json')
      .then(r => r.json())
      .then(data => {
        setChampions(data)
        const daily = getDailyChampion(data)
        setTarget(daily)

        // Restore saved guesses
        const saved = localStorage.getItem(getStorageKey())
        if (saved) {
          const savedGuesses = JSON.parse(saved)
          const restored = savedGuesses
            .map(name => data.find(c => c.name === name))
            .filter(Boolean)
          setGuesses(restored)
          if (restored.some(c => c.name === daily.name)) {
            setWon(true)
          }
        }

        // Show help on first visit
        if (!localStorage.getItem('mcocdle-visited')) {
          setShowHelp(true)
          localStorage.setItem('mcocdle-visited', '1')
        }
      })
  }, [])

  const handleGuess = useCallback((champion) => {
    if (won || guesses.some(g => g.name === champion.name)) return

    const newGuesses = [champion, ...guesses]
    setGuesses(newGuesses)

    // Save to localStorage
    localStorage.setItem(getStorageKey(), JSON.stringify(newGuesses.map(g => g.name)))

    if (champion.name === target.name) {
      setWon(true)
    }
  }, [won, guesses, target])

  if (!target) {
    return <div className="loading">Loading champions...</div>
  }

  return (
    <div className="app">
      <header>
        <div className="logo">
          <h1>MCOCdle</h1>
          <span className="subtitle">Guess the MCOC Champion</span>
        </div>
        <button className="help-btn" onClick={() => setShowHelp(true)} title="How to play">?</button>
      </header>

      {won ? (
        <div className="win-banner">
          You got it in {guesses.length} {guesses.length === 1 ? 'guess' : 'guesses'}!
          <div className="win-champion">{target.name}</div>
        </div>
      ) : (
        <SearchInput
          champions={champions}
          guesses={guesses}
          onGuess={handleGuess}
        />
      )}

      <div className="grid-container">
        <div className="grid-header">
          {COLUMNS.map(col => (
            <div key={col} className="header-cell">{col}</div>
          ))}
        </div>
        <div className="guesses-list">
          {guesses.map((guess, i) => (
            <GuessRow key={guess.name} guess={guess} target={target} index={i} />
          ))}
        </div>
      </div>

      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
    </div>
  )
}
