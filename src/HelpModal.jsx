export default function HelpModal({ onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>&times;</button>
        <h2>How to Play</h2>
        <p>Guess the daily MCOC champion! You have unlimited tries. Each guess shows the champion's portrait and compares attributes to the mystery champion.</p>

        <div className="help-colors">
          <div className="help-item">
            <span className="help-swatch correct" />
            <span>Exact match</span>
          </div>
          <div className="help-item">
            <span className="help-swatch partial" />
            <span>Partial match</span>
          </div>
          <div className="help-item">
            <span className="help-swatch wrong" />
            <span>No match</span>
          </div>
          <div className="help-item">
            <span className="help-arrow">&uarr;&darr;</span>
            <span>Higher / Lower</span>
          </div>
        </div>

        <h3>Attributes</h3>
        <ul>
          <li><strong>Class</strong> &mdash; Cosmic, Tech, Mutant, Science, Mystic, Skill</li>
          <li><strong>Gender</strong> &mdash; Male, Female, Other</li>
          <li><strong>Size</strong> &mdash; S, M, L, XL (arrows show direction)</li>
          <li><strong>Alignment</strong> &mdash; Hero, Villain, Mercenary, or Unknown</li>
          <li><strong>Affiliation</strong> &mdash; Team tags (orange = some overlap)</li>
          <li><strong>Fighting Style</strong> &mdash; Offensive, Defensive, or Control</li>
          <li><strong>Release Year</strong> &mdash; When added to MCOC (arrows show direction)</li>
        </ul>

        <h3>Features</h3>
        <ul>
          <li>After 10 guesses, a <strong>hint</strong> button appears &mdash; it reveals the value of your least-matched attribute and suggests 5 possible champions</li>
          <li>The player with the fewest guesses each day is crowned champion on the leaderboard</li>
        </ul>

        <p className="help-footer">A new champion every day. Solve it in the fewest guesses!</p>
      </div>
    </div>
  )
}
