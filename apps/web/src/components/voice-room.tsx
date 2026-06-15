'use client';

/**
 * Phase 2 — LiveKit voice rooms (backend: /livekit/token).
 * Enable with FEATURES.voiceRooms in lib/features.ts.
 */
import { useEffect, useState } from 'react';
import { LiveKitRoom, RoomAudioRenderer, ControlBar } from '@livekit/components-react';
import '@livekit/components-styles';
import { useAuth } from '@/components/auth-provider';
import { api } from '@/lib/api';
import { Mic, MicOff } from 'lucide-react';

interface VoiceRoomProps {
  roomName: string;
}

export function VoiceRoom({ roomName }: VoiceRoomProps) {
  const { token, user } = useAuth();
  const [voiceToken, setVoiceToken] = useState<{ token: string; url: string; configured: boolean } | null>(null);

  useEffect(() => {
    if (!token) return;
    api<{ token?: string; url?: string; configured: boolean; message?: string }>('/livekit/token', {
      method: 'POST',
      token,
      body: JSON.stringify({ roomName }),
    }).then((res) => {
      if (res.configured && res.token && res.url) {
        setVoiceToken({ token: res.token, url: res.url, configured: true });
      } else {
        setVoiceToken({ token: '', url: '', configured: false });
      }
    }).catch(() => setVoiceToken({ token: '', url: '', configured: false }));
  }, [roomName, token]);

  if (!voiceToken) {
    return <div className="p-4 text-sm text-muted-foreground">Connecting voice...</div>;
  }

  if (!voiceToken.configured) {
    return (
      <div className="p-4 border border-dashed border-border rounded-md text-sm text-muted-foreground flex items-center gap-2">
        <MicOff className="h-4 w-4" />
        Voice rooms require LiveKit configuration. Add LIVEKIT_API_KEY to .env
      </div>
    );
  }

  return (
    <div className="rounded-md overflow-hidden border border-border">
      <div className="p-2 bg-secondary/50 flex items-center gap-2 text-sm">
        <Mic className="h-4 w-4 text-primary" />
        Voice: {roomName}
      </div>
      <LiveKitRoom
        token={voiceToken.token}
        serverUrl={voiceToken.url}
        connect={true}
        audio={true}
        video={false}
        style={{ height: '120px' }}
      >
        <RoomAudioRenderer />
        <ControlBar controls={{ microphone: true, camera: false, screenShare: false, chat: false, leave: true }} />
      </LiveKitRoom>
    </div>
  );
}
