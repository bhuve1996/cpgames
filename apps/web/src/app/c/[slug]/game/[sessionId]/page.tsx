'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';
import { TriviaGame } from '@/components/trivia-game';

export default function GamePage() {
  const params = useParams();
  const slug = params.slug as string;
  const sessionId = params.sessionId as string;
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [loading, user, router]);

  if (loading || !user) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return <TriviaGame sessionId={sessionId} slug={slug} />;
}
