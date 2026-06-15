'use client';

import { io, Socket } from 'socket.io-client';
import { SOCKET_EVENTS } from '@playground/shared';
import { getStoredToken } from '@/components/auth-provider';
import { getGuestIdentity } from '@/lib/guest';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL ?? 'http://localhost:3001';
    socket = io(wsUrl, {
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      auth: (cb) => {
        const token = getStoredToken();
        if (token) {
          cb({ token });
          return;
        }
        const guest = getGuestIdentity();
        if (guest) {
          cb({ guestId: guest.guestId, displayName: guest.displayName });
          return;
        }
        cb({});
      },
    });
  }
  return socket;
}

export function resetSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
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
