'use client';

import { useEffect, useRef, useState } from 'react';
import { connectGameSocket, sendDirectionInput } from '@/lib/wsClient';

type Dir = 'up' | 'down' | 'left' | 'right';
interface Coord { x: number; y: number; }
type Snake = Coord[];
export interface GameState {
  snake1: Snake; snake2: Snake; food: Coord;
  isGameOver: boolean; winner: number | null;
}

export function useSnakeGame(lobbyId: string) {
  const [gameState, setGameState] = useState<GameState>({
    snake1: [], snake2: [], food: { x: 0, y: 0 }, isGameOver: false, winner: null
  });
  const [myPlayerNumber, setMyPlayerNumber] = useState<1 | 2 | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const connectedRef = useRef(false);

  useEffect(() => {
    if (connectedRef.current) return;          // защита от двойного mount в dev
    connectedRef.current = true;

    const ws = connectGameSocket(lobbyId, (msg) => {
      switch (msg.type) {
        case 'lobbyState':
          if (msg.data?.you) setMyPlayerNumber(msg.data.you);
          break;
        case 'startMatch':
          setGameState({
            snake1: msg.data.snake1 ?? [],
            snake2: msg.data.snake2 ?? [],
            food: msg.data.food ?? { x: 0, y: 0 },
            isGameOver: false, winner: null
          });
          if (msg.data?.you) setMyPlayerNumber(msg.data.you);
          break;
        case 'state':
          setGameState(prev => ({
            snake1: msg.data.snake1 ?? prev.snake1,
            snake2: msg.data.snake2 ?? prev.snake2,
            food: msg.data.food ?? prev.food,
            isGameOver: false, winner: null
          }));
          break;
        case 'matchEnd':
          setGameState(prev => ({ ...prev, isGameOver: true, winner: msg.data?.winner ?? 0 }));
          break;
      }
    });

    wsRef.current = ws;
    return () => {
      try { wsRef.current?.close(); } catch {}
      wsRef.current = null;
      connectedRef.current = false;
    };
  }, [lobbyId]);

  const sendDirection = (dir: Dir) => {
    if (gameState.isGameOver) return;
    sendDirectionInput(dir);
  };

  return { gameState, sendDirection, myPlayerNumber };
}
