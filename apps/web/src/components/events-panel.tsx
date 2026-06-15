'use client';

/** Phase 2 — events & RSVPs (enable FEATURES.events in lib/features.ts). */
import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth-provider';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Event as CommunityEvent } from '@playground/shared';
import { Calendar, Plus } from 'lucide-react';
import Link from 'next/link';

export function EventsPanel({ communityId, slug }: { communityId: string; slug: string }) {
  const { token } = useAuth();
  const [events, setEvents] = useState<CommunityEvent[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState('');
  const [startsAt, setStartsAt] = useState('');

  useEffect(() => {
    if (token) {
      api<CommunityEvent[]>(`/communities/${communityId}/events`, { token }).then(setEvents).catch(console.error);
    }
  }, [communityId, token]);

  const createEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    const event = await api<CommunityEvent>(`/communities/${communityId}/events`, {
      method: 'POST',
      token,
      body: JSON.stringify({ title, startsAt: new Date(startsAt).toISOString(), gameType: 'trivia' }),
    });
    setEvents((prev) => [...prev, event].sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()));
    setShowCreate(false);
    setTitle('');
    setStartsAt('');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <Calendar className="h-4 w-4" /> Events
        </h3>
        <Button size="sm" onClick={() => setShowCreate(!showCreate)}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {showCreate && (
        <Card>
          <CardContent className="pt-4">
            <form onSubmit={createEvent} className="space-y-3">
              <Input placeholder="Event title" value={title} onChange={(e) => setTitle(e.target.value)} required />
              <Input type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} required />
              <Button type="submit" size="sm">Create Event</Button>
            </form>
          </CardContent>
        </Card>
      )}

      {events.length === 0 ? (
        <p className="text-sm text-muted-foreground">No events scheduled. Create a game night!</p>
      ) : (
        events.map((event) => (
          <Link key={event.id} href={`/c/${slug}/events/${event.id}`}>
            <Card className="hover:border-primary/50 cursor-pointer">
              <CardHeader className="py-3">
                <CardTitle className="text-base">{event.title}</CardTitle>
                <p className="text-xs text-muted-foreground">
                  {new Date(event.startsAt).toLocaleString()} · {event.rsvpCount} RSVPs
                </p>
              </CardHeader>
            </Card>
          </Link>
        ))
      )}
    </div>
  );
}
