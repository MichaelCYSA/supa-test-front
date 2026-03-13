const STYLES = {
  success: { bg: 'rgba(34,197,94,0.92)',    color: '#fff' },
  error:   { bg: 'rgba(239,68,68,0.92)',    color: '#fff' },
  info:    { bg: 'rgba(6,182,212,0.92)',    color: '#fff' },
  reward:  { bg: 'linear-gradient(135deg, rgba(251,191,36,0.95), rgba(217,119,6,0.95))', color: '#1a0a00' },
};

export default function Notification({ msg, type = 'success' }) {
  const s = STYLES[type] || STYLES.success;
  return (
    <div className="slide-down" style={{
      position: 'fixed', top: 72, left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 9999,
      padding: '11px 22px',
      borderRadius: 50,
      fontSize: 13, fontWeight: 700,
      background: s.bg, color: s.color,
      whiteSpace: 'nowrap',
      maxWidth: '88vw',
      textAlign: 'center',
      boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
      pointerEvents: 'none',
    }}>
      {msg}
    </div>
  );
}
