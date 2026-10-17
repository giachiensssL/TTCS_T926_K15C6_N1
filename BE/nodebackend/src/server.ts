import 'dotenv/config'
import { app } from './app.js'
import { pool } from './db.js'

const port = Number(process.env.PORT ?? 8080)

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('PORT must be a valid port number.')
}

const server = app.listen(port, () => {
  console.log(`TMS Node backend listening on http://localhost:${port}`)
})

async function shutdown(signal: string): Promise<void> {
  console.log(`${signal} received; shutting down backend.`)
  server.close(async (error) => {
    if (error) {
      console.error('HTTP server shutdown failed:', error)
      process.exitCode = 1
    }
    await pool.end()
  })
}

process.on('SIGINT', () => void shutdown('SIGINT'))
process.on('SIGTERM', () => void shutdown('SIGTERM'))
