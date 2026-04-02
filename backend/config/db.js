const { Pool } = require('pg');

const pool = new Pool({
  user: 'vaishnavidevi',
  host: '127.0.0.1',
  database: 'subtrack',
  port: 5432,
});

module.exports = pool;