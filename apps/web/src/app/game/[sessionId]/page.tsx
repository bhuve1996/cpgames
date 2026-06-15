import { redirect } from 'next/navigation';

export default async function LegacyGameSessionRedirect({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  redirect(`/games/trivia/${sessionId}`);
}
