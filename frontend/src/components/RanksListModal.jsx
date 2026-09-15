import './RankUpModal.css'; // Reusing some base overlay styles

const allRanks = [
  { rank: 'Unranked', icon: '🥚', min: 0 },
  { rank: 'Bronze', icon: '🟤', min: 30 },
  { rank: 'Silver', icon: '⚪', min: 90 },
  { rank: 'Gold', icon: '🟡', min: 180 },
  { rank: 'Platinum', icon: '🔵', min: 270 },
  { rank: 'Diamond', icon: '💎', min: 360 },
];

export default function RanksListModal({ isOpen, onClose, currentPoints }) {
  if (!isOpen) return null;

  return (
    <div className="rank-up-overlay" onClick={onClose}>
      <div className="rank-up-modal slide-in-bottom" onClick={e => e.stopPropagation()} style={{ padding: '2rem' }}>
        <h2 style={{ color: '#fbbf24', marginTop: 0, marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '2px' }}>
          Daily Ranks Journey
        </h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'left' }}>
          {allRanks.map((r, index) => {
            const isUnlocked = currentPoints >= r.min;
            const isNext = !isUnlocked && (index === 0 || currentPoints >= allRanks[index - 1].min);
            
            let bg = 'rgba(255,255,255,0.05)';
            let border = '1px solid rgba(255,255,255,0.1)';
            let opacity = 0.5;
            
            if (isUnlocked) {
              bg = 'linear-gradient(to right, rgba(59, 130, 246, 0.2), rgba(139, 92, 246, 0.2))';
              border = '1px solid #3b82f6';
              opacity = 1;
            } else if (isNext) {
              border = '1px dashed #94a3b8';
              opacity = 0.8;
            }

            return (
              <div key={r.rank} style={{
                display: 'flex', alignItems: 'center', gap: '1rem', 
                background: bg, border, opacity,
                padding: '1rem', borderRadius: '12px',
                transition: 'all 0.3s'
              }}>
                <div style={{ fontSize: '2.5rem', width: '50px', textAlign: 'center' }}>
                  {r.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.2rem', color: isUnlocked ? '#fff' : '#cbd5e1' }}>
                    {r.rank}
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: '#94a3b8' }}>
                    {r.min}+ Daily Minutes
                  </p>
                </div>
                {isUnlocked && (
                  <div style={{ color: '#10b981', fontWeight: 'bold' }}>✓ Unlocked</div>
                )}
                {isNext && (
                  <div style={{ color: '#fbbf24', fontSize: '0.9rem' }}>{r.min - currentPoints} mins left</div>
                )}
              </div>
            );
          })}
        </div>

        <button className="btn btn-primary rank-up-btn" style={{ marginTop: '2rem' }} onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}
