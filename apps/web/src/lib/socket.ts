'use client';

import { io, Socket } from 'socket.io-client';
import { SOCKET_EVENTS } from '@playground/shared';
import { getStoredToken } from '@/components/auth-provider';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL ?? 'http://localhost:3001';
    socket = io(wsUrl, {
      autoConnect: false,
      auth: (cb) => {
        cb({ token: getStoredToken() });
      },
    });
  }
  return socket;
}

export function connectSocket() {
  const s = getSocket();
  if (!s.connected) s.connect();
  return s;
}

export function disconnectSocket() {
  if (socket?.connected) socket.disconnect();
}

export { SOCKET_EVENTS };
