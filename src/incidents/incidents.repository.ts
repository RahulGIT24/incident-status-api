import { Pool } from 'pg';
import { Incident, IncidentFilters, IncidentsRepository, Pagination, PagedResult } from './incidents.types';

export class PgIncidentsRepository implements IncidentsRepository {
  constructor(private readonly pool: Pool) {}

  async findAll(filters: IncidentFilters, pagination: Pagination): Promise<PagedResult<Incident>> {
    const conditions: string[] = [];
    const params: unknown[] = [];

    if (filters.status) {
      params.push(filters.status);
      conditions.push(`status = $${params.length}`);
    }
    if (filters.severity) {
      params.push(filters.severity);
      conditions.push(`severity = $${params.length}`);
    }
    if (filters.assignee) {
      params.push(filters.assignee);
      conditions.push(`assignee = $${params.length}`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const countResult = await this.pool.query<{ count: string }>(
      `SELECT count(*) FROM incidents ${where}`,
      params,
    );
    const total = Number(countResult.rows[0].count);

    params.push(pagination.limit);
    const limitIdx = params.length;
    params.push(pagination.offset);
    const offsetIdx = params.length;

    const dataResult = await this.pool.query<Incident>(
      `SELECT * FROM incidents ${where} ORDER BY created_at DESC LIMIT $${limitIdx} OFFSET $${offsetIdx}`,
      params,
    );

    return {
      data: dataResult.rows,
      total,
      limit: pagination.limit,
      offset: pagination.offset,
    };
  }
}
