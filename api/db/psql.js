const { Pool } = require('pg');

const pool = new Pool({
    user: 'super',
    host: 'localhost',
    database: 'dnif',
    password: '1234',
    port: 5432,
  })
  
module.exports = {
  query: (text, params, callback) => {
    return pool.query(text, params, callback)
  },
}