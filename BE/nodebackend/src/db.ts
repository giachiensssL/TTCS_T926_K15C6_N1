import 'dotenv/config'
import { mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { DatabaseSync, type SQLInputValue, type SQLOutputValue } from 'node:sqlite'

export type QueryResultRow = Record<string, SQLOutputValue>

export type QueryResult<Row extends QueryResultRow = QueryResultRow> = {
  rows: Row[]
  rowCount: number
}

export type DatabaseClient = {
  query<Row extends QueryResultRow = QueryResultRow>(
    sql: string,
    values?: SQLInputValue[],
  ): Promise<QueryResult<Row>>
  release(): void
}

const databasePath = resolve(process.env.DATABASE_PATH ?? './data/tms.sqlite')
mkdirSync(dirname(databasePath), { recursive: true })

const database = new DatabaseSync(databasePath, {
  enableForeignKeyConstraints: true,
  timeout: 5000,
})

database.exec('PRAGMA journal_mode = WAL; PRAGMA busy_timeout = 5000;')

let queue: Promise<void> = Promise.resolve()

async function acquire(): Promise<() => void> {
  let unlock!: () => void
  const previous = queue
  queue = new Promise<void>((resolveQueue) => {
    unlock = resolveQueue
  })
  await previous
  return unlock
}

function execute<Row extends QueryResultRow>(
  sql: string,
  values: SQLInputValue[] = [],
): QueryResult<Row> {
  const orderedValues: SQLInputValue[] = []
  const sqliteSql = sql
    .replace(/\bILIKE\b/gi, 'LIKE')
    .replace(/COUNT\(\*\)::text/gi, 'CAST(COUNT(*) AS TEXT)')
    .replace(/NULL::text/gi, 'NULL')
    .replace(/\s+FOR UPDATE\b/gi, '')
    .replace(/\$(\d+)/g, (_placeholder, index: string) => {
      const value = values[Number(index) - 1]
      if (value === undefined) {
        throw new Error(`Missing SQL parameter $${index}.`)
      }
      orderedValues.push(value)
      return '?'
    })

  const statement = database.prepare(sqliteSql)
  if (/^\s*(SELECT|PRAGMA|EXPLAIN)\b/i.test(sqliteSql)) {
    const rows = statement.all(...orderedValues) as Row[]
    return { rows, rowCount: rows.length }
  }
  const rows = statement.all(...orderedValues) as Row[]
  const changes = database.prepare('SELECT changes() AS count').get() as { count: number }
  return { rows, rowCount: changes.count }
}

export const pool = {
  async query<Row extends QueryResultRow = QueryResultRow>(
    sql: string,
    values: SQLInputValue[] = [],
  ): Promise<QueryResult<Row>> {
    const unlock = await acquire()
    try {
      return execute<Row>(sql, values)
    } finally {
      unlock()
    }
  },

  async connect(): Promise<DatabaseClient> {
    const unlock = await acquire()
    let released = false
    return {
      query: async <Row extends QueryResultRow = QueryResultRow>(
        sql: string,
        values: SQLInputValue[] = [],
      ) => execute<Row>(sql, values),
      release: () => {
        if (released) return
        released = true
        unlock()
      },
    }
  },

  async end(): Promise<void> {
    await database.close()
  },
}
