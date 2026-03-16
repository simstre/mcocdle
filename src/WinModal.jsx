import { useState } from 'react'

export default function WinModal({ target, guesses, dailyInfo, playerName, onSetName, onClose }) {
  const [nameInput, setNameInput] = useState(playerName)
  const hasName = !!playerName

  const handleSubmit = () => {
    if (nameInput.trim()) {
      onSetName(nameInput.trim())
    }
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal win-modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>&times;</button>

        <div className="win-modal-header">
          <div className="win-modal-portrait-wrap">
            {target.portrait && (
              <img src={target.portrait} alt={target.name} className="win-modal-portrait" />
            )}
          </div>
          <h2 className="win-modal-title">Victory!</h2>
          <div className="win-modal-champ">{target.name}</div>
          <div className="win-modal-guesses">
            Solved in <strong>{guesses}</strong> {guesses === 1 ? 'guess' : 'guesses'}
          </div>
        </div>

        {!hasName && (
          <div className="name-prompt">
            <p>Enter your name for the leaderboard:</p>
            <div className="name-input-row">
              <input
                type="text"
                className="name-input"
                value={nameInput}
                onChange={e => setNameInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                placeholder="Your name..."
                maxLength={20}
                autoFocus
              />
            </div>
          </div>
        )}

        {dailyInfo?.firstSolver && (
          <div className="first-solver-section">
            <div className="first-solver-label">Today's Champion</div>
            <div className="first-solver-name">{dailyInfo.firstSolver.name}</div>
            <div className="first-solver-detail">
              First to solve in {dailyInfo.firstSolver.guesses} {dailyInfo.firstSolver.guesses === 1 ? 'guess' : 'guesses'}
            </div>
            {dailyInfo.totalSolvers > 1 && (
              <div className="total-solvers">{dailyInfo.totalSolvers} players solved today</div>
            )}
          </div>
        )}

        <button className="modal-action-btn" onClick={handleSubmit}>
          {hasName ? 'Continue' : 'Save & Continue'}
        </button>
      </div>
    </div>
  )
}
