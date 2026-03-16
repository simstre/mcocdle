import { useState, useRef, useEffect, useCallback, useMemo } from 'react'

export default function SearchInput({ champions, guesses, onGuess, disabled }) {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [selectedIdx, setSelectedIdx] = useState(-1)
  const inputRef = useRef(null)
  const listRef = useRef(null)

  const guessedNames = useMemo(() => new Set(guesses.map(g => g.name)), [guesses])

  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([])
      setSelectedIdx(-1)
      return
    }
    const q = query.toLowerCase()
    const matches = champions
      .filter(c => !guessedNames.has(c.name) && c.name.toLowerCase().includes(q))
      .slice(0, 8)
    setSuggestions(matches)
    setSelectedIdx(-1)
  }, [query, champions, guessedNames])

  const selectChampion = useCallback((champ) => {
    onGuess(champ)
    setQuery('')
    setSuggestions([])
    inputRef.current?.focus()
  }, [onGuess])

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIdx(prev => Math.min(prev + 1, suggestions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIdx(prev => Math.max(prev - 1, 0))
    } else if (e.key === 'Enter' && selectedIdx >= 0) {
      e.preventDefault()
      selectChampion(suggestions[selectedIdx])
    }
  }

  useEffect(() => {
    if (selectedIdx >= 0 && listRef.current) {
      const items = listRef.current.children
      if (items[selectedIdx]) {
        items[selectedIdx].scrollIntoView({ block: 'nearest' })
      }
    }
  }, [selectedIdx])

  return (
    <div className="search-container">
      <div className="search-wrapper">
        <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          className="search-input"
          placeholder="Search for a champion..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          autoFocus
          disabled={disabled}
        />
      </div>
      {suggestions.length > 0 && (
        <div className="suggestions" ref={listRef}>
          {suggestions.map((champ, i) => (
            <div
              key={champ.name}
              className={`suggestion-item ${i === selectedIdx ? 'selected' : ''}`}
              onClick={() => selectChampion(champ)}
              onMouseEnter={() => setSelectedIdx(i)}
            >
              <div className="suggestion-portrait-wrap">
                {champ.portrait ? (
                  <img src={champ.portrait} alt="" className="suggestion-portrait" loading="lazy" />
                ) : (
                  <div className={`suggestion-portrait-placeholder ${champ.class.toLowerCase()}`} />
                )}
              </div>
              <span className="suggestion-name">{champ.name}</span>
              <span className={`suggestion-class ${champ.class.toLowerCase()}`}>{champ.class}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
