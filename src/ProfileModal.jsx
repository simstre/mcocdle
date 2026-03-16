import { useState } from 'react'

export default function ProfileModal({ playerName, onSetName, onClose }) {
  const [nameInput, setNameInput] = useState(playerName)
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    const trimmed = nameInput.trim()
    if (trimmed && trimmed !== playerName) {
      onSetName(trimmed)
      setSaved(true)
      setTimeout(() => setSaved(false), 1500)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal profile-modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>&times;</button>
        <h2>Profile</h2>

        <div className="profile-field">
          <label className="profile-label">Username</label>
          <div className="name-input-row">
            <input
              type="text"
              className="name-input"
              value={nameInput}
              onChange={e => setNameInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSave()}
              maxLength={20}
              autoFocus
            />
            <button className="name-save-btn" onClick={handleSave}>
              {saved ? 'Saved!' : 'Save'}
            </button>
          </div>
          <div className="profile-hint">This name appears on the leaderboard and in shared results.</div>
        </div>

        <button className="modal-action-btn" onClick={onClose}>Done</button>
      </div>
    </div>
  )
}
