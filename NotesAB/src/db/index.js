const { Pool } = require('pg');
const pool = new Pool({
  host: process.env.DB_HOST || 'postgres',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'notes',
  password: process.env.DB_PASSWORD || 'notespass',
  database: process.env.DB_NAME || 'notesdb',
});
module.exports = pool;
