// LoadingScreen.jsx
export default function LoadingScreen() {
  return (
    <div style={{
      height: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 24,
      background: 'radial-gradient(ellipse at center, #1a0040 0%, #0a0015 70%)',
    }}>
      <div style={{ fontSize: 72, animation: 'spin-slow 4s linear infinite', display: 'block' }}>
        🔮
      </div>
      <div style={{
        fontFamily: "'Cinzel', serif",
        fontSize: 28,
        fontWeight: 900,
        background: 'linear-gradient(135deg, #fbbf24, #c084fc)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
      }}>
        ARCANE REALM
      </div>
      <div style={{ color: '#7c6aad', fontSize: 14, letterSpacing: 2 }}>
        LOADING...
      </div>
      <div style={{
        width: 200,
        height: 3,
        background: 'rgba(124,58,237,0.2)',
        borderRadius: 2,
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          background: 'linear-gradient(90deg, #7c3aed, #c084fc)',
          borderRadius: 2,
          animation: 'shimmer 1.5s infinite linear',
          backgroundSize: '200% 100%',
          width: '100%',
        }} />
      </div>
    </div>
  );
}
