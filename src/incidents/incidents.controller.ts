import { Request, Response } from 'express';
import { IncidentsService } from './incidents.service';
import { Severity, Status } from './incidents.types';
import { UUID } from 'crypto';

const VALID_STATUSES: Status[] = ['open', 'acknowledged', 'resolved'];
const VALID_SEVERITIES: Severity[] = ['low', 'medium', 'high', 'critical'];

export class IncidentsController {
  constructor(private readonly service: IncidentsService) { }

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

  status = async (req: Request, res: Response) => {
    const { id } = req.params;
    const {status} = req.body;

    const existingTask = await this.service.findById(id as UUID)
    if (!existingTask || !existingTask.data) {
      return res.status(404).json({ message: "Task not found" })
    }

    const existingStatus = existingTask.data.status;
    if(!VALID_STATUSES.find((s)=>s==status)) return res.status(400).json({message:"Invalid Status Provided"})

    if(existingStatus=='open'){
      if(status!='acknowledged') {
        return res.status(400).json({message:"Invalid Status Update"})
      }else{
        const data = this.service.updateStatus(id as UUID,status)
        res.json(data)
      }
    }
    if(existingStatus=='acknowledged'){
      if(status!='resolved') {
        return res.status(400).json({message:"Invalid Status Update"})
      }else{
        const data = this.service.updateStatus(id as UUID,status)
        res.json(data)
      }
    }
    if(existingStatus=='resolved') res.status(200).json({message:"Already Resolved"})
  }
}
