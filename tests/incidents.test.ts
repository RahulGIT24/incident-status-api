import request from 'supertest';
import { createApp } from '../src/app';
import { Incident, IncidentFilters, IncidentsRepository, Pagination } from '../src/incidents/incidents.types';

const SAMPLE: Incident[] = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    title: 'DB connection pool exhausted',
    severity: 'critical',
    status: 'open',
    assignee: null,
    created_at: new Date().toISOString(),
    resolved_at: null,
    version: 1,
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    title: 'Slow report export',
    severity: 'low',
    status: 'resolved',
    assignee: 'sam',
    created_at: new Date().toISOString(),
    resolved_at: new Date().toISOString(),
    version: 1,
  },
];

class FakeIncidentsRepository implements IncidentsRepository {
  async findAll(filters: IncidentFilters, pagination: Pagination) {
    const filtered = SAMPLE.filter((incident) => {
      if (filters.status && incident.status !== filters.status) return false;
      if (filters.severity && incident.severity !== filters.severity) return false;
      if (filters.assignee && incident.assignee !== filters.assignee) return false;
      return true;
    });

    return {
      data: filtered.slice(pagination.offset, pagination.offset + pagination.limit),
      total: filtered.length,
      limit: pagination.limit,
      offset: pagination.offset,
    };
  }
}

const app = createApp(new FakeIncidentsRepository());

describe('GET /incidents', () => {
  it('returns paginated incidents', async () => {
    const res = await request(app).get('/incidents');

    expect(res.status).toBe(200);
    expect(res.body.total).toBe(2);
    expect(res.body.data).toHaveLength(2);
  });

  it('filters by status', async () => {
    const res = await request(app).get('/incidents').query({ status: 'resolved' });

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].status).toBe('resolved');
  });

  it('rejects an invalid status filter', async () => {
    const res = await request(app).get('/incidents').query({ status: 'bogus' });

    expect(res.status).toBe(400);
  });
});
