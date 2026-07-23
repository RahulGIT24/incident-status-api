import express, { Express } from 'express';
import { incidentsRoutes } from './incidents/incidents.routes';
import { IncidentsRepository } from './incidents/incidents.types';

export function createApp(repository: IncidentsRepository): Express {
  const app = express();
  app.use(express.json());
  app.use(incidentsRoutes(repository));
  return app;
}
