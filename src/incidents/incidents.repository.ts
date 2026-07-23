import { DatabaseSync, SQLInputValue } from 'node:sqlite';
import { Incident, IncidentFilters, IncidentsRepository, Pagination, PagedResult } from './incidents.types';

export class SqliteIncidentsRepository implements IncidentsRepository {
  constructor(private readonly db: DatabaseSync) {}

  async findAll(filters: IncidentFilters, pagination: Pagination): Promise<PagedResult<Incident>> {
    const conditions: string[] = [];
    const params: SQLInputValue[] = [];

    if (filters.status) {
      conditions.push('status = ?');
      params.push(filters.status);
    }
    if (filters.severity) {
      conditions.push('severity = ?');
      params.push(filters.severity);
    }
    if (filters.assignee) {
      conditions.push('assignee = ?');
      params.push(filters.assignee);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const { count } = this.db
      .prepare(`SELECT count(*) AS count FROM incidents ${where}`)
      .get(...params) as unknown as { count: number };

    const data = this.db
      .prepare(`SELECT * FROM incidents ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`)
      .all(...params, pagination.limit, pagination.offset) as unknown as Incident[];

    return {
      data,
      total: count,
      limit: pagination.limit,
      offset: pagination.offset,
    };
  }
}
