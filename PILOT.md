# Pilot Launch Playbook

Use this guide to run your first 5–10 pilot game nights and collect actionable feedback.

## Pre-launch checklist

- [ ] Docker running (`npm run docker:up`)
- [ ] Database synced (`npm run db:push`)
- [ ] App running (`npm run dev`)
- [ ] Test account created at http://localhost:3000/register
- [ ] Optional: `OPENAI_API_KEY` set for real AI quizzes
- [ ] Optional: LiveKit configured for voice

## Pilot script (30-minute game night)

### Before (5 min)

1. Create a community (Dashboard → New Community)
2. Go to **Quiz** tab → generate a quiz on your topic → review/edit questions
3. Go to **Events** tab → create event for today
4. Click **Invite** → copy link → send to 5–10 participants

### During (25 min)

1. Open the event page → **RSVP Going**
2. As host: **Start Trivia** → share game lobby link
3. Wait for players in lobby (target: 5+ joined)
4. Click **Start Game**
5. Run through questions: players answer → host **Reveal** → **Next Question**
6. Review final leaderboard together

### After (5 min)

1. Check **Leaderboard** tab for updated scores
2. Ask participants:
   - Was setup easy? (1–5)
   - Did trivia feel responsive? (1–5)
   - Would you come back next week? (Y/N)
   - What was confusing?

## Feedback template

| Participant | Setup (1-5) | Responsiveness (1-5) | Would return? | Top friction |
|-------------|-------------|----------------------|---------------|--------------|
|             |             |                      |               |              |

## Success criteria for Phase 1

- Host runs full game night without developer help
- 5+ concurrent players in one trivia session
- End-to-end flow under 5 minutes (signup → first question)
- At least 2 pilots schedule a second event

## Known limitations (Phase 1)

- Voice requires LiveKit credentials
- AI quizzes use demo mode without OpenAI key
- Email reminders log to console without SMTP
- Game state resets if API server restarts (use single instance for pilots)

## Reporting issues

Track bugs with: steps to reproduce, browser/device, number of players, and screenshot of game state.
