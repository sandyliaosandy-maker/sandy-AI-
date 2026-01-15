/**
 * PostgreSQL 数据库适配器
 * 支持 Vercel Postgres 和 Supabase
 */

import { DatabaseAdapter } from '../index'

export async function createPostgresAdapter(databaseUrl: string): Promise<DatabaseAdapter> {
  // 动态导入 @vercel/postgres 或 pg
  let pool: any

  try {
    // 尝试使用 @vercel/postgres (Vercel Postgres)
    const { sql } = await import('@vercel/postgres')
    return {
      async query<T = unknown>(queryText: string, params?: unknown[]): Promise<T[]> {
        const result = await sql.query(queryText, params)
        return result.rows as T[]
      },
      async execute(queryText: string, params?: unknown[]): Promise<void> {
        await sql.query(queryText, params)
      },
    }
  } catch {
    // 如果 @vercel/postgres 不可用，尝试使用 pg
    try {
      const { Pool } = await import('pg')
      pool = new Pool({ connectionString: databaseUrl })
      return {
        async query<T = unknown>(queryText: string, params?: unknown[]): Promise<T[]> {
          const result = await pool.query(queryText, params)
          return result.rows as T[]
        },
        async execute(queryText: string, params?: unknown[]): Promise<void> {
          await pool.query(queryText, params)
        },
      }
    } catch (error) {
      throw new Error(`Failed to initialize PostgreSQL adapter: ${error}`)
    }
  }
}
