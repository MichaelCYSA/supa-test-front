// LoadingScreen.jsx
export default function LoadingScreen() {
  return (
    <div style={{
      height: '100dvh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 20,
      background: 'radial-gradient(ellipse at center, #0f0f35 0%, #080820 70%)',
    }}>
      {/* Animated cannon */}
      <div style={{ fontSize: 64, animation: 'pulse 1.2s ease-in-out infinite' }}>🎯</div>

      <div style={{
        fontWeight: 900, fontSize: 28, letterSpacing: 2,
        background: 'linear-gradient(135deg, #3b82f6, #60a5fa)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
      }}>
        BALL BLAST
      </div>

      <div style={{ color: '#333', fontSize: 12, letterSpacing: 3 }}>LOADING...</div>

      {/* Progress bar */}
      <div style={{
        width: 180, height: 3,
        background: 'rgba(59,130,246,0.15)',
        borderRadius: 2, overflow: 'hidden',
      }}>
        <div style={{
          height: '100%', borderRadius: 2,
          background: 'linear-gradient(90deg, #3b82f6, #60a5fa, #3b82f6)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.4s linear infinite',
        }} />
      </div>
    </div>
  );
}
