import { useState, useEffect, useCallback } from 'react'
import GuessRow from './GuessRow'
import SearchInput from './SearchInput'
import HelpModal from './HelpModal'
import WinModal from './WinModal'
import DevPage from './DevPage'
import HintPanel from './HintPanel'
import Leaderboard from './Leaderboard'

const COLUMNS = ['Champion', 'Class', 'Gender', 'Size', 'Alignment', 'Affiliation', 'Fighting Style', 'Release Year']

function getDailyChampion(champions, overrideSeed) {
  const today = new Date()
  const seed = overrideSeed ?? (today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate())
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

function getTodayDateStr() {
  const now = new Date()
  const yyyy = now.getUTCFullYear()
  const mm = String(now.getUTCMonth() + 1).padStart(2, '0')
  const dd = String(now.getUTCDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

function getDisplayName() {
  return localStorage.getItem('mcocdle-name') || ''
}

export default function App() {
  const [champions, setChampions] = useState([])
  const [target, setTarget] = useState(null)
  const [guesses, setGuesses] = useState([])
  const [won, setWon] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const [showWin, setShowWin] = useState(false)
  const [dailyInfo, setDailyInfo] = useState(null)
  const [playerName, setPlayerName] = useState(getDisplayName)
  const [revealing, setRevealing] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const [devMode, setDevMode] = useState(window.location.pathname === '/dev')
  const [helpMode, setHelpMode] = useState(window.location.pathname === '/help')

  useEffect(() => {
    const onPop = () => {
      setDevMode(window.location.pathname === '/dev')
      setHelpMode(window.location.pathname === '/help')
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  useEffect(() => {
    fetch('/api/daily')
      .then(r => r.json())
      .then(setDailyInfo)
      .catch(() => {})
  }, [])

  useEffect(() => {
    fetch('/data/champions.json')
      .then(r => r.json())
      .then(data => {
        setChampions(data)
        const daily = getDailyChampion(data)
        setTarget(daily)

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

        if (!localStorage.getItem('mcocdle-visited')) {
          setShowHelp(true)
          localStorage.setItem('mcocdle-visited', '1')
        }
      })
  }, [])

  const submitSolve = useCallback((guessCount) => {
    const name = localStorage.getItem('mcocdle-name') || 'Anonymous'
    fetch('/api/solve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        guesses: guessCount,
        date: getTodayDateStr(),
      }),
    })
      .then(r => r.json())
      .then(data => {
        setDailyInfo(prev => ({
          ...prev,
          firstSolver: data.firstSolver,
          solvers: data.solvers || prev?.solvers || [],
          totalSolvers: data.totalSolvers,
        }))
      })
      .catch(() => {})
  }, [])

  const handleGuess = useCallback((champion) => {
    if (won || revealing || guesses.some(g => g.name === champion.name)) return

    const newGuesses = [champion, ...guesses]
    setGuesses(newGuesses)
    setRevealing(true)
    localStorage.setItem(getStorageKey(), JSON.stringify(newGuesses.map(g => g.name)))

    if (champion.name === target.name) {
      // Win is shown after reveal animation finishes (via onRevealDone)
    }
  }, [won, revealing, guesses, target])

  const handleRevealDone = useCallback(() => {
    setRevealing(false)
    // Check if the latest guess was correct
    if (guesses.length > 0 && guesses[0].name === target?.name) {
      setWon(true)
      setShowWin(true)
      submitSolve(guesses.length)
    }
  }, [guesses, target, submitSolve])

  const handleSetName = useCallback((name) => {
    setPlayerName(name)
    localStorage.setItem('mcocdle-name', name)
  }, [])

  // Dev mode handlers
  const handleDevReset = useCallback(() => {
    localStorage.removeItem(getStorageKey())
    setGuesses([])
    setWon(false)
  }, [])

  const handleDevNewChampion = useCallback(() => {
    if (!champions.length) return
    const randomSeed = Math.floor(Math.random() * 999999)
    const newTarget = getDailyChampion(champions, randomSeed)
    setTarget(newTarget)
    setGuesses([])
    setWon(false)
  }, [champions])

  if (!target) {
    return (
      <div className="loading-screen">
        <img src="/mcoc-logo.png" alt="MCOC" className="loading-logo" />
        <div className="loading-text">Loading champions...</div>
      </div>
    )
  }

  // Auto-show hint when navigating to /help
  if (helpMode && guesses.length < 10) {
    // Not enough guesses — redirect back
    window.history.replaceState({}, '', '/')
    setHelpMode(false)
  }

  if (devMode) {
    return (
      <DevPage
        target={target}
        champions={champions}
        guesses={guesses}
        won={won}
        onGuess={handleGuess}
        onReset={handleDevReset}
        onNewChampion={handleDevNewChampion}
        onBack={() => {
          window.history.pushState({}, '', '/')
          setDevMode(false)
        }}
      />
    )
  }

  return (
    <div className="app">
      <div className="bg-overlay" />

      <header>
        <img src="/mcoc-logo.png" alt="Marvel Contest of Champions" className="header-logo" />
        <span className="dle-badge">MCOCdle</span>
        <div className="header-actions">
          <button className="header-icon-btn" onClick={() => setShowLeaderboard(true)} title="Leaderboard">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
              <rect x="4" y="14" width="4" height="8" rx="1" /><rect x="10" y="6" width="4" height="16" rx="1" /><rect x="16" y="10" width="4" height="12" rx="1" />
            </svg>
          </button>
          <button className="header-icon-btn" onClick={() => setShowHelp(true)} title="How to play">?</button>
        </div>
      </header>

      {dailyInfo?.firstSolver && (
        <div className="daily-champion-bar">
          <span className="trophy-icon">&#127942;</span>
          <span>
            <strong>{dailyInfo.firstSolver.name}</strong> was first to solve today in {dailyInfo.firstSolver.guesses} {dailyInfo.firstSolver.guesses === 1 ? 'guess' : 'guesses'}!
          </span>
          {dailyInfo.totalSolvers > 1 && (
            <span className="solver-count">{dailyInfo.totalSolvers} total solvers</span>
          )}
        </div>
      )}

      {won ? (
        <div className="win-banner">
          <div className="win-portrait-wrap">
            {target.portrait && <img src={target.portrait} alt={target.name} className="win-portrait" />}
          </div>
          <div className="win-info">
            <div className="win-label">You found it!</div>
            <div className="win-champion">{target.name}</div>
            <div className="win-stats">{guesses.length} {guesses.length === 1 ? 'guess' : 'guesses'}</div>
          </div>
        </div>
      ) : (
        <>
          <div className="guess-prompt">
            <span className="prompt-text">Guess today's champion</span>
            <span className="guess-counter">
              <span className="guess-count">{guesses.length}</span>
              <span className="guess-total"> guesses</span>
            </span>
          </div>
          <div className="search-row">
            <SearchInput
              champions={champions}
              guesses={guesses}
              onGuess={handleGuess}
              disabled={revealing}
            />
            {guesses.length >= 10 && (
              <button className="hint-btn" onClick={() => setShowHint(true)} title="Get a hint">
                <span className="hint-btn-icon">?!</span>
                <span className="hint-btn-label">Hint</span>
              </button>
            )}
          </div>
        </>
      )}

      <div className="grid-container">
        <div className="grid-header">
          {COLUMNS.map((col, i) => (
            <div key={col} className={`header-cell ${i === 0 ? 'header-champ' : ''}`}>
              {col}
            </div>
          ))}
        </div>
        <div className="guesses-list">
          {guesses.map((guess, i) => (
            <GuessRow
              key={guess.name}
              guess={guess}
              target={target}
              isNew={i === 0 && revealing}
              onRevealDone={i === 0 ? handleRevealDone : undefined}
            />
          ))}
        </div>
      </div>

      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
      {showLeaderboard && <Leaderboard dailyInfo={dailyInfo} onClose={() => setShowLeaderboard(false)} />}
      {(showHint || helpMode) && guesses.length >= 10 && (
        <HintPanel
          target={target}
          champions={champions}
          guesses={guesses}
          onClose={() => {
            setShowHint(false)
            if (helpMode) {
              window.history.pushState({}, '', '/')
              setHelpMode(false)
            }
          }}
        />
      )}
      {showWin && (
        <WinModal
          target={target}
          guesses={guesses.length}
          dailyInfo={dailyInfo}
          playerName={playerName}
          onSetName={handleSetName}
          onClose={() => setShowWin(false)}
        />
      )}
    </div>
  )
}
