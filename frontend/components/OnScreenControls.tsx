'use client';

export default function OnScreenControls({
  onPress
}: { onPress: (d: 'up' | 'down' | 'left' | 'right') => void }) {
  const btn: React.CSSProperties = { width: 60, height: 60, margin: 6, fontSize: 20 };
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 20,
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}
    >
      <button style={btn} onClick={() => onPress('up')}>↑</button>
      <div>
        <button style={btn} onClick={() => onPress('left')}>←</button>
        <button style={btn} onClick={() => onPress('right')}>→</button>
      </div>
      <button style={btn} onClick={() => onPress('down')}>↓</button>
    </div>
  );
}
