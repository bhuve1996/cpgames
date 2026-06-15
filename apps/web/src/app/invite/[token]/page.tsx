'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function InvitePage() {
  const params = useParams();
  const token = params.token as string;
  const { user, token: authToken, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push(`/login?redirect=/invite/${token}`);
      return;
    }
    if (authToken && token) {
      api<{ community: { slug: string; name: string } }>(`/communities/invite/${token}/join`, {
        method: 'POST',
        token: authToken,
      })
        .then((res) => router.push(`/c/${res.community.slug}`))
        .catch((err) => console.error(err));
    }
  }, [loading, user, authToken, token, router]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle>Joining community...</CardTitle>
        </CardHeader>
        <CardContent>
          {!user && !loading && (
            <>
              <p className="text-muted-foreground mb-4">Please sign in to accept this invite.</p>
              <Link href={`/login?redirect=/invite/${token}`}>
                <Button>Sign in</Button>
              </Link>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
