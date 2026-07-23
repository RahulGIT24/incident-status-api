-- Sample data spread over the last 30 days, covering every severity/status
-- combination so stats/filter queries return meaningful results.
TRUNCATE incidents;

INSERT INTO incidents (title, severity, status, assignee, created_at, resolved_at)
VALUES
  ('Payment webhook retries exhausted', 'critical', 'resolved', 'priya', now() - interval '29 days', now() - interval '29 days' + interval '45 minutes'),
  ('Checkout 500s on EU region', 'critical', 'resolved', 'devon', now() - interval '27 days', now() - interval '27 days' + interval '2 hours'),
  ('Auth token refresh loop', 'critical', 'acknowledged', 'priya', now() - interval '2 days', NULL),
  ('Primary DB replica lag spike', 'critical', 'open', NULL, now() - interval '3 hours', NULL),

  ('Search indexing backlog', 'high', 'resolved', 'sam', now() - interval '25 days', now() - interval '25 days' + interval '3 hours'),
  ('Elevated 502s from CDN edge', 'high', 'resolved', 'devon', now() - interval '21 days', now() - interval '21 days' + interval '90 minutes'),
  ('Notification queue draining slowly', 'high', 'resolved', 'sam', now() - interval '14 days', now() - interval '14 days' + interval '5 hours'),
  ('Login page intermittent timeout', 'high', 'acknowledged', 'priya', now() - interval '1 day', NULL),
  ('Report export failing for large tenants', 'high', 'open', NULL, now() - interval '6 hours', NULL),

  ('Stale cache on pricing page', 'medium', 'resolved', 'jordan', now() - interval '23 days', now() - interval '23 days' + interval '1 hour'),
  ('Email digest sent twice', 'medium', 'resolved', 'sam', now() - interval '19 days', now() - interval '19 days' + interval '4 hours'),
  ('Slow query on dashboard widget', 'medium', 'resolved', 'jordan', now() - interval '11 days', now() - interval '11 days' + interval '6 hours'),
  ('CSV import silently drops rows', 'medium', 'acknowledged', 'devon', now() - interval '4 days', NULL),
  ('Webhook signature mismatch for one tenant', 'medium', 'open', 'jordan', now() - interval '12 hours', NULL),

  ('Typo in weekly summary email', 'low', 'resolved', 'jordan', now() - interval '20 days', now() - interval '20 days' + interval '30 minutes'),
  ('Favicon 404 in staging', 'low', 'resolved', 'sam', now() - interval '17 days', now() - interval '17 days' + interval '20 minutes'),
  ('Docs link points to old API version', 'low', 'resolved', 'priya', now() - interval '9 days', now() - interval '9 days' + interval '1 hour'),
  ('Minor layout shift on settings page', 'low', 'acknowledged', NULL, now() - interval '5 days', NULL),
  ('Admin panel button label misaligned', 'low', 'open', NULL, now() - interval '1 hour', NULL);
