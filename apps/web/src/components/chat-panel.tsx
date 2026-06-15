'use client';

/** Phase 2 — real-time chat (enable FEATURES.chat in lib/features.ts). */
import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/components/auth-provider';
import { connectSocket, SOCKET_EVENTS } from '@/lib/socket';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Message, Channel } from '@playground/shared';

export function ChatPanel({ channel, communityId }: { channel: Channel; communityId: string }) {
  const { token, user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [content, setContent] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!token) return;
    api<Message[]>(`/channels/${channel.id}/messages`, { token })
      .then(setMessages)
      .catch(console.error);
  }, [channel.id, token]);

  useEffect(() => {
    const socket = connectSocket();
    socket.emit(SOCKET_EVENTS.JOIN_CHANNEL, { channelId: channel.id });

    const onMessage = (msg: Message) => {
      if (msg.channelId === channel.id) {
        setMessages((prev) => [...prev, msg]);
      }
    };

    socket.on(SOCKET_EVENTS.MESSAGE_NEW, onMessage);
    return () => {
      socket.off(SOCKET_EVENTS.MESSAGE_NEW, onMessage);
    };
  }, [channel.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    const socket = connectSocket();
    socket.emit(SOCKET_EVENTS.MESSAGE_SEND, { channelId: channel.id, content: content.trim() });
    setContent('');
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[300px] max-h-[500px]">
        {messages.map((m) => (
          <div key={m.id} className="flex gap-2">
            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold shrink-0">
              {m.user?.displayName?.[0]?.toUpperCase() ?? '?'}
            </div>
            <div>
              <div className="text-sm font-medium">{m.user?.displayName ?? 'Unknown'}</div>
              <div className="text-sm text-foreground/90">{m.content}</div>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={send} className="p-4 border-t border-border flex gap-2">
        <Input
          placeholder={`Message #${channel.name}`}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="flex-1"
        />
        <Button type="submit">Send</Button>
      </form>
    </div>
  );
}
