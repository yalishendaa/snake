let gameSocket: WebSocket | null = null;

export function connectGameSocket(
  lobbyId: string,
  onMessage: (msg: any) => void
) {
  const baseUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001';
  const url = `${baseUrl}?lobbyId=${lobbyId}`;
  console.log('WS connecting to', url);

  gameSocket = new WebSocket(url);

  gameSocket.onopen = () => {
    gameSocket!.send(JSON.stringify({ type: 'joinLobby', data: { lobbyId } }));
  };  

  gameSocket.onmessage = (ev) => {
    try {
      onMessage(JSON.parse(ev.data));
    } catch {
      /* noop */
    }
  };

  gameSocket.onerror = (ev) => {
    console.error('WS error', {
      url: gameSocket?.url,
      readyState: gameSocket?.readyState,
      event: ev
    });
  };

  gameSocket.onclose = (ev) => {
    console.warn('WS closed', {
      code: ev.code,
      reason: ev.reason,
      wasClean: ev.wasClean
    });
  };

  return gameSocket;
}

export function sendDirectionInput(
  direction: 'up' | 'down' | 'left' | 'right'
) {
  if (!gameSocket || gameSocket.readyState !== WebSocket.OPEN) return;
  gameSocket.send(JSON.stringify({ type: 'input', data: { direction } }));
}
