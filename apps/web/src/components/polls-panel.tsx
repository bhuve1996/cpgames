'use client';

/** Phase 2 — community polls (enable FEATURES.polls in lib/features.ts). */
import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth-provider';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import type { Poll } from '@playground/shared';
import { BarChart3, Plus } from 'lucide-react';

export function PollsPanel({ communityId }: { communityId: string }) {
  const { token } = useAuth();
  const [polls, setPolls] = useState<Poll[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);

  useEffect(() => {
    if (token) {
      api<Poll[]>(`/communities/${communityId}/polls`, { token }).then(setPolls).catch(console.error);
    }
  }, [communityId, token]);

  const createPoll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    const poll = await api<Poll>(`/communities/${communityId}/polls`, {
      method: 'POST',
      token,
      body: JSON.stringify({ question, options: options.filter(Boolean) }),
    });
    setPolls((prev) => [poll, ...prev]);
    setShowCreate(false);
    setQuestion('');
    setOptions(['', '']);
  };

  const vote = async (pollId: string, optionId: string) => {
    if (!token) return;
    const updated = await api<Poll>(`/polls/${pollId}/vote`, {
      method: 'POST',
      token,
      body: JSON.stringify({ optionId }),
    });
    setPolls((prev) => prev.map((p) => (p.id === pollId ? updated : p)));
  };

  const totalVotes = (poll: Poll) => poll.options.reduce((sum, o) => sum + (o.voteCount ?? 0), 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <BarChart3 className="h-4 w-4" /> Polls
        </h3>
        <Button size="sm" onClick={() => setShowCreate(!showCreate)}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {showCreate && (
        <Card>
          <CardContent className="pt-4 space-y-3">
            <form onSubmit={createPoll} className="space-y-3">
              <Input placeholder="Question" value={question} onChange={(e) => setQuestion(e.target.value)} required />
              {options.map((opt, i) => (
                <Input
                  key={i}
                  placeholder={`Option ${i + 1}`}
                  value={opt}
                  onChange={(e) => {
                    const next = [...options];
                    next[i] = e.target.value;
                    setOptions(next);
                  }}
                />
              ))}
              <Button type="button" size="sm" variant="outline" onClick={() => setOptions([...options, ''])}>
                Add option
              </Button>
              <Button type="submit" size="sm">Create Poll</Button>
            </form>
          </CardContent>
        </Card>
      )}

      {polls.map((poll) => (
        <Card key={poll.id}>
          <CardContent className="pt-4 space-y-2">
            <p className="font-medium">{poll.question}</p>
            {poll.options.map((opt) => {
              const votes = totalVotes(poll);
              const pct = votes > 0 ? Math.round(((opt.voteCount ?? 0) / votes) * 100) : 0;
              return (
                <button
                  key={opt.id}
                  onClick={() => vote(poll.id, opt.id)}
                  className="w-full text-left p-2 rounded-md border border-border hover:border-primary/50 transition-colors"
                >
                  <div className="flex justify-between text-sm">
                    <span>{opt.text}</span>
                    <span className="text-muted-foreground">{opt.voteCount ?? 0} ({pct}%)</span>
                  </div>
                  <div className="h-1.5 bg-secondary rounded-full mt-1 overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </button>
              );
            })}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
