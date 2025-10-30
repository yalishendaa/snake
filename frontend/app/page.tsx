'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { NeynarAuthButton, useNeynarContext } from '@neynar/react';

export default function Page() {
  const { user } = useNeynarContext();
  const router = useRouter();
  const [joinCode, setJoinCode] = useState('');

  const createLobbyCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    return Array.from({ length: 5 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  };

  return (
    <main>
      {!user && (
        <div style={{ textAlign: 'center' }}>
          <h1>Base PVP Snake</h1>
          <p>Sign in with Farcaster to play</p>
          <NeynarAuthButton label="Sign in with Farcaster" />
        </div>
      )}

      {user && (
        <div style={{ textAlign: 'center' }}>
          <h2>welcome, {user.username}</h2>
          <div style={{ margin: '16px 0' }}>
            <button
              onClick={() => router.push(`/game/${createLobbyCode()}`)}
              style={{ padding: '10px 16px', marginRight: 12 }}
            >
              Create Lobby
            </button>
            <input
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              placeholder="Enter Lobby Code"
              maxLength={8}
              style={{ textTransform: 'uppercase' }}
            />
            <button
              onClick={() => joinCode.trim() && router.push(`/game/${joinCode.trim()}`)}
              style={{ padding: '10px 16px', marginLeft: 12 }}
            >
              Join
            </button>
          </div>
          <p style={{ opacity: 0.8 }}>share code with your friend and go 1v1</p>
        </div>
      )}
    </main>
  );
}
