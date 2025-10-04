const { Pool } = require("pg")
require("dotenv").config()
/* ***************
 * Connection Pool
 * SSL Object needed for local testing of app
 * But will cause problems in production environment
 * If - else will make determination which to use
 * *************** */
let pool
const connStr = process.env.DATABASE_URL
// Decide SSL: allow explicit override via DB_SSL env ('true'/'false')
let sslConfig
if (typeof process.env.DB_SSL === 'string') {
  const wantSSL = process.env.DB_SSL.toLowerCase() === 'true'
  sslConfig = wantSSL ? { rejectUnauthorized: false } : undefined
} else {
  // Fallback heuristic: enable SSL automatically for non-local hosts
  const isLocal = connStr && (connStr.includes('localhost') || connStr.includes('127.0.0.1'))
  sslConfig = isLocal ? undefined : { rejectUnauthorized: false }
}

pool = new Pool({
    connectionString: connStr,
    ssl: sslConfig,
})

// Added for troubleshooting queries during development
if (process.env.NODE_ENV === 'development') {
  try {
    const url = new URL(connStr)
    console.log('[DB] host:', url.hostname, 'ssl:', !!sslConfig)
  } catch {}
  module.exports = {
    async query(text, params) {
      try {
        const res = await pool.query(text, params)
        console.log("executed query", { text })
        return res
      } catch (error) {
        console.error("error in query", { text })
        throw error
      }
    },
  }
} else {
  module.exports = pool
}