import { createApp } from './app';
import { db } from './db';
import { SqliteIncidentsRepository } from './incidents/incidents.repository';

const app = createApp(new SqliteIncidentsRepository(db));
const port = process.env.PORT ?? 3000;

app.listen(port, () => {
  console.log(`Incident Status API listening on port ${port}`);
});
