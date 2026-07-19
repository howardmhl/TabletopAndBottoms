# Tabletop and Bottoms

Board game night leaderboard and campaign tracker, rebuilt as a React and Vite app.

## Local development

```bash
npm install
npm run dev:netlify
```

The app reads from Turso through Netlify functions. Use Netlify Dev locally so the functions are available.

Create a local `.env` from `.env.example`:

```bash
TURSO_DATABASE_URL=libsql://tabletopandbottoms-howardmhl.aws-eu-west-1.turso.io
TURSO_AUTH_TOKEN=your_turso_auth_token_here
```

## Build

```bash
npm run build
```
