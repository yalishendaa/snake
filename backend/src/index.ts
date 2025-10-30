import 'dotenv/config';
import http from 'http';
import express from 'express';
import cors from 'cors';
import { WebSocketServer, WebSocket } from 'ws';
import { joinLobby, handleInput, removeBySocket } from './lobbies';

const app = express();
app.use(cors());
app.get('/health', (_req, res) => res.json({ ok: true }));

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

wss.on('connection', (ws: WebSocket, req) => {
  const url = req.url || '';
  const q = url.includes('?') ? new URLSearchParams(url.slice(url.indexOf('?'))) : new URLSearchParams();
  const lobbyId = q.get('lobbyId') || undefined;

  ws.on('message', (raw) => {
    try {
      const msg = JSON.parse(raw.toString());
      if (msg.type === 'joinLobby') {
        const id = msg.data?.lobbyId || lobbyId;
        const username = msg.data?.username;
        if (!id) {
          ws.send(JSON.stringify({ type: 'error', data: { message: 'no lobbyId' } }));
          ws.close();
          return;
        }
        const r = joinLobby(id, ws, username);
        if (!r.ok) {
          ws.send(JSON.stringify({ type: 'error', data: { message: r.error || 'join failed' } }));
          ws.close();
        }
      } else if (msg.type === 'input') {
        const dir = msg.data?.direction;
        if (dir && ['up','down','left','right'].includes(dir)) handleInput(ws, dir);
      }
    } catch (e) {
      // ignore malformed
    }
  });

  ws.on('close', () => removeBySocket(ws));
});

const PORT = Number(process.env.WS_PORT || 3001);
server.listen(PORT, '0.0.0.0', () => console.log(`ws/http on 0.0.0.0:${PORT}`));
