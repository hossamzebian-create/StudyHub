import { useEffect, useState } from 'react';
import './RankUpModal.css';

export default function RankUpModal({ isOpen, newRank, onClose }) {
  if (!isOpen || !newRank) return null;

  return (
    <div className="rank-up-overlay">
      <div className="rank-up-modal slide-in-bottom">
        <h1 className="rank-up-title">🎉 RANK UP! 🎉</h1>
        <div className="medal-container bounce-in">
          <span className="medal-emoji">{newRank.icon}</span>
        </div>
        <h2 className="new-rank-name">You reached {newRank.rank}!</h2>
        <p className="rank-message">
          Amazing work! Your dedication to studying has paid off. Keep pushing forward!
        </p>
        <button className="btn btn-primary rank-up-btn" onClick={onClose}>
          Continue Grinding
        </button>
      </div>
    </div>
  );
}
