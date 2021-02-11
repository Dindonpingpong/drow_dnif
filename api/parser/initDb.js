const { Client } = require('pg');
const lineReader = require('line-reader');

const client = new Client({
  user: 'super',
  host: 'localhost',
  database: 'dnif',
  password: '1234',
  port: 5432,
})

const main = async () => {
  const fs = require('fs');

  await client.connect();

  const data = fs.readFileSync('russian_nouns.txt', 'UTF-8');

  const lines = data.split(/\r?\n/);

  lines.forEach(async (line) => {
    try {
      const res = await client.query('INSERT INTO Words (noun) VALUES ($1) RETURNING id', [line]);
      console.log(res.rows[0], line);
    } catch (e) {
      console.log(e.message)
      process.exit();
    }
  });

  process.exit();
}

main();
