'use client';

import { useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSnakeGame } from '@/hooks/useSnakeGame';
import OnScreenControls from '@/components/OnScreenControls';
import { useNeynarContext } from '@neynar/react';

export default function GamePage() {
  const { lobbyId } = useParams<{ lobbyId: string }>();
  const router = useRouter();
  const { user } = useNeynarContext();
  const { gameState, sendDirection, myPlayerNumber } = useSnakeGame(lobbyId);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const waiting = !gameState.snake1.length && !gameState.snake2.length && !gameState.isGameOver;

  useEffect(() => {
    if (!user) router.replace('/');
  }, [user, router]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !gameState) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const gridSize = 30;
    const cellSize = Math.floor(canvas.width / gridSize);

    // bg
    ctx.fillStyle = '#001f3f';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // food
    if (gameState.food) {
      ctx.fillStyle = '#ff3b3b';
      ctx.fillRect(gameState.food.x * cellSize, gameState.food.y * cellSize, cellSize, cellSize);
    }

    // snakes
    if (gameState.snake1) {
      ctx.fillStyle = '#0ff';
      gameState.snake1.forEach((s) => ctx.fillRect(s.x * cellSize, s.y * cellSize, cellSize, cellSize));
    }
    if (gameState.snake2) {
      ctx.fillStyle = '#fff';
      gameState.snake2.forEach((s) => ctx.fillRect(s.x * cellSize, s.y * cellSize, cellSize, cellSize));
    }
  }, [gameState]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (gameState.isGameOver) return;
      if (e.key === 'ArrowUp') sendDirection('up');
      if (e.key === 'ArrowDown') sendDirection('down');
      if (e.key === 'ArrowLeft') sendDirection('left');
      if (e.key === 'ArrowRight') sendDirection('right');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [gameState.isGameOver, sendDirection]);

  let msg = '';
  if (gameState.isGameOver) {
    msg = gameState.winner === 0 ? 'Draw' : gameState.winner === myPlayerNumber ? 'You win' : 'You lose';
  }

  useEffect(() => {
    let startX = 0, startY = 0;
    const onTouchStart = (e: TouchEvent) => {
      const t = e.touches[0];
      startX = t.clientX; startY = t.clientY;
    };
    const onTouchEnd = (e: TouchEvent) => {
      const t = e.changedTouches[0];
      const dx = t.clientX - startX;
      const dy = t.clientY - startY;
      if (Math.abs(dx) > Math.abs(dy)) sendDirection(dx > 0 ? 'right' : 'left');
      else sendDirection(dy > 0 ? 'down' : 'up');
    };
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    return () => {
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [sendDirection]);

  return (
    <div style={{ textAlign: 'center', position: 'relative' }}>
      <h2>Lobby: {lobbyId}</h2>
      <canvas ref={canvasRef} width={600} height={600} style={{ border: '2px solid #fff' }} />
      <OnScreenControls onPress={(d) => sendDirection(d)} />
      {gameState.isGameOver && (
        <div style={{ position: 'absolute', top: '40%', left: 0, right: 0 }}>
          <h1>{msg}</h1>
          <button style={{ padding: '8px 12px' }} onClick={() => router.push('/')}>
            Back
          </button>
        </div>
      )}
    </div>
  );
}
