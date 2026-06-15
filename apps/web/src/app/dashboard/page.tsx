'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';
import { api } from '@/lib/api';
import { getErrorMessage } from '@/lib/errors';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SiteHeader } from '@/components/site-header';
import { PromoStrip } from '@/components/promo-strip';
import { PageBanner } from '@/components/page-banner';
import { AnimatedBackground } from '@/components/animated-background';
import { FloatingEmojis } from '@/components/floating-emojis';
import type { Community } from '@playground/shared';
import { Plus, Users } from 'lucide-react';

export default function DashboardPage() {
  const { user, token, loading, logout } = useAuth();
  const router = useRouter();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [loading, user, router]);

  useEffect(() => {
    if (token) {
      api<Community[]>('/communities/mine', { token }).then(setCommunities).catch(console.error);
    }
  }, [token]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setCreating(true);
    try {
      const community = await api<Community>('/communities', {
        method: 'POST',
        token,
        body: JSON.stringify({ name, slug: slug || name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''), visibility: 'private' }),
      });
      router.push(`/c/${community.slug}`);
    } catch (err) {
      alert(getErrorMessage(err, 'Failed to create community'));
    } finally {
      setCreating(false);
    }
  };

  if (loading || !user) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <AnimatedBackground />
      <FloatingEmojis preset="dashboard" density="light" />
      <PromoStrip />
      <SiteHeader user={{ displayName: user.displayName }} onLogout={logout} />

      <main className="container mx-auto px-4 py-8 max-w-4xl space-y-8">
        <PageBanner
          variant="dashboard"
          eyebrow="Your hub"
          title={`Hey, ${user.displayName.split(' ')[0]}!`}
          description="Manage communities and jump back into a game anytime."
          cta={{ href: '/games', label: 'Play a game' }}
        />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Your Communities</h1>
            <p className="text-muted-foreground">Manage groups and host game nights</p>
          </div>
          <Button onClick={() => setShowCreate(!showCreate)}>
            <Plus className="h-4 w-4 mr-2" />
            New Community
          </Button>
        </div>

        {showCreate && (
          <Card className="mb-8 max-w-lg">
            <CardHeader>
              <CardTitle>Create Community</CardTitle>
              <CardDescription>Set up a home for your group</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreate} className="space-y-4">
                <Input placeholder="Community name" value={name} onChange={(e) => setName(e.target.value)} required />
                <Input placeholder="URL slug (e.g. my-team)" value={slug} onChange={(e) => setSlug(e.target.value)} />
                <Button type="submit" disabled={creating}>{creating ? 'Creating...' : 'Create'}</Button>
              </form>
            </CardContent>
          </Card>
        )}

        {communities.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">No communities yet. Create one to get started!</p>
              <Button onClick={() => setShowCreate(true)}>Create Community</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {communities.map((c) => (
              <div key={c.id} className="space-y-2">
                <Link href={`/c/${c.slug}`}>
                  <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
                    <CardHeader>
                      <CardTitle>{c.name}</CardTitle>
                      <CardDescription>{c.memberCount} members · {c.visibility}</CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
                <Link href={`/c/${c.slug}`}>
                  <Button className="w-full gap-2" size="sm">🎮 Play Trivia Now</Button>
                </Link>
                <Link href="/games">
                  <Button variant="outline" className="w-full gap-2" size="sm">Explore all games</Button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
