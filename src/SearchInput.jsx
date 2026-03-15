import { useState, useRef, useEffect, useCallback } from 'react'

export default function SearchInput({ champions, guesses, onGuess }) {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [selectedIdx, setSelectedIdx] = useState(-1)
  const inputRef = useRef(null)
  const listRef = useRef(null)

  const guessedNames = new Set(guesses.map(g => g.name))

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

  // Scroll selected item into view
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
      <input
        ref={inputRef}
        type="text"
        className="search-input"
        placeholder="Type a champion name..."
        value={query}
        onChange={e => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        autoComplete="off"
        autoFocus
      />
      {suggestions.length > 0 && (
        <div className="suggestions" ref={listRef}>
          {suggestions.map((champ, i) => (
            <div
              key={champ.name}
              className={`suggestion-item ${i === selectedIdx ? 'selected' : ''}`}
              onClick={() => selectChampion(champ)}
              onMouseEnter={() => setSelectedIdx(i)}
            >
              <span className={`class-dot ${champ.class.toLowerCase()}`} />
              {champ.name}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
