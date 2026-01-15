/**
 * 数据库连接和工具函数
 * 
 * 支持多种数据库：
 * - Vercel Postgres
 * - Supabase
 * - PlanetScale (MySQL)
 */

// 根据环境变量选择数据库适配器
// 这里先提供基础结构，具体实现需要根据选择的数据库服务

export interface DatabaseAdapter {
  query<T = unknown>(sql: string, params?: unknown[]): Promise<T[]>
  execute(sql: string, params?: unknown[]): Promise<void>
}

/**
 * 获取数据库连接
 * 根据 DATABASE_URL 环境变量自动选择适配器
 */
export async function getDatabase(): Promise<DatabaseAdapter> {
  const databaseUrl = process.env.DATABASE_URL

  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is not set')
  }

  // 根据 URL 协议判断数据库类型
  if (databaseUrl.startsWith('postgres://') || databaseUrl.startsWith('postgresql://')) {
    // PostgreSQL (Vercel Postgres, Supabase)
    return await import('./adapters/postgres').then((m) => m.createPostgresAdapter(databaseUrl))
  } else if (databaseUrl.startsWith('mysql://')) {
    // MySQL (PlanetScale)
    return await import('./adapters/mysql').then((m) => m.createMysqlAdapter(databaseUrl))
  } else {
    throw new Error(`Unsupported database URL: ${databaseUrl}`)
  }
}

/**
 * 执行数据库迁移
 */
export async function runMigrations(): Promise<void> {
  const db = await getDatabase()
  const fs = await import('fs/promises')
  const path = await import('path')

  const migrationsDir = path.join(process.cwd(), 'lib', 'db', 'migrations')
  const files = (await fs.readdir(migrationsDir)).filter((f) => f.endsWith('.sql')).sort()

  for (const file of files) {
    const sql = await fs.readFile(path.join(migrationsDir, file), 'utf-8')
    await db.execute(sql)
    console.log(`✓ Migrated: ${file}`)
  }
}
