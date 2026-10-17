import bcrypt from 'bcryptjs'
import cors from 'cors'
import express, { type ErrorRequestHandler } from 'express'
import { randomBytes } from 'node:crypto'
import type { DatabaseClient, QueryResultRow } from './db.js'
import type { SQLInputValue } from 'node:sqlite'
import { pool } from './db.js'
import { sendActivationEmail } from './mailer.js'

const leadStatuses = ['NEW', 'CONTACTING', 'QUALIFIED', 'CLOSED_WON', 'CLOSED_LOST'] as const
type LeadStatus = (typeof leadStatuses)[number] | 'ENROLLED'

type LeadRow = QueryResultRow & {
  id: string
  full_name: string
  email: string
  phone: string | null
  course_interest: string | null
  source: string | null
  notes: string | null
  status: LeadStatus
  created_at: string | Date
  student_code: string | null
}

type LeadInput = {
  fullName: string
  email: string
  phone: string | null
  courseInterest: string | null
  source: string | null
  notes: string | null
  status?: LeadStatus
}

class HttpError extends Error {
  constructor(readonly status: number, message: string) {
    super(message)
  }
}

export const app = express()

app.use(cors({
  origin: process.env.FRONTEND_ORIGIN?.split(',').map((origin) => origin.trim()).filter(Boolean)
    ?? ['http://localhost:5173', 'http://127.0.0.1:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}))
app.use(express.json({ limit: '32kb' }))

app.get('/api/health', async (_request, response, next) => {
  try {
    await pool.query('SELECT 1')
    response.json({ status: 'ok', database: 'connected' })
  } catch (error) {
    next(error)
  }
})

app.get('/api/leads', async (request, response, next) => {
  try {
    const page = parsePage(request.query.page)
    const search = queryText(request.query.search)
    const status = queryStatus(request.query.status)
    const filters: string[] = []
    const values: SQLInputValue[] = []

    if (status) {
      values.push(status)
      filters.push(`l.status = $${values.length}`)
    }
    if (search) {
      values.push(`%${search}%`)
      filters.push(`(l.full_name ILIKE $${values.length} OR l.email ILIKE $${values.length} OR COALESCE(l.phone, '') ILIKE $${values.length})`)
    }

    const where = filters.length ? `WHERE ${filters.join(' AND ')}` : ''
    const count = await pool.query<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM leads l ${where}`,
      values,
    )
    values.push(20, page * 20)
    const result = await pool.query<LeadRow>(
      `SELECT l.*, s.student_code
       FROM leads l LEFT JOIN students s ON s.lead_id = l.id
       ${where} ORDER BY l.created_at DESC, l.id DESC
       LIMIT $${values.length - 1} OFFSET $${values.length}`,
      values,
    )
    const totalElements = Number(count.rows[0]?.count ?? 0)
    response.json({
      content: result.rows.map(toLead),
      totalElements,
      totalPages: Math.ceil(totalElements / 20),
      number: page,
      size: 20,
    })
  } catch (error) {
    next(error)
  }
})

app.get('/api/leads/:id', async (request, response, next) => {
  try {
    const lead = await findLead(request.params.id)
    response.json(toLead(lead))
  } catch (error) {
    next(error)
  }
})

app.post('/api/leads', async (request, response, next) => {
  try {
    const input = parseLead(request.body)
    if (input.status === 'ENROLLED') {
      throw new HttpError(400, 'Use the enrollment action to enroll a lead.')
    }
    const result = await pool.query<LeadRow>(
      `INSERT INTO leads (full_name, email, phone, course_interest, source, notes, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *, NULL::text AS student_code`,
      [input.fullName, input.email, input.phone, input.courseInterest, input.source, input.notes, input.status ?? 'NEW'],
    )
    response.status(201).json(toLead(result.rows[0]!))
  } catch (error) {
    next(error)
  }
})

app.put('/api/leads/:id', async (request, response, next) => {
  try {
    const input = parseLead(request.body)
    if (input.status === 'ENROLLED') {
      throw new HttpError(400, 'Use the enrollment action to enroll a lead.')
    }
    const result = await pool.query<LeadRow>(
      `UPDATE leads
       SET full_name = $1, email = $2, phone = $3, course_interest = $4, source = $5, notes = $6,
           status = COALESCE($7, status)
       WHERE id = $8 AND status <> 'ENROLLED'
       RETURNING *, NULL::text AS student_code`,
      [input.fullName, input.email, input.phone, input.courseInterest, input.source, input.notes, input.status ?? null, parseId(request.params.id)],
    )
    if (!result.rowCount) {
      const exists = await pool.query('SELECT 1 FROM leads WHERE id = $1', [parseId(request.params.id)])
      if (exists.rowCount) throw new HttpError(409, 'Enrolled leads cannot be edited.')
      throw new HttpError(404, 'Lead not found.')
    }
    response.json(toLead(result.rows[0]!))
  } catch (error) {
    next(error)
  }
})

app.post('/api/leads/:id/enroll', async (request, response, next) => {
  let client: DatabaseClient | undefined
  let temporaryPassword: string | undefined
  let saved: { leadId: string; studentCode: string; username: string; email: string } | undefined

  try {
    const leadId = parseId(request.params.id)
    client = await pool.connect()
    await client.query('BEGIN')
    const leadResult = await client.query<LeadRow>(
      'SELECT *, NULL::text AS student_code FROM leads WHERE id = $1 FOR UPDATE',
      [leadId],
    )
    const lead = leadResult.rows[0]
    if (!lead) throw new HttpError(404, 'Lead not found.')
    if (lead.status === 'ENROLLED') throw new HttpError(409, 'This lead is already enrolled.')
    if (lead.status !== 'CLOSED_WON') throw new HttpError(409, 'Only a closed-won lead can be enrolled.')

    const existingEmail = await client.query('SELECT 1 FROM accounts WHERE LOWER(email) = LOWER($1)', [lead.email])
    if (existingEmail.rowCount) throw new HttpError(409, 'This email is already used by another account.')

    const username = await createUsername(client, lead.email)
    temporaryPassword = randomBytes(18).toString('base64url')
    const passwordHash = await bcrypt.hash(temporaryPassword, 12)
    const account = await client.query<{ id: string }>(
      `INSERT INTO accounts (username, email, password, full_name, role, status)
       VALUES ($1, $2, $3, $4, 'STUDENT', 'ACTIVE') RETURNING id`,
      [username, lead.email, passwordHash, lead.full_name],
    )
    const studentCode = `HV-${new Date().getFullYear()}-${randomBytes(5).toString('hex').toUpperCase()}`
    await client.query(
      'INSERT INTO students (student_code, account_id, lead_id) VALUES ($1, $2, $3)',
      [studentCode, account.rows[0]!.id, lead.id],
    )

    try {
      await sendActivationEmail(lead.email, username, temporaryPassword)
    } catch (error) {
      throw new HttpError(503, error instanceof Error ? `Enrollment email could not be sent: ${error.message}` : 'Enrollment email could not be sent.')
    }

    await client.query("UPDATE leads SET status = 'ENROLLED' WHERE id = $1", [lead.id])
    await client.query('COMMIT')
    saved = { leadId: lead.id, studentCode, username, email: lead.email }
    response.status(201).json({
      leadId: Number(saved.leadId),
      studentCode: saved.studentCode,
      username: saved.username,
      email: saved.email,
      message: process.env.MAIL_MODE === 'smtp'
        ? 'Đã tạo hồ sơ học viên và gửi email kích hoạt.'
        : 'Đã tạo hồ sơ học viên; email kích hoạt được lưu trong hộp thư thử nghiệm trên máy.',
    })
  } catch (error) {
    if (client) await client.query('ROLLBACK').catch((rollbackError: unknown) => {
      console.error('Enrollment rollback failed:', rollbackError)
    })
    next(error)
  } finally {
    client?.release()
  }
})

app.get('/api/accounts', async (request, response, next) => {
  try {
    const page = parsePage(request.query.page)
    const username = queryText(request.query.username)
    const role = queryText(request.query.role)
    const status = queryText(request.query.status)
    const filters: string[] = []
    const values: SQLInputValue[] = []
    for (const [column, value] of [['username', username], ['role', role], ['status', status]] as const) {
      if (value) {
        values.push(`%${value}%`)
        filters.push(`${column} ILIKE $${values.length}`)
      }
    }
    const where = filters.length ? `WHERE ${filters.join(' AND ')}` : ''
    const count = await pool.query<{ count: string }>(`SELECT COUNT(*)::text AS count FROM accounts ${where}`, values)
    values.push(20, page * 20)
    const result = await pool.query(
      `SELECT id, username, email, full_name AS "fullName", role, status
       FROM accounts ${where} ORDER BY id DESC LIMIT $${values.length - 1} OFFSET $${values.length}`,
      values,
    )
    const totalElements = Number(count.rows[0]?.count ?? 0)
    response.json({ content: result.rows, totalElements, totalPages: Math.ceil(totalElements / 20), number: page, size: 20 })
  } catch (error) {
    next(error)
  }
})

app.get('/api/accounts/:id', async (request, response, next) => {
  try {
    const result = await pool.query(
      'SELECT id, username, email, full_name AS "fullName", role, status FROM accounts WHERE id = $1',
      [parseId(request.params.id)],
    )
    if (!result.rowCount) throw new HttpError(404, 'Account not found.')
    response.json(result.rows[0])
  } catch (error) {
    next(error)
  }
})

app.post('/api/accounts', async (request, response, next) => {
  let client: DatabaseClient | undefined
  try {
    const input = parseAccount(request.body)
    const temporaryPassword = randomBytes(18).toString('base64url')
    const hash = await bcrypt.hash(temporaryPassword, 12)
    client = await pool.connect()
    await client.query('BEGIN')
    const result = await client.query(
      `INSERT INTO accounts (username, email, password, full_name, role, status)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, username, email, full_name AS "fullName", role, status`,
      [input.username, input.email, hash, input.fullName, input.role, input.status],
    )
    await sendActivationEmail(input.email, input.username, temporaryPassword)
    await client.query('COMMIT')
    response.status(201).json(result.rows[0])
  } catch (error) {
    if (client) await client.query('ROLLBACK').catch((rollbackError: unknown) => {
      console.error('Account creation rollback failed:', rollbackError)
    })
    next(error)
  } finally {
    client?.release()
  }
})

app.put('/api/accounts/:id', async (request, response, next) => {
  try {
    const id = parseId(request.params.id)
    const input = parseAccount(request.body)
    const result = await pool.query(
      `UPDATE accounts SET username = $1, email = $2, full_name = $3, role = $4, status = $5
       WHERE id = $6
       RETURNING id, username, email, full_name AS "fullName", role, status`,
      [input.username, input.email, input.fullName, input.role, input.status, id],
    )
    if (!result.rowCount) throw new HttpError(404, 'Account not found.')
    response.json(result.rows[0])
  } catch (error) {
    next(error)
  }
})

app.delete('/api/accounts/:id', async (request, response, next) => {
  try {
    const result = await pool.query('DELETE FROM accounts WHERE id = $1', [parseId(request.params.id)])
    if (!result.rowCount) throw new HttpError(404, 'Account not found.')
    response.status(204).end()
  } catch (error) {
    next(error)
  }
})

const errorHandler: ErrorRequestHandler = (error: unknown, _request, response, _next) => {
  if (error instanceof HttpError) {
    response.status(error.status).json({ message: error.message })
    return
  }
  if (isSqliteUniqueError(error)) {
    response.status(409).json({ message: 'Username, email, or student code already exists.' })
    return
  }
  if (error instanceof SyntaxError) {
    response.status(400).json({ message: 'Invalid JSON request body.' })
    return
  }
  console.error('Unhandled API error:', error)
  response.status(500).json({ message: 'An unexpected server error occurred.' })
}
app.use(errorHandler)

function isSqliteUniqueError(error: unknown): boolean {
  return typeof error === 'object'
    && error !== null
    && 'code' in error
    && error.code === 'ERR_SQLITE_ERROR'
    && 'errcode' in error
    && typeof error.errcode === 'number'
    && (error.errcode & 0xff) === 19
}

function parsePage(value: unknown): number {
  const page = Number(value ?? 0)
  if (!Number.isSafeInteger(page) || page < 0) throw new HttpError(400, 'Invalid page number.')
  return page
}

function parseId(value: string): string {
  if (!/^[1-9]\d*$/.test(value)) throw new HttpError(400, 'Invalid ID.')
  return value
}

function queryText(value: unknown): string {
  return typeof value === 'string' ? value.trim().slice(0, 160) : ''
}

function queryStatus(value: unknown): LeadStatus | undefined {
  if (value === undefined || value === '') return undefined
  if (typeof value === 'string' && [...leadStatuses, 'ENROLLED'].includes(value as LeadStatus)) {
    return value as LeadStatus
  }
  throw new HttpError(400, 'Invalid lead status.')
}

function optionalText(value: unknown, field: string, maximum: number): string | null {
  if (value === undefined || value === null || value === '') return null
  if (typeof value !== 'string' || value.trim().length > maximum) {
    throw new HttpError(400, `${field} is invalid or too long.`)
  }
  return value.trim() || null
}

function parseLead(body: unknown): LeadInput {
  if (typeof body !== 'object' || body === null) throw new HttpError(400, 'Lead details are required.')
  const data = body as Record<string, unknown>
  const fullName = optionalText(data.fullName, 'Full name', 120)
  const email = optionalText(data.email, 'Email', 254)?.toLowerCase() ?? null
  if (!fullName || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new HttpError(400, 'A valid full name and email are required.')
  }
  const status = queryStatus(data.status)
  return {
    fullName,
    email,
    phone: optionalText(data.phone, 'Phone', 30),
    courseInterest: optionalText(data.courseInterest, 'Course interest', 160),
    source: optionalText(data.source, 'Source', 80),
    notes: optionalText(data.notes, 'Notes', 2000),
    status,
  }
}

function parseAccount(body: unknown): {
  username: string
  email: string
  fullName: string
  role: string
  status: string
} {
  if (typeof body !== 'object' || body === null) throw new HttpError(400, 'Account details are required.')
  const data = body as Record<string, unknown>
  const username = optionalText(data.username, 'Username', 120)
  const email = optionalText(data.email, 'Email', 254)?.toLowerCase() ?? null
  const fullName = optionalText(data.fullName, 'Full name', 160)
  const role = optionalText(data.role, 'Role', 40)
  const status = optionalText(data.status, 'Status', 40)
  if (!username || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !fullName || !role || !status) {
    throw new HttpError(400, 'Username, valid email, full name, role, and status are required.')
  }
  return { username, email, fullName, role, status }
}

function toLead(row: LeadRow) {
  return {
    id: Number(row.id),
    fullName: row.full_name,
    email: row.email,
    phone: row.phone,
    courseInterest: row.course_interest,
    source: row.source,
    notes: row.notes,
    status: row.status,
    createdAt: row.created_at,
    studentCode: row.student_code,
  }
}

async function findLead(id: string): Promise<LeadRow> {
  const result = await pool.query<LeadRow>(
    `SELECT l.*, s.student_code FROM leads l
     LEFT JOIN students s ON s.lead_id = l.id WHERE l.id = $1`,
    [parseId(id)],
  )
  if (!result.rows[0]) throw new HttpError(404, 'Lead not found.')
  return result.rows[0]
}

async function createUsername(client: DatabaseClient, email: string): Promise<string> {
  const base = (email.split('@')[0] ?? 'student').toLowerCase().replace(/[^a-z0-9._-]/g, '') || 'student'
  let username = base.slice(0, 110)
  let suffix = 1
  while ((await client.query('SELECT 1 FROM accounts WHERE LOWER(username) = LOWER($1)', [username])).rowCount) {
    username = `${base.slice(0, 110 - String(suffix).length)}${suffix++}`
  }
  return username
}
