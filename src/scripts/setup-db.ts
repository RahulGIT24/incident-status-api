import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import { db } from '../db';
import { Severity, Status } from '../incidents/incidents.types';

const schema = fs.readFileSync(path.join(__dirname, '../../db/schema.sql'), 'utf8');
db.exec(schema);
db.exec('DELETE FROM incidents');

interface SeedIncident {
  title: string;
  severity: Severity;
  status: Status;
  assignee: string | null;
  daysAgo: number;
  resolvedAfterMinutes: number | null;
}

// Spread over the last 30 days, covering every severity/status combination
// so filter and stats queries return meaningful results.
const SEED: SeedIncident[] = [
  { title: 'Payment webhook retries exhausted', severity: 'critical', status: 'resolved', assignee: 'priya', daysAgo: 29, resolvedAfterMinutes: 45 },
  { title: 'Checkout 500s on EU region', severity: 'critical', status: 'resolved', assignee: 'devon', daysAgo: 27, resolvedAfterMinutes: 120 },
  { title: 'Auth token refresh loop', severity: 'critical', status: 'acknowledged', assignee: 'priya', daysAgo: 2, resolvedAfterMinutes: null },
  { title: 'Primary DB replica lag spike', severity: 'critical', status: 'open', assignee: null, daysAgo: 0.125, resolvedAfterMinutes: null },

  { title: 'Search indexing backlog', severity: 'high', status: 'resolved', assignee: 'sam', daysAgo: 25, resolvedAfterMinutes: 180 },
  { title: 'Elevated 502s from CDN edge', severity: 'high', status: 'resolved', assignee: 'devon', daysAgo: 21, resolvedAfterMinutes: 90 },
  { title: 'Notification queue draining slowly', severity: 'high', status: 'resolved', assignee: 'sam', daysAgo: 14, resolvedAfterMinutes: 300 },
  { title: 'Login page intermittent timeout', severity: 'high', status: 'acknowledged', assignee: 'priya', daysAgo: 1, resolvedAfterMinutes: null },
  { title: 'Report export failing for large tenants', severity: 'high', status: 'open', assignee: null, daysAgo: 0.25, resolvedAfterMinutes: null },

  { title: 'Stale cache on pricing page', severity: 'medium', status: 'resolved', assignee: 'jordan', daysAgo: 23, resolvedAfterMinutes: 60 },
  { title: 'Email digest sent twice', severity: 'medium', status: 'resolved', assignee: 'sam', daysAgo: 19, resolvedAfterMinutes: 240 },
  { title: 'Slow query on dashboard widget', severity: 'medium', status: 'resolved', assignee: 'jordan', daysAgo: 11, resolvedAfterMinutes: 360 },
  { title: 'CSV import silently drops rows', severity: 'medium', status: 'acknowledged', assignee: 'devon', daysAgo: 4, resolvedAfterMinutes: null },
  { title: 'Webhook signature mismatch for one tenant', severity: 'medium', status: 'open', assignee: 'jordan', daysAgo: 0.5, resolvedAfterMinutes: null },

  { title: 'Typo in weekly summary email', severity: 'low', status: 'resolved', assignee: 'jordan', daysAgo: 20, resolvedAfterMinutes: 30 },
  { title: 'Favicon 404 in staging', severity: 'low', status: 'resolved', assignee: 'sam', daysAgo: 17, resolvedAfterMinutes: 20 },
  { title: 'Docs link points to old API version', severity: 'low', status: 'resolved', assignee: 'priya', daysAgo: 9, resolvedAfterMinutes: 60 },
  { title: 'Minor layout shift on settings page', severity: 'low', status: 'acknowledged', assignee: null, daysAgo: 5, resolvedAfterMinutes: null },
  { title: 'Admin panel button label misaligned', severity: 'low', status: 'open', assignee: null, daysAgo: 0.04, resolvedAfterMinutes: null },
];

const insert = db.prepare(`
  INSERT INTO incidents (id, title, severity, status, assignee, created_at, resolved_at, version)
  VALUES (?, ?, ?, ?, ?, ?, ?, 1)
`);

const now = Date.now();
for (const incident of SEED) {
  const createdAt = new Date(now - incident.daysAgo * 24 * 60 * 60 * 1000);
  const resolvedAt =
    incident.resolvedAfterMinutes !== null
      ? new Date(createdAt.getTime() + incident.resolvedAfterMinutes * 60 * 1000)
      : null;

  insert.run(
    randomUUID(),
    incident.title,
    incident.severity,
    incident.status,
    incident.assignee,
    createdAt.toISOString(),
    resolvedAt ? resolvedAt.toISOString() : null,
  );
}

console.log(`Seeded ${SEED.length} incidents into ${db.location()}`);
