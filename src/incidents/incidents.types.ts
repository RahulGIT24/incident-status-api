import { UUID } from "crypto";

export type Severity = 'low' | 'medium' | 'high' | 'critical';
export type Status = 'open' | 'acknowledged' | 'resolved';

export interface Incident {
  id: string;
  title: string;
  severity: Severity;
  status: Status;
  assignee: string | null;
  created_at: string;
  resolved_at: string | null;
  version: number;
}

export interface IncidentFilters {
  status?: Status;
  severity?: Severity;
  assignee?: string;
}

export interface Pagination {
  limit: number;
  offset: number;
}

export interface PagedResult<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
}

export interface IncidentsRepository {
  findTask(id:UUID):any
  updateStatus(id:UUID,status:string):any
  findAll(filters: IncidentFilters, pagination: Pagination): Promise<PagedResult<Incident>>;
}
