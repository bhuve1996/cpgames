import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Gamepad2, Users, Sparkles, Trophy, Mic, Calendar } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-border/50 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2 font-bold text-xl">
            <Gamepad2 className="h-6 w-6 text-primary" />
            Playground
          </div>
          <nav className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost">Log in</Button>
            </Link>
            <Link href="/register">
              <Button>Get Started</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="container mx-auto px-4 py-20 text-center">
          <div className="mx-auto max-w-3xl space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Where groups <span className="text-primary">play together</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Create communities, host live trivia nights, generate AI quizzes, and keep your
              friend groups, clubs, and teams engaged — all in one place.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
              <Link href="/register">
                <Button size="lg" className="w-full sm:w-auto">Create your community</Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">Sign in</Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: Users, title: 'Communities', desc: 'Public, private, or invite-only spaces for any group.' },
            { icon: Gamepad2, title: 'Live Trivia', desc: 'Real-time multiplayer games for 2–50 players.' },
            { icon: Sparkles, title: 'AI Quiz Generator', desc: 'Create custom quizzes in seconds, edit before you play.' },
            { icon: Mic, title: 'Voice Rooms', desc: 'Built-in voice chat for game nights and hangouts.' },
            { icon: Calendar, title: 'Events & Polls', desc: 'Schedule game nights, collect RSVPs, run polls.' },
            { icon: Trophy, title: 'Leaderboards', desc: 'Track scores and crown your community champions.' },
          ].map(({ icon: Icon, title, desc }) => (
            <Card key={title} className="bg-card/50">
              <CardHeader>
                <Icon className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-lg">{title}</CardTitle>
                <CardDescription>{desc}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </section>
      </main>

      <footer className="border-t border-border/50 py-8 text-center text-sm text-muted-foreground">
        Playground — Social Gaming & Community Platform
      </footer>
    </div>
  );
}
