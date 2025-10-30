import type { Lobby } from './lobbies';
import type { Coord } from './lobbies';

const GRID = 30;

type Dir = 'up' | 'down' | 'left' | 'right';

export function initGameState() {
  const snake1 = [{ x: 2, y: 3 }, { x: 1, y: 3 }, { x: 0, y: 3 }];
  const snake2 = [{ x: 27, y: 26 }, { x: 28, y: 26 }, { x: 29, y: 26 }];
  const dir1: Dir = 'right';
  const dir2: Dir = 'left';
  const food = spawnFood(snake1, snake2);
  return { snake1, snake2, food, dir1, dir2 };
}

export function tickOne(lobby: Lobby) {
  if (!lobby.player2) return { ended: true, winner: 0 };

  // directions
  const d1 = applyDir(lobby.player1.currentDirection, lobby.player1.nextDirection);
  const d2 = applyDir(lobby.player2.currentDirection, lobby.player2.nextDirection);
  lobby.player1.currentDirection = d1;
  lobby.player2.currentDirection = d2;

  // move
  const newHead1 = nextHead(lobby.snake1[0], d1);
  const newHead2 = nextHead(lobby.snake2[0], d2);

  const ate1 = newHead1.x === lobby.food.x && newHead1.y === lobby.food.y;
  const ate2 = newHead2.x === lobby.food.x && newHead2.y === lobby.food.y;

  lobby.snake1.unshift(newHead1);
  if (!ate1) lobby.snake1.pop();

  lobby.snake2.unshift(newHead2);
  if (!ate2) lobby.snake2.pop();

  if (ate1 || ate2) lobby.food = spawnFood(lobby.snake1, lobby.snake2);

  // collisions
  let crash1 = hitsBody(newHead1, lobby.snake1.slice(1)) || hitsBody(newHead1, lobby.snake2);
  let crash2 = hitsBody(newHead2, lobby.snake2.slice(1)) || hitsBody(newHead2, lobby.snake1);
  if (newHead1.x === newHead2.x && newHead1.y === newHead2.y) { crash1 = true; crash2 = true; }

  if (crash1 || crash2) {
    const winner = crash1 && crash2 ? 0 : crash1 ? 2 : 1;
    return { ended: true, winner };
  }

  return { ended: false, winner: 0 };
}

function nextHead(h: Coord, d: Dir): Coord {
  let x = h.x, y = h.y;
  if (d === 'up') y = (y - 1 + GRID) % GRID;
  if (d === 'down') y = (y + 1) % GRID;
  if (d === 'left') x = (x - 1 + GRID) % GRID;
  if (d === 'right') x = (x + 1) % GRID;
  return { x, y };
}

function isOpposite(a: Dir, b: Dir) {
  return (a === 'up' && b === 'down') || (a === 'down' && b === 'up') ||
         (a === 'left' && b === 'right') || (a === 'right' && b === 'left');
}

function applyDir(current: Dir, next: Dir): Dir {
  return isOpposite(current, next) ? current : next;
}

function spawnFood(s1: Coord[], s2: Coord[]): Coord {
  // naive but OK for 30x30
  while (true) {
    const fx = Math.floor(Math.random() * GRID);
    const fy = Math.floor(Math.random() * GRID);
    const on1 = s1.some((c) => c.x === fx && c.y === fy);
    const on2 = s2.some((c) => c.x === fx && c.y === fy);
    if (!on1 && !on2) return { x: fx, y: fy };
  }
}

function hitsBody(h: Coord, body: Coord[]) {
  return body.some((c) => c.x === h.x && c.y === h.y);
}
