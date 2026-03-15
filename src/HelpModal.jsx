export default function HelpModal({ onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>&times;</button>
        <h2>How to Play</h2>
        <p>Guess the daily MCOC champion! Each guess reveals clues about the mystery champion.</p>

        <div className="help-colors">
          <div className="help-item">
            <span className="help-swatch correct" /> Exact match
          </div>
          <div className="help-item">
            <span className="help-swatch partial" /> Partial match (some overlap)
          </div>
          <div className="help-item">
            <span className="help-swatch wrong" /> No match
          </div>
          <div className="help-item">
            <span className="help-arrow">▲▼</span> Target value is higher/lower
          </div>
        </div>

        <h3>Columns</h3>
        <ul>
          <li><strong>Class</strong> &mdash; Cosmic, Tech, Mutant, Science, Mystic, Skill</li>
          <li><strong>Gender</strong> &mdash; Male, Female, Other</li>
          <li><strong>Size</strong> &mdash; S, M, L, XL (arrows show direction)</li>
          <li><strong>Alignment</strong> &mdash; Hero or Villain</li>
          <li><strong>Affiliation</strong> &mdash; Team tags (Avengers, X-Men, etc.)</li>
          <li><strong>Fighting Style</strong> &mdash; Offensive, Defensive, or Control</li>
          <li><strong>Release Year</strong> &mdash; When added to MCOC (arrows show direction)</li>
        </ul>

        <p className="help-footer">A new champion every day!</p>
      </div>
    </div>
  )
}
