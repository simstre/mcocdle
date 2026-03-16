import { useState, useEffect, useCallback, useRef } from 'react'
import GuessRow from './GuessRow'
import SearchInput from './SearchInput'
import HelpModal from './HelpModal'
import WinModal from './WinModal'
import DevPage from './DevPage'
import HintPanel from './HintPanel'
import Leaderboard from './Leaderboard'
import ProfileModal from './ProfileModal'
import Countdown from './Countdown'
import ShareCard from './ShareCard'
import championsData from './champions.js'

const COLUMNS = ['Champion', 'Class', 'Gender', 'Size', 'Alignment', 'Affiliation', 'Fighting Style', 'Release Year']

// Game day resets at 8am PST (16:00 UTC)
function getGameDay() {
  const now = new Date()
  const adjusted = new Date(now.getTime() - 16 * 60 * 60 * 1000)
  return {
    year: adjusted.getUTCFullYear(),
    month: adjusted.getUTCMonth() + 1,
    day: adjusted.getUTCDate(),
  }
}

function getDailyChampion(champions, overrideSeed) {
  const { year, month, day } = getGameDay()
  const seed = overrideSeed ?? (year * 10000 + month * 100 + day + 7777)
  let hash = seed
  hash = ((hash >> 16) ^ hash) * 0x45d9f3b
  hash = ((hash >> 16) ^ hash) * 0x45d9f3b
  hash = (hash >> 16) ^ hash
  const index = Math.abs(hash) % champions.length
  return champions[index]
}

function getStorageKey() {
  const { year, month, day } = getGameDay()
  return `mcocdle-${year}-${month}-${day}`
}

function getTodayDateStr() {
  const { year, month, day } = getGameDay()
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

const ADJECTIVES = ['Mighty','Cosmic','Mystic','Savage','Iron','Shadow','Crimson','Golden','Silent','Blazing','Frozen','Dark','Swift','Noble','Raging']
const NOUNS = ['Summoner','Champion','Warrior','Sentinel','Guardian','Contender','Gladiator','Fighter','Slayer','Knight','Avenger','Brawler','Hunter','Titan','Seeker']

function generateUsername() {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)]
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)]
  const num = Math.floor(Math.random() * 100)
  return `${adj}${noun}${num}`
}

function getDisplayName() {
  let name = localStorage.getItem('mcocdle-name')
  if (!name) {
    name = generateUsername()
    localStorage.setItem('mcocdle-name', name)
  }
  return name
}

// Clear old progress on version bump
const GAME_VERSION = 2
if (Number(localStorage.getItem('mcocdle-version')) !== GAME_VERSION) {
  const savedName = localStorage.getItem('mcocdle-name')
  const keys = Object.keys(localStorage).filter(k => k.startsWith('mcocdle-'))
  keys.forEach(k => localStorage.removeItem(k))
  if (savedName) localStorage.setItem('mcocdle-name', savedName)
  localStorage.setItem('mcocdle-version', String(GAME_VERSION))
}

function loadDailyInfo() {
  const dateStr = getTodayDateStr()
  const localLb = JSON.parse(localStorage.getItem(`mcocdle-lb-${dateStr}`) || '[]')
  return {
    date: dateStr,
    firstSolver: localLb[0] || null,
    solvers: localLb,
    totalSolvers: localLb.length,
  }
}

const initialTarget = getDailyChampion(championsData)
const savedGuessNames = JSON.parse(localStorage.getItem(getStorageKey()) || '[]')
const initialGuesses = savedGuessNames.map(name => championsData.find(c => c.name === name)).filter(Boolean)
const initialWon = initialGuesses.some(c => c.name === initialTarget.name)

export default function App() {
  const [champions] = useState(championsData)
  const [target, setTarget] = useState(initialTarget)
  const [guesses, setGuesses] = useState(initialGuesses)
  const [won, setWon] = useState(initialWon)
  const [showHelp, setShowHelp] = useState(false)
  const [showWin, setShowWin] = useState(false)
  const [dailyInfo, setDailyInfo] = useState(loadDailyInfo)
  const [playerName, setPlayerName] = useState(getDisplayName)
  const [revealing, setRevealing] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [hintUsed, setHintUsed] = useState(() => localStorage.getItem(getStorageKey() + '-hint') === '1')
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const [page, setPage] = useState(window.location.pathname)

  const pendingWinRef = useRef(false)
  const guessCountRef = useRef(0)

  useEffect(() => {
    const onPop = () => setPage(window.location.pathname)
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  // Try to fetch server-side daily info (non-blocking)
  useEffect(() => {
    fetch('/api/daily')
      .then(r => r.json())
      .then(data => {
        if (data.solvers?.length) {
          setDailyInfo(data)
        }
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    guessCountRef.current = initialGuesses.length
    if (!localStorage.getItem('mcocdle-visited')) {
      setShowHelp(true)
      localStorage.setItem('mcocdle-visited', '1')
    }
  }, [])

  const submitSolve = useCallback((guessCount) => {
    const name = localStorage.getItem('mcocdle-name') || 'Anonymous'
    const dateStr = getTodayDateStr()
    const solverEntry = { name, guesses: guessCount, timestamp: new Date().toISOString() }

    const lbKey = `mcocdle-lb-${dateStr}`
    const localLb = JSON.parse(localStorage.getItem(lbKey) || '[]')
    if (localLb.length < 10) {
      localLb.push(solverEntry)
      localStorage.setItem(lbKey, JSON.stringify(localLb))
    }

    setDailyInfo(prev => {
      const solvers = [...(prev?.solvers || [])]
      if (solvers.length < 10) solvers.push(solverEntry)
      return {
        ...prev,
        firstSolver: prev?.firstSolver || solverEntry,
        solvers,
        totalSolvers: (prev?.totalSolvers || 0) + 1,
      }
    })

    fetch('/api/solve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, guesses: guessCount, date: dateStr }),
    })
      .then(r => r.json())
      .then(data => {
        if (!data._kvError && data.solvers?.length) {
          setDailyInfo(prev => ({
            ...prev,
            firstSolver: data.firstSolver,
            solvers: data.solvers,
            totalSolvers: data.totalSolvers,
          }))
        }
      })
      .catch(() => {})
  }, [])

  const handleGuess = useCallback((champion) => {
    if (won || revealing || guesses.some(g => g.name === champion.name)) return

    const newGuesses = [champion, ...guesses]
    setGuesses(newGuesses)
    guessCountRef.current = newGuesses.length
    setRevealing(true)
    localStorage.setItem(getStorageKey(), JSON.stringify(newGuesses.map(g => g.name)))

    pendingWinRef.current = champion.name === target.name
  }, [won, revealing, guesses, target])

  const handleRevealDone = useCallback(() => {
    setRevealing(false)
    if (pendingWinRef.current) {
      pendingWinRef.current = false
      setWon(true)
      setShowWin(true)
      submitSolve(guessCountRef.current)
    }
  }, [submitSolve])

  const handleSetName = useCallback((name) => {
    setPlayerName(name)
    localStorage.setItem('mcocdle-name', name)
  }, [])

  const handleDevReset = useCallback(() => {
    localStorage.removeItem(getStorageKey())
    setGuesses([])
    setWon(false)
    guessCountRef.current = 0
  }, [])

  const handleDevNewChampion = useCallback(() => {
    if (!champions.length) return
    const randomSeed = Math.floor(Math.random() * 999999)
    const newTarget = getDailyChampion(champions, randomSeed)
    setTarget(newTarget)
    setGuesses([])
    setWon(false)
    guessCountRef.current = 0
  }, [champions])

  const navigateTo = useCallback((path) => {
    window.history.pushState({}, '', path)
    setPage(path)
  }, [])

  if (page === '/dev') {
    return (
      <DevPage
        target={target}
        champions={champions}
        guesses={guesses}
        won={won}
        onGuess={handleGuess}
        onReset={handleDevReset}
        onNewChampion={handleDevNewChampion}
        onBack={() => navigateTo('/')}
      />
    )
  }

  const showHintPanel = (showHint || page === '/help') && guesses.length >= 10

  return (
    <div className="app">
      <div className="bg-overlay" />

      <header>
        <img src="/mcoc-logo.png" alt="Marvel Contest of Champions" className="header-logo" />
        <span className="dle-badge">MCOCdle</span>
        <div className="header-actions">
          <button className="header-icon-btn" onClick={() => setShowProfile(true)} title="Profile">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
              <circle cx="12" cy="8" r="4" /><path d="M4 21v-1a6 6 0 0 1 12 0v1" />
            </svg>
          </button>
          <button className="header-icon-btn" onClick={() => setShowLeaderboard(true)} title="Leaderboard">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
              <rect x="4" y="14" width="4" height="8" rx="1" /><rect x="10" y="6" width="4" height="16" rx="1" /><rect x="16" y="10" width="4" height="12" rx="1" />
            </svg>
          </button>
          <button className="header-icon-btn" onClick={() => setShowHelp(true)} title="How to play">?</button>
        </div>
      </header>

      {dailyInfo?.firstSolver && !won && (
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
            <div className="win-meta">
              <span>{guesses.length} {guesses.length === 1 ? 'guess' : 'guesses'}</span>
              {dailyInfo?.totalSolvers > 0 && (
                <span className="win-solvers">{dailyInfo.totalSolvers} {dailyInfo.totalSolvers === 1 ? 'solver' : 'solvers'} today</span>
              )}
            </div>
            <div className="win-countdown">
              Next champion in <Countdown />
            </div>
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
              <button className="hint-btn" onClick={() => { setShowHint(true); setHintUsed(true); localStorage.setItem(getStorageKey() + '-hint', '1') }} title="Get a hint">
                <span className="hint-btn-icon">?!</span>
                <span className="hint-btn-label">Hint</span>
              </button>
            )}
          </div>
        </>
      )}

      {guesses.length > 0 && <div className="grid-container">
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
      </div>}

      {won && (
        <ShareCard guesses={guesses} target={target} dailyInfo={dailyInfo} hintUsed={hintUsed} />
      )}

      {showProfile && <ProfileModal playerName={playerName} onSetName={handleSetName} onClose={() => setShowProfile(false)} />}
      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
      {showLeaderboard && <Leaderboard dailyInfo={dailyInfo} onClose={() => setShowLeaderboard(false)} />}
      {showHintPanel && (
        <HintPanel
          target={target}
          champions={champions}
          guesses={guesses}
          onClose={() => {
            setShowHint(false)
            if (page === '/help') navigateTo('/')
          }}
        />
      )}
      {showWin && (
        <WinModal
          target={target}
          guesses={guesses.length}
          dailyInfo={dailyInfo}
          playerName={playerName}
          onClose={() => setShowWin(false)}
        />
      )}
    </div>
  )
}
