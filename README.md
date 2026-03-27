# 🏏 PSL Predictor

A prediction app for Pakistan Super League matches. Predict winners, earn points, compete with friends.

## Features

- 🎯 Predict match winners (2 edits allowed)
- 🏆 Dynamic leaderboard with streak bonuses
- ⏰ 24-hour prediction window (closes 10min before match)
- ⏱️ Live countdown timer on each match
- 🎨 Modern dark UI with glassmorphism
- 🔒 Secure authentication

## Tech Stack

- Next.js 14 (App Router)
- Supabase (Auth + Database)
- TypeScript
- TailwindCSS

## Quick Setup

See `QUICKSTART.md` for setup instructions.

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
