import 'dotenv/config'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import type { QueryResultRow } from './db.js'
import { pool } from './db.js'

try {
  const schemaPath = fileURLToPath(new URL('../sql/schema.sql', import.meta.url))
  const schema = await readFile(schemaPath, 'utf8')
  for (const statement of schema.split(';').map((part) => part.trim()).filter(Boolean)) {
    await pool.query<QueryResultRow>(statement)
  }
  console.log('Database schema is up to date.')
} catch (error) {
  console.error('Database migration failed:', error)
  process.exitCode = 1
} finally {
  await pool.end()
}
