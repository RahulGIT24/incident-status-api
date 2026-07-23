import { Router } from 'express';
import { IncidentsController } from './incidents.controller';
import { IncidentsService } from './incidents.service';
import { IncidentsRepository } from './incidents.types';

export function incidentsRoutes(repository: IncidentsRepository): Router {
  const router = Router();
  const controller = new IncidentsController(new IncidentsService(repository));

  router.get('/incidents', controller.list);

  return router;
}
