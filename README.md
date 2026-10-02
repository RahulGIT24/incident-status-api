# Incident Status API

A small service for tracking incidents: title, severity, status, assignee, and resolution timing.

## Setup

No Docker, no separate database server — this uses SQLite via Node's built-in `node:sqlite`, a single file on disk. **Requires Node 22.5+** (check with `node --version`).

```bash
cp .env.example .env
npm install
npm run db:setup
npm run dev
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
- Schema for the `incidents` table (`db/schema.sql`) plus a seed script (`npm run db:setup`) covering all severities/statuses spread over the last 30 days.

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

Hint: SQLite has no interval/epoch type. `julianday(x)` converts a timestamp string to a floating-point day count, so `(julianday(a) - julianday(b)) * 24 * 60` gives you minutes between two timestamps.

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

SELECT severity, COUNT(resolved_count), AVG((julianday(a) - julianday(b)) * 24 * 60) AS avg_resolution_minutes, status
FROM Incidents
where status ='resolved'
GROUP BY severity
ORDER BY avg_resolution_minutes

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

This starter uses SQLite for zero-setup local dev — no Docker, no separate DB process. Two questions:

1. This endpoint suddenly gets hit at 500 req/sec — for example, a status page that polls `GET /incidents` every second from thousands of open browser tabs. What breaks first, and how would you fix it?
2. Independent of load: what would you change about the database choice itself before this went anywhere near production?

We'll talk through it together — think about what SQLite specifically gives up compared to a client-server database, and what you'd actually reach for first under time pressure.
