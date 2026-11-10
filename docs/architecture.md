# V4YT OFFICIAL API and data plan

## Frontend inspection (2026-11-08)

Routes are defined in `src/routes.tsx`: home; tournaments/list/detail/register/live; leaderboard; players/list/profile/compare; hall of fame; videos; dashboard; achievements; rewards; teams; notifications; announcements; search; login; settings; and admin dashboard, players, tournaments, results, points, achievements, and announcements.

The current helper is `src/lib/api.ts`. It hardcodes `http://localhost:8000`, puts `v4yt_token` in an Authorization header, uses JSON for GET/POST/PUT, and posts login forms to `/auth/login`. Existing calls use `/auth/me`, `/auth/register`, `/notifications/` and read/mark-all-read, `/announcements/`, `/tournaments/`, `/tournaments/{id}/register`, `/players/`, `/players/{id}`, `/achievements/`, `/achievements/user/{id}`, `/teams/`, and admin players/tournaments/results/adjust-points/announcements. Login can use the same form body at `/auth/token`; profile settings currently send form-like objects to PUT `/auth/me`; results and registration payload shapes are based on the existing pages and should be treated as compatibility contracts.

`src/data/mock.ts` contains:

- Players: id, username, level, points, xp, rank, wins, tier, avatar, winRate, tournaments, streak.
- Tournaments: id, name, game, date, time, players, maxPlayers, prize, status, countdown, image, description, rules, schedule, plus optional winner/results.
- Videos: id, title, views, date, game, duration, type, thumb.
- Achievements: id, icon, name, desc, unlocked, category, optional progress/max.
- Hall of fame: year, tournament, champion, runnerUp, third, date, avatar.
- Point history: id, action, event, points, date, type.
- Notifications: id, icon, text, sub, time, read.
- Rewards: id, name, cost, desc, icon, available.
- Teams: id, name, logo, captain, members, wins, points, rank.
- Announcements: id, title, category, date, image, desc.
- Ranks: name, color, min, max, icon.

IDs and date labels in these mocks are presentation values, not stable database identifiers. The initial UI also mixes game names/status labels and has no definitive result submission, refresh-token, team invitation, reward fulfillment, password reset, or pagination contract. The backend uses UUIDs and ISO timestamps; the frontend adapter retains familiar field aliases where practical. There is no Google OAuth flow in the inspected routes or login page, so it is future work.

## Architecture and assumptions

`backend/` is an independent FastAPI application with routers, Pydantic v2 schemas, SQLAlchemy 2 async models/services, Alembic, and pytest. The browser talks only to this API. Supabase's transaction pooler (6543) is the runtime `DATABASE_URL` using asyncpg with prepared statement caching disabled; Alembic uses `DIRECT_URL`. The backend has no credential defaults and fails startup validation if secrets/config are absent. Storage is URL-only for this delivery; signed upload integration can be added when bucket and service-role credentials are configured.

The database is normalized around users/profiles, role permissions, games, teams/memberships/invites, tournaments/registrations/rounds/matches/participants/results, append-only point transactions, level thresholds, achievements/awards, hall of fame, rewards/redemptions, notifications, announcements, videos, and audit logs. All tables use UUID keys, timestamps, foreign keys and RLS with no public policies. UUIDs replace mock numeric ids. Seeded mock presentation labels are preserved in content. A seeded admin password is only read from `SEED_ADMIN_PASSWORD`.

Leaderboard points and wins are computed from persisted ledger/results, with tie order points descending, wins descending, earliest point transaction ascending, then UUID ascending for a stable final tie. Tournament award schedule is 500/300/200 for first/second/third, 100 for other classified finishers, plus 50 participation; tied placements share the placement's points (same points per tied player). Results are treated as a complete placement list. Result submission awards the seeded Champion and First Win achievements for a winner. Refund/correction actions write compensating ledger rows. Team registration uses the current captain's team selection; an individual may only have one active registration in a tournament regardless of team.

## Business rules and operational notes

Registration locks the tournament row, checks open status/window/capacity and relies on a unique registration constraint. Closing prevents new registrations. Cancellation preserves results but excludes cancelled tournaments from rankings and refunds recorded entry costs through new ledger entries. Redemption locks reward and user balance, debits points in the same transaction, and cancellation/refund restores stock and credits through a compensating ledger entry. A team has one captain; captain transfer is required before leaving. Admin mutations have an audit row.

Email delivery uses an interface with console fallback; set up a real provider for production password reset. Reward fulfillment, tournament payouts, and external game verification remain manual admin workflows. Google OAuth is optional future work. Storage is URL-only at present. Free-tier deployment should use a host that supports ASGI and persistent secrets, keep the transaction pooler URL for app traffic, and use a direct/session connection for migrations. Do not expose any Supabase key or URL to Vite.

## Initial API integration changes

Frontend must set only `VITE_API_BASE_URL`; refresh tokens are held by the API client and access tokens stay in memory/localStorage compatibility storage. Backend list endpoints return `{items, total, limit, offset}`. Registration/login errors use `{error:{code,message,details}}`. The existing UI may need small field adapters and loading/error/empty states where it currently reads mock data.
