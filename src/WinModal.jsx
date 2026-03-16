export default function WinModal({ target, guesses, dailyInfo, playerName, onClose }) {
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
            <strong>{playerName}</strong> solved in <strong>{guesses}</strong> {guesses === 1 ? 'guess' : 'guesses'}
          </div>
        </div>

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

        <button className="modal-action-btn" onClick={onClose}>Continue</button>
      </div>
    </div>
  )
}
