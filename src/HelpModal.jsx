export default function HelpModal({ maxGuesses, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>&times;</button>
        <h2>How to Play</h2>
        <p>Guess the daily MCOC champion! You have <strong>{maxGuesses} tries</strong> each day. Each guess reveals how your pick compares to the mystery champion.</p>

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
          <li><strong>Size</strong> &mdash; S, M, L, XL (with direction arrows)</li>
          <li><strong>Alignment</strong> &mdash; Hero or Villain</li>
          <li><strong>Affiliation</strong> &mdash; Team tags (orange = partial overlap)</li>
          <li><strong>Fighting Style</strong> &mdash; Offensive, Defensive, or Control</li>
          <li><strong>Release Year</strong> &mdash; When added to MCOC (with direction arrows)</li>
        </ul>

        <p className="help-footer">A new champion every day. Be the first to solve it!</p>
      </div>
    </div>
  )
}
