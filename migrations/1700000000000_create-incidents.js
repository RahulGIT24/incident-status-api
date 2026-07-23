/* eslint-disable camelcase */

exports.up = (pgm) => {
  pgm.createExtension('pgcrypto', { ifNotExists: true });

  pgm.createType('incident_severity', ['low', 'medium', 'high', 'critical']);
  pgm.createType('incident_status', ['open', 'acknowledged', 'resolved']);

  pgm.createTable('incidents', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    title: { type: 'text', notNull: true },
    severity: { type: 'incident_severity', notNull: true },
    status: { type: 'incident_status', notNull: true, default: 'open' },
    assignee: { type: 'text' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    resolved_at: { type: 'timestamptz' },
    version: { type: 'integer', notNull: true, default: 1 },
  });

  pgm.createIndex('incidents', 'status');
  pgm.createIndex('incidents', 'severity');
  pgm.createIndex('incidents', 'assignee');
};

exports.down = (pgm) => {
  pgm.dropTable('incidents');
  pgm.dropType('incident_status');
  pgm.dropType('incident_severity');
};
