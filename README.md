# 🏏 PSL Predictor

A prediction app for Pakistan Super League matches. Predict winners, earn points, compete with friends.

## Features

- 🎯 Predict match winners (2 edits allowed)
- 🏆 Dynamic leaderboard with streak bonuses
- ⏰ 24-hour prediction window (closes 10min before match)
- ⏱️ Live countdown timer on each match
- 🎨 Modern dark UI with glassmorphism
- 🔒 Secure authentication
- 📱 PWA support - Install as mobile/desktop app
- 👑 Ultimate Call - Predict finals & champion for bonus points
- 📊 Live community prediction stats
- 🔥 Streak tracking with bonus multipliers

## Tech Stack

- Next.js 14 (App Router)
- Supabase (Auth + Database)
- TypeScript
- TailwindCSS

## Quick Setup

See `QUICKSTART.md` for setup instructions.

## PWA Installation

The app can be installed as a Progressive Web App:

### Android
1. Open the website in Chrome
2. Tap the install prompt or menu → "Add to Home Screen"
3. App icon appears on home screen

### iOS (16.4+)
1. Open in Safari
2. Tap Share button → "Add to Home Screen"
3. Confirm installation

### Desktop
1. Open in Chrome/Edge
2. Click install icon in address bar
3. Or click the install prompt

Benefits: Offline support, push notifications, native app experience, quick access from home screen.

## Game Rules

See `GAME_RULES.md` for scoring and rules.

## Project Structure

```
app/          - Pages and API routes
components/   - Reusable UI components
lib/          - Business logic
data/         - Match data (JSON)
```

## Admin

Update match results by editing `data/matches.json`:
```json
{
  "match_id": "psl2026_01",
  "result": "Team Name"
}
```

Leaderboard updates automatically.

## License

Private use only.
