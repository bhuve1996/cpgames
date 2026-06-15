'use client';

/**
 * Phase 2 — AI quiz generator UI (backend: /ai/quiz/*).
 * Enable with FEATURES.aiQuiz in lib/features.ts.
 */
import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth-provider';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { TriviaQuiz, TriviaQuestion, LeaderboardEntry } from '@playground/shared';
import { Sparkles, Trophy } from 'lucide-react';

export function AiQuizPanel({
  communityId,
  onQuizReady,
}: {
  communityId: string;
  onQuizReady: (quiz: TriviaQuiz) => void;
}) {
  const { token } = useAuth();
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [quiz, setQuiz] = useState<TriviaQuiz | null>(null);

  const generate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setLoading(true);
    try {
      const result = await api<TriviaQuiz & { id: string }>('/ai/quiz/generate', {
        method: 'POST',
        token,
        body: JSON.stringify({ topic, questionCount: 10, difficulty: 'medium' }),
      });
      setQuiz(result);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Generation failed');
    } finally {
      setLoading(false);
    }
  };

  const updateQuestion = (index: number, field: keyof TriviaQuestion, value: string | number) => {
    if (!quiz) return;
    const questions = [...quiz.questions];
    questions[index] = { ...questions[index], [field]: value };
    setQuiz({ ...quiz, questions });
  };

  return (
    <div className="space-y-4">
      <h3 className="font-semibold flex items-center gap-2">
        <Sparkles className="h-4 w-4" /> AI Quiz Generator
      </h3>

      <form onSubmit={generate} className="flex gap-2">
        <Input placeholder="Topic (e.g. 90s Movies, World History)" value={topic} onChange={(e) => setTopic(e.target.value)} required />
        <Button type="submit" disabled={loading}>{loading ? 'Generating...' : 'Generate'}</Button>
      </form>

      {quiz && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{quiz.title}</CardTitle>
            <p className="text-sm text-muted-foreground">{quiz.description}</p>
          </CardHeader>
          <CardContent className="space-y-4 max-h-96 overflow-y-auto">
            {quiz.questions.map((q, i) => (
              <div key={q.id} className="p-3 border border-border rounded-md space-y-2">
                <Input value={q.question} onChange={(e) => updateQuestion(i, 'question', e.target.value)} />
                {q.options.map((opt, j) => (
                  <Input key={j} value={opt} onChange={(e) => {
                    const options = [...q.options];
                    options[j] = e.target.value;
                    updateQuestion(i, 'options', options as unknown as string);
                    if (quiz) {
                      const questions = [...quiz.questions];
                      questions[i] = { ...questions[i], options };
                      setQuiz({ ...quiz, questions });
                    }
                  }} />
                ))}
              </div>
            ))}
            <Button onClick={() => onQuizReady(quiz)}>Use this quiz for event</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/** Phase 2 — community leaderboard (enable FEATURES.communityLeaderboard in lib/features.ts). */
export function LeaderboardPanel({ communityId }: { communityId: string }) {
  const { token } = useAuth();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    if (token) {
      api<LeaderboardEntry[]>(`/leaderboard/communities/${communityId}?period=all_time`, { token })
        .then(setEntries)
        .catch(console.error);
    }
  }, [communityId, token]);

  return (
    <div className="space-y-4">
      <h3 className="font-semibold flex items-center gap-2">
        <Trophy className="h-4 w-4" /> Leaderboard
      </h3>
      {entries.length === 0 ? (
        <p className="text-sm text-muted-foreground">Play trivia to earn points!</p>
      ) : (
        entries.slice(0, 10).map((entry) => (
          <div key={entry.userId} className="flex items-center justify-between p-2 rounded-md bg-secondary/50">
            <div className="flex items-center gap-2">
              <span className="font-bold text-primary w-6">#{entry.rank}</span>
              <span>{entry.displayName}</span>
            </div>
            <span className="text-sm text-muted-foreground">{entry.points} pts</span>
          </div>
        ))
      )}
    </div>
  );
}
