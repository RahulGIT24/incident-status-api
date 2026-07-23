import { IncidentFilters, IncidentsRepository, Pagination } from './incidents.types';

const MAX_LIMIT = 100;
const DEFAULT_LIMIT = 20;

export class IncidentsService {
  constructor(private readonly repository: IncidentsRepository) {}

  list(rawFilters: IncidentFilters, rawPagination: Partial<Pagination>) {
    const limit = Math.min(rawPagination.limit ?? DEFAULT_LIMIT, MAX_LIMIT);
    const offset = rawPagination.offset ?? 0;

    return this.repository.findAll(rawFilters, { limit, offset });
  }
}
