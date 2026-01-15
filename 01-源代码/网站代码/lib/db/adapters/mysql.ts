/**
 * MySQL 数据库适配器
 * 支持 PlanetScale
 */

import { DatabaseAdapter } from '../index'

export async function createMysqlAdapter(databaseUrl: string): Promise<DatabaseAdapter> {
  // 动态导入 mysql2
  try {
    const mysql = await import('mysql2/promise')
    const connection = await mysql.createConnection(databaseUrl)

    return {
      async query<T = unknown>(queryText: string, params?: unknown[]): Promise<T[]> {
        const [rows] = await connection.execute(queryText, params || [])
        return rows as T[]
      },
      async execute(queryText: string, params?: unknown[]): Promise<void> {
        await connection.execute(queryText, params || [])
      },
    }
  } catch (error) {
    throw new Error(`Failed to initialize MySQL adapter: ${error}`)
  }
}
