'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/auth-provider';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChatPanel } from '@/components/chat-panel';
import { EventsPanel } from '@/components/events-panel';
import { PollsPanel } from '@/components/polls-panel';
import { AiQuizPanel, LeaderboardPanel } from '@/components/quiz-leaderboard';
import { VoiceRoom } from '@/components/voice-room';
import type { Channel, Community, TriviaQuiz } from '@playground/shared';
import { ArrowLeft, Hash, Mic, Gamepad2, Copy } from 'lucide-react';
import { connectSocket } from '@/lib/socket';

type Tab = 'chat' | 'events' | 'polls' | 'quiz' | 'leaderboard';

export default function CommunityPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { user, token, loading } = useAuth();
  const router = useRouter();
  const [community, setCommunity] = useState<(Community & { channels: Channel[] }) | null>(null);
  const [activeChannel, setActiveChannel] = useState<Channel | null>(null);
  const [tab, setTab] = useState<Tab>('events');
  const [inviteUrl, setInviteUrl] = useState('');

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [loading, user, router]);

  useEffect(() => {
    if (token && slug) {
      api<Community & { channels: Channel[] }>(`/communities/${slug}`, { token })
        .then((data) => {
          setCommunity(data);
          const textChannel = data.channels.find((c) => c.type === 'text');
          setActiveChannel(textChannel ?? data.channels[0] ?? null);
        })
        .catch(() => router.push('/dashboard'));
    }
  }, [token, slug, router]);

  useEffect(() => {
    connectSocket();
  }, []);

  const createInvite = async () => {
    if (!token || !community) return;
    const invite = await api<{ token: string; url: string }>(`/communities/${community.id}/invites`, {
      method: 'POST',
      token,
    });
    const fullUrl = `${window.location.origin}/invite/${invite.token}`;
    setInviteUrl(fullUrl);
    navigator.clipboard.writeText(fullUrl);
  };

  const saveQuizToEvent = async (quiz: TriviaQuiz) => {
    alert('Quiz saved! Create an event and attach this quiz when hosting trivia.');
    localStorage.setItem(`quiz-${community?.id}`, JSON.stringify(quiz));
  };

  if (loading || !community) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const voiceChannel = community.channels.find((c) => c.type === 'voice');

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border/50 shrink-0">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Link href="/dashboard"><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
            <div>
              <h1 className="font-bold">{community.name}</h1>
              <p className="text-xs text-muted-foreground">{community.memberCount} members</p>
            </div>
          </div>
          <Button size="sm" variant="outline" onClick={createInvite}>
            <Copy className="h-4 w-4 mr-1" /> Invite
          </Button>
        </div>
        {inviteUrl && <p className="text-xs text-center text-primary pb-2">Invite link copied!</p>}
      </header>

      <div className="flex-1 container mx-auto px-4 py-4 flex flex-col lg:flex-row gap-4">
        <aside className="lg:w-48 shrink-0 space-y-1">
          {(['events', 'chat', 'polls', 'quiz', 'leaderboard'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`w-full text-left px-3 py-2 rounded-md text-sm capitalize ${tab === t ? 'bg-primary/20 text-primary' : 'hover:bg-secondary'}`}
            >
              {t}
            </button>
          ))}
          <div className="pt-4 border-t border-border mt-4">
            <p className="text-xs text-muted-foreground px-3 mb-2">Channels</p>
            {community.channels.map((ch) => (
              <button
                key={ch.id}
                onClick={() => { setActiveChannel(ch); setTab('chat'); }}
                className={`w-full text-left px-3 py-1.5 rounded-md text-sm flex items-center gap-1 ${activeChannel?.id === ch.id && tab === 'chat' ? 'bg-secondary' : 'hover:bg-secondary/50'}`}
              >
                {ch.type === 'voice' ? <Mic className="h-3 w-3" /> : ch.type === 'activity' ? <Gamepad2 className="h-3 w-3" /> : <Hash className="h-3 w-3" />}
                {ch.name}
              </button>
            ))}
          </div>
        </aside>

        <main className="flex-1 min-w-0">
          {tab === 'chat' && activeChannel && activeChannel.type === 'text' && (
            <Card className="h-full">
              <CardHeader className="py-3"><CardTitle className="text-base">#{activeChannel.name}</CardTitle></CardHeader>
              <CardContent className="p-0">
                <ChatPanel channel={activeChannel} communityId={community.id} />
              </CardContent>
            </Card>
          )}

          {tab === 'events' && (
            <div className="space-y-4">
              <EventsPanel communityId={community.id} slug={slug} />
              {voiceChannel && <VoiceRoom roomName={`${community.slug}-${voiceChannel.name}`} />}
            </div>
          )}

          {tab === 'polls' && <PollsPanel communityId={community.id} />}
          {tab === 'quiz' && <AiQuizPanel communityId={community.id} onQuizReady={saveQuizToEvent} />}
          {tab === 'leaderboard' && <LeaderboardPanel communityId={community.id} />}
        </main>
      </div>
    </div>
  );
}
