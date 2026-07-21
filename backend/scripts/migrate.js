import fs from 'node:fs/promises';
import { realpathSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pool from '../db.js';

const directory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../migrations');

export async function main(env = process.env, database = pool) {
  if (env.ALLOW_SCHEMA_MIGRATION !== '1' && env.ALLOW_SCHEMA_MUTATION !== 'yes') {
    throw new Error('Set ALLOW_SCHEMA_MIGRATION=1 after reviewing the target database');
  }
  const files = (await fs.readdir(directory)).filter((name) => name.endsWith('.sql')).sort();
  const client = await database.connect();
  try {
    for (const name of files) {
      await client.query('BEGIN');
      try {
        const sql = (await fs.readFile(path.join(directory, name), 'utf8')).trim()
          .replace(/^BEGIN;\s*/, '')
          .replace(/\s*COMMIT;\s*$/, '');
        await client.query(sql);
        await client.query('COMMIT');
        console.log(`Applied ${name}`);
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      }
    }
  } finally {
    client.release();
  }
}

if (process.argv[1] && realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  }).finally(() => pool.end());
}
