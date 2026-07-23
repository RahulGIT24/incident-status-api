import { createApp } from './app';
import { pool } from './db';
import { PgIncidentsRepository } from './incidents/incidents.repository';

const app = createApp(new PgIncidentsRepository(pool));
const port = process.env.PORT ?? 3000;

app.listen(port, () => {
  console.log(`Incident Status API listening on port ${port}`);
});
