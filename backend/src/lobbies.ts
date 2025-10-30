import type { WebSocket } from 'ws';
import { initGameState, tickOne } from './logic';

export type Dir = 'up' | 'down' | 'left' | 'right';
export interface Coord { x: number; y: number; }
export type Snake = Coord[];

export interface PlayerInfo {
  socket: WebSocket;
  username?: string;
  currentDirection: Dir;
  nextDirection: Dir;
}

export interface Lobby {
  id: string;
  player1: PlayerInfo;
  player2?: PlayerInfo;
  snake1: Snake;
  snake2: Snake;
  food: Coord;
  isActive: boolean;
  loop?: NodeJS.Timeout;
}

const lobbies: Record<string, Lobby> = {};
const socketToLobbyId = new Map<WebSocket, string>();

export function getLobbyBySocket(ws: WebSocket) {
  const id = socketToLobbyId.get(ws);
  return id ? lobbies[id] : undefined;
}

export function getActiveLobbies() { return lobbies; }

export function createLobby(lobbyId: string, ws: WebSocket, username?: string) {
  lobbies[lobbyId] = {
    id: lobbyId,
    player1: { socket: ws, username, currentDirection: 'right', nextDirection: 'right' },
    player2: undefined,
    snake1: [],
    snake2: [],
    food: { x: 0, y: 0 },
    isActive: false
  };
  socketToLobbyId.set(ws, lobbyId);
}

export function joinLobby(lobbyId: string, ws: WebSocket, username?: string) {
  if (!lobbies[lobbyId]) {
    createLobby(lobbyId, ws, username);
    ws.send(JSON.stringify({ type: 'lobbyState', data: { players: 1, you: 1, lobbyId } }));
    return { ok: true };
  }
  const lobby = lobbies[lobbyId];
  if (lobby.player2 && lobby.isActive) return { ok: false, error: 'Lobby full' };

  if (!lobby.player2) {
    lobby.player2 = { socket: ws, username, currentDirection: 'left', nextDirection: 'left' };

    // оповестим обоих, что игроков теперь двое
    try {
      lobby.player1.socket.send(JSON.stringify({ type: 'lobbyState', data: { players: 2, you: 1, lobbyId } }));
      lobby.player2.socket.send(JSON.stringify({ type: 'lobbyState', data: { players: 2, you: 2, lobbyId } }));
    } catch {}

    startMatch(lobbyId);
    return { ok: true };
  }
  return { ok: false, error: 'Unable to join' };
}

function startMatch(lobbyId: string) {
  const lobby = lobbies[lobbyId];
  if (!lobby || !lobby.player2) return;

  const init = initGameState();
  lobby.snake1 = init.snake1;
  lobby.snake2 = init.snake2;
  lobby.food = init.food;
  lobby.player1.currentDirection = init.dir1;
  lobby.player1.nextDirection = init.dir1;
  lobby.player2.currentDirection = init.dir2;
  lobby.player2.nextDirection = init.dir2;
  lobby.isActive = true;

  const payloadP1 = JSON.stringify({
    type: 'startMatch',
    data: { snake1: lobby.snake1, snake2: lobby.snake2, food: lobby.food, you: 1 }
  });
  const payloadP2 = JSON.stringify({
    type: 'startMatch',
    data: { snake1: lobby.snake1, snake2: lobby.snake2, food: lobby.food, you: 2 }
  });
  try { lobby.player1.socket.send(payloadP1); } catch {}
  try { lobby.player2.socket.send(payloadP2); } catch {}

  // 10 тиков/сек
  lobby.loop = setInterval(() => {
    const res = tickOne(lobby);
    if (res.ended) {
      try { lobby.player1.socket.send(JSON.stringify({ type: 'matchEnd', data: { winner: res.winner } })); } catch {}
      try { lobby.player2!.socket.send(JSON.stringify({ type: 'matchEnd', data: { winner: res.winner } })); } catch {}
      stopAndCleanup(lobbyId);
    } else {
      const s = JSON.stringify({ type: 'state', data: { snake1: lobby.snake1, snake2: lobby.snake2, food: lobby.food } });
      try { lobby.player1.socket.send(s); } catch {}
      try { lobby.player2!.socket.send(s); } catch {}
    }
  }, 100);
}

export function handleInput(ws: WebSocket, dir: Dir) {
  const lobby = getLobbyBySocket(ws);
  if (!lobby || !lobby.isActive || !lobby.player2) return;
  if (ws === lobby.player1.socket) lobby.player1.nextDirection = dir;
  else if (lobby.player2 && ws === lobby.player2.socket) lobby.player2.nextDirection = dir;
}

export function removeBySocket(ws: WebSocket) {
  const lobbyId = socketToLobbyId.get(ws);
  if (!lobbyId) return;
  const lobby = lobbies[lobbyId];
  if (!lobby) return;

  if (!lobby.isActive) {
    socketToLobbyId.delete(lobby.player1.socket);
    if (lobby.player2) socketToLobbyId.delete(lobby.player2.socket);
    delete lobbies[lobbyId];
    return;
  }

  // forfeit win to remaining player
  let winner: 1 | 2 | 0 = 0;
  if (ws === lobby.player1.socket) winner = 2;
  if (lobby.player2 && ws === lobby.player2.socket) winner = 1;

  try {
    const remaining = winner === 1 ? lobby.player1.socket : lobby.player2?.socket;
    remaining?.send(JSON.stringify({ type: 'matchEnd', data: { winner } }));
  } catch {}

  stopAndCleanup(lobbyId);
}

function stopAndCleanup(lobbyId: string) {
  const lobby = lobbies[lobbyId];
  if (!lobby) return;
  if (lobby.loop) clearInterval(lobby.loop);
  if (lobby.player1) socketToLobbyId.delete(lobby.player1.socket);
  if (lobby.player2) socketToLobbyId.delete(lobby.player2.socket);
  delete lobbies[lobbyId];
}
