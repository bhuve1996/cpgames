'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/auth-provider';
import { api } from '@/lib/api';
import { PlayPanel } from '@/components/play-panel';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function PlayPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { user, token, loading } = useAuth();
  const router = useRouter();
  const [communityId, setCommunityId] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [loading, user, router]);

  useEffect(() => {
    if (token && slug) {
      api<{ id: string }>(`/communities/${slug}`, { token }).then((c) => setCommunityId(c.id));
    }
  }, [token, slug]);

  if (loading || !user || !communityId) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-border/50">
        <div className="container mx-auto flex h-14 items-center gap-3 px-4">
          <Link href={`/c/${slug}`}>
            <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
          </Link>
          <h1 className="font-bold">Play Trivia</h1>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8 max-w-lg">
        <PlayPanel communityId={communityId} slug={slug} />
      </main>
    </div>
  );
}
