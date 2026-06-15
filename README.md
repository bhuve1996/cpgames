# Playground — Social Gaming & Community Platform

Phase 1 MVP: communities, chat, voice, events, polls, live trivia, AI quiz generator, and leaderboards.

## Stack

- **Web:** Next.js 15, React, TypeScript, Tailwind CSS
- **API:** NestJS, PostgreSQL (Prisma), Redis, Socket.IO
- **Voice:** LiveKit (optional)
- **AI:** OpenAI (optional — falls back to demo quizzes)

## Quick Start

### 1. Prerequisites

- Node.js 20+
- Docker (for Postgres + Redis)

### 2. Install & configure

```bash
npm install
cp .env.example .env
npm run docker:up
```

### 3. Database setup

```bash
npm run db:push
```

### 4. Run development servers

```bash
npm run dev
```

- Web: http://localhost:3000
- API: http://localhost:3001

## Project Structure

```
games/
├── apps/
│   ├── web/          # Next.js frontend
│   └── api/          # NestJS backend + Socket.IO
├── packages/
│   ├── shared/       # Types, schemas, socket events
│   └── game-engine/  # Server-authoritative trivia engine
└── docker-compose.yml
```

## Features (Phase 1)

| Feature | Status |
|---------|--------|
| Auth (email + Google OAuth) | ✅ |
| Communities (public/private/invite) | ✅ |
| Text channels + realtime chat | ✅ |
| Voice rooms (LiveKit) | ✅ (requires config) |
| Events + RSVPs + reminders | ✅ |
| Polls | ✅ |
| Live trivia (2–50 players) | ✅ |
| AI quiz generator | ✅ |
| Leaderboards | ✅ |
| PWA / mobile-responsive | ✅ |

## Environment Variables

See [.env.example](.env.example). Minimum required:

- `DATABASE_URL`
- `REDIS_URL`
- `JWT_SECRET`

Optional:

- `OPENAI_API_KEY` — AI quiz generation
- `LIVEKIT_*` — voice rooms
- `GOOGLE_CLIENT_*` — Google OAuth
- `SMTP_*` — email event reminders

## Pilot Launch Guide

1. Create a community and invite 5–10 people via invite link
2. Generate an AI quiz on the Quiz tab
3. Schedule an event on the Events tab
4. At event time: host clicks **Start Trivia** on the event page
5. Players join the game lobby; host starts the game
6. After game: check leaderboard on the Leaderboard tab

Collect feedback on:
- Time to first game night (< 5 min target)
- Host UX (start/reveal/next flow)
- Mobile experience during trivia

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start web + API |
| `npm run build` | Build all packages |
| `npm run docker:up` | Start Postgres + Redis |
| `npm run db:push` | Sync Prisma schema |
