'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/auth-provider';
import { api } from '@/lib/api';
import { FEATURES } from '@/lib/features';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChatPanel } from '@/components/chat-panel';
import { EventsPanel } from '@/components/events-panel';
import { PollsPanel } from '@/components/polls-panel';
import { PlayPanel } from '@/components/play-panel';
import { LeaderboardPanel } from '@/components/quiz-leaderboard';
import { VoiceRoom } from '@/components/voice-room';
import type { Channel, Community } from '@playground/shared';
import { AppHeader } from '@/components/site-header';
import { MiniBanner } from '@/components/page-banner';
import { connectSocket } from '@/lib/socket';
import { Hash, Mic, Gamepad2, Copy } from 'lucide-react';

type Tab = 'play' | 'chat' | 'events' | 'polls' | 'leaderboard';

/** Tabs shown in the sidebar — gated by FEATURES in lib/features.ts */
const COMMUNITY_TABS: { id: Tab; label: string; feature?: keyof typeof FEATURES }[] = [
  { id: 'play', label: '🎮 Play' },
  { id: 'chat', label: 'Chat', feature: 'chat' },
  { id: 'events', label: 'Events', feature: 'events' },
  { id: 'polls', label: 'Polls', feature: 'polls' },
  { id: 'leaderboard', label: 'Leaderboard', feature: 'communityLeaderboard' },
];

function visibleTabs() {
  return COMMUNITY_TABS.filter((t) => !t.feature || FEATURES[t.feature]);
}

export default function CommunityPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { user, token, loading } = useAuth();
  const router = useRouter();
  const [community, setCommunity] = useState<(Community & { channels: Channel[] }) | null>(null);
  const [activeChannel, setActiveChannel] = useState<Channel | null>(null);
  const [tab, setTab] = useState<Tab>('play');
  const [inviteUrl, setInviteUrl] = useState('');
  const tabs = visibleTabs();

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

  if (loading || !community) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const voiceChannel = FEATURES.voiceRooms
    ? community.channels.find((c) => c.type === 'voice')
    : undefined;

  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader
        title={community.name}
        subtitle={`${community.memberCount} members`}
        actions={
          <Button size="sm" variant="outline" onClick={createInvite}>
            <Copy className="h-4 w-4 mr-1" /> Invite
          </Button>
        }
      />
      {inviteUrl && (
        <p className="text-xs text-center text-primary py-2 bg-primary/5 border-b border-primary/10">
          Invite link copied!
        </p>
      )}

      <div className="flex-1 container mx-auto px-4 py-4 flex flex-col lg:flex-row gap-4">
        {tabs.length > 1 && (
          <aside className="lg:w-48 shrink-0 space-y-1">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`w-full text-left px-3 py-2 rounded-md text-sm capitalize font-medium ${tab === t.id ? 'bg-primary/20 text-primary' : 'hover:bg-secondary'}`}
              >
                {t.label}
              </button>
            ))}

            {/* Phase 2 — channel list (chat + voice); see FEATURES.chat */}
            {FEATURES.chat && (
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
            )}
          </aside>
        )}

        <main className="flex-1 min-w-0 space-y-4">
          <MiniBanner
            emoji="🎮"
            title="Quick play"
            description="Start a trivia session for this community"
            href={`/c/${slug}/play`}
          />

          {tab === 'chat' && FEATURES.chat && activeChannel && activeChannel.type === 'text' && (
            <Card className="h-full">
              <CardHeader className="py-3"><CardTitle className="text-base">#{activeChannel.name}</CardTitle></CardHeader>
              <CardContent className="p-0">
                <ChatPanel channel={activeChannel} communityId={community.id} />
              </CardContent>
            </Card>
          )}

          {tab === 'play' && <PlayPanel communityId={community.id} slug={slug} />}

          {tab === 'events' && FEATURES.events && (
            <div className="space-y-4">
              <EventsPanel communityId={community.id} slug={slug} />
              {FEATURES.voiceRooms && voiceChannel && (
                <VoiceRoom roomName={`${community.slug}-${voiceChannel.name}`} />
              )}
            </div>
          )}

          {tab === 'polls' && FEATURES.polls && <PollsPanel communityId={community.id} />}
          {tab === 'leaderboard' && FEATURES.communityLeaderboard && (
            <LeaderboardPanel communityId={community.id} />
          )}
        </main>
      </div>
    </div>
  );
}
