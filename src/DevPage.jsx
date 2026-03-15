import GuessRow from './GuessRow'
import SearchInput from './SearchInput'

const COLUMNS = ['Champion', 'Class', 'Gender', 'Size', 'Alignment', 'Affiliation', 'Fighting Style', 'Release Year']

export default function DevPage({ target, champions, guesses, won, onGuess, onReset, onNewChampion, onBack }) {
  return (
    <div className="app">
      <div className="bg-overlay" />

      <header>
        <span className="dle-badge">MCOCdle DEV</span>
        <button className="help-btn" onClick={onBack} title="Back to game">&larr;</button>
      </header>

      <div className="dev-panel">
        <div className="dev-title">Developer Tools</div>
        <div className="dev-answer">
          <span className="dev-label">Today's answer:</span>
          <div className="dev-answer-row">
            {target.portrait && <img src={target.portrait} alt="" className="dev-portrait" />}
            <span className="dev-answer-name">{target.name}</span>
            <span className="dev-answer-class">{target.class}</span>
          </div>
        </div>
        <div className="dev-buttons">
          <button className="dev-btn dev-btn-reset" onClick={onReset}>
            Reset Progress
          </button>
          <button className="dev-btn dev-btn-new" onClick={onNewChampion}>
            New Random Champion
          </button>
        </div>
        <div className="dev-info">
          Guesses: {guesses.length} | Won: {won ? 'Yes' : 'No'}
        </div>
      </div>

      {!won && (
        <SearchInput
          champions={champions}
          guesses={guesses}
          onGuess={onGuess}
        />
      )}

      {won && (
        <div className="win-banner">
          <div className="win-portrait-wrap">
            {target.portrait && <img src={target.portrait} alt={target.name} className="win-portrait" />}
          </div>
          <div className="win-info">
            <div className="win-label">Correct!</div>
            <div className="win-champion">{target.name}</div>
            <div className="win-stats">{guesses.length} guesses</div>
          </div>
        </div>
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
            <GuessRow key={guess.name} guess={guess} target={target} isNew={i === 0} />
          ))}
        </div>
      </div>
    </div>
  )
}
