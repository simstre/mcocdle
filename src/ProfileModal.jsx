import { useState } from 'react'

export default function ProfileModal({ playerName, onSetName, onClose }) {
  const [nameInput, setNameInput] = useState(playerName)
  const [saved, setSaved] = useState(false)

  const saveIfChanged = () => {
    const trimmed = nameInput.trim()
    if (trimmed && trimmed !== playerName) {
      onSetName(trimmed)
      return true
    }
    return false
  }

  const handleSave = () => {
    if (saveIfChanged()) {
      setSaved(true)
      setTimeout(() => setSaved(false), 1500)
    }
  }

  const handleClose = () => {
    saveIfChanged()
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal profile-modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={handleClose}>&times;</button>
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

        <button className="modal-action-btn" onClick={handleClose}>Done</button>
      </div>
    </div>
  )
}
