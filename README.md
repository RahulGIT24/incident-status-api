# Incident Status API

A small service for tracking incidents: title, severity, status, assignee, and resolution timing.

## Setup

```bash
cp .env.example .env
docker compose up -d
npm install
npm run migrate:up
npm run seed
```

The API is now running at `http://localhost:3000`. Try it:

```bash
curl "http://localhost:3000/incidents?status=open"
```

## Running tests

```bash
npm test
```

Tests run against an in-memory fake repository, not the database, so no running containers are required.

## What's already here

- `GET /incidents` — paginated (`limit`, `offset`), filterable by `status`, `severity`, `assignee`.
- Layering: `incidents.controller.ts` (HTTP) → `incidents.service.ts` (pagination/defaults) → `incidents.repository.ts` (SQL).
- Migration for the `incidents` table (`migrations/`), seed data covering all severities/statuses over the last 30 days (`migrations/seed.sql`).

---

## Your task (60 minutes)

Extend this service. Work directly in `src/incidents/`. Ask questions out loud — we care about how you think, not just the diff.

### Task 1 — Status transitions (10 min)

Add `PATCH /incidents/:id/status` that updates an incident's status, enforcing this state machine:

```
open -> acknowledged -> resolved
```

- Any other transition (e.g. `open -> resolved`, `resolved -> open`, same-status no-op) returns **400** with an error body.
- A valid transition to `resolved` should set `resolved_at`.
- Incident not found → **404**.

**Example — valid transition:**

```bash
curl -X PATCH http://localhost:3000/incidents/<id>/status \
  -H 'Content-Type: application/json' \
  -d '{"status": "acknowledged"}'
```

```json
// 200 OK
{
  "id": "…",
  "title": "Login page intermittent timeout",
  "severity": "high",
  "status": "acknowledged",
  "assignee": "priya",
  "created_at": "2026-07-22T09:14:00.000Z",
  "resolved_at": null,
  "version": 2
}
```

**Example — invalid transition** (incident is currently `open`, request asks for `resolved`):

```json
// 400 Bad Request
{ "error": "Cannot transition from open to resolved" }
```

### Task 2 — Time-to-resolution stats (10 min)

Add `GET /incidents/stats` returning the average time-to-resolution, in minutes, grouped by severity — for incidents that have been resolved.

Requirements:

- **Single SQL query.** No fetching rows and averaging in application code.
- Use a CTE or window function — whichever you find more readable, but be ready to explain the choice.
- Response shape is up to you; make it easy to read (e.g. one row per severity with an average).

**Example:**

```bash
curl http://localhost:3000/incidents/stats
```

```json
// 200 OK — illustrative shape, exact field names are your call
[
  { "severity": "critical", "resolved_count": 2, "avg_resolution_minutes": 82.5 },
  { "severity": "high", "resolved_count": 3, "avg_resolution_minutes": 190.0 },
  { "severity": "medium", "resolved_count": 3, "avg_resolution_minutes": 220.0 },
  { "severity": "low", "resolved_count": 3, "avg_resolution_minutes": 36.7 }
]
```

### Task 3 — Concurrent update race (10 min)

Two clients `PATCH` the same incident's status at nearly the same time. Handle it correctly using the `version` column already on the table:

- Each successful update increments `version`.
- If a request's expected version doesn't match what's in the database, return **409 Conflict** instead of silently overwriting.
- Decide how the client supplies the expected version (body field, header, etc.) and be ready to justify the choice.

**Example** (one reasonable shape — client read the incident at `version: 2`, another client already bumped it to `3` before this request lands):

```bash
curl -X PATCH http://localhost:3000/incidents/<id>/status \
  -H 'Content-Type: application/json' \
  -d '{"status": "resolved", "version": 2}'
```

```json
// 409 Conflict
{ "error": "Incident was modified by another request, refetch and retry" }
```

### Task 4 — Discussion only, no code (5 min)

This endpoint suddenly gets hit at 500 req/sec — for example, a status page that polls `GET /incidents` every second from thousands of open browser tabs. What breaks first, and how would you fix it? We'll talk through it together — think connection pools, indexes, caching, and what you'd actually reach for first under time pressure.
