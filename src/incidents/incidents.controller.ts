import { Request, Response } from 'express';
import { IncidentsService } from './incidents.service';
import { Severity, Status } from './incidents.types';

const VALID_STATUSES: Status[] = ['open', 'acknowledged', 'resolved'];
const VALID_SEVERITIES: Severity[] = ['low', 'medium', 'high', 'critical'];

export class IncidentsController {
  constructor(private readonly service: IncidentsService) {}

  list = async (req: Request, res: Response) => {
    const { status, severity, assignee, limit, offset } = req.query;

    if (status !== undefined && !VALID_STATUSES.includes(status as Status)) {
      return res.status(400).json({ error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` });
    }
    if (severity !== undefined && !VALID_SEVERITIES.includes(severity as Severity)) {
      return res.status(400).json({ error: `Invalid severity. Must be one of: ${VALID_SEVERITIES.join(', ')}` });
    }

    const result = await this.service.list(
      {
        status: status as Status | undefined,
        severity: severity as Severity | undefined,
        assignee: assignee as string | undefined,
      },
      {
        limit: limit !== undefined ? Number(limit) : undefined,
        offset: offset !== undefined ? Number(offset) : undefined,
      },
    );

    res.json(result);
  };
}
