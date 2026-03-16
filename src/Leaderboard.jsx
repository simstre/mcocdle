export default function Leaderboard({ dailyInfo, onClose }) {
  const solvers = dailyInfo?.solvers || []
  const totalSolvers = dailyInfo?.totalSolvers || 0

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal leaderboard-modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>&times;</button>
        <h2>Leaderboard</h2>
        <p className="lb-date">Today's solvers{totalSolvers > 10 ? ` (showing 10 of ${totalSolvers})` : ''}</p>

        {solvers.length === 0 ? (
          <div className="lb-empty">No one has solved today's champion yet. Be the first!</div>
        ) : (
          <div className="lb-list">
            {solvers.map((solver, i) => (
              <div key={i} className={`lb-entry ${i === 0 ? 'lb-first' : ''}`}>
                <div className="lb-rank">
                  {i === 0 ? '\uD83C\uDFC6' : `#${i + 1}`}
                </div>
                <div className="lb-name">{solver.name}</div>
                <div className="lb-guesses">
                  {solver.guesses} {solver.guesses === 1 ? 'guess' : 'guesses'}
                </div>
              </div>
            ))}
          </div>
        )}

        <button className="modal-action-btn" onClick={onClose}>Close</button>
      </div>
    </div>
  )
}
