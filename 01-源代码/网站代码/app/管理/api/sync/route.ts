import { NextRequest, NextResponse } from 'next/server'
import * as fs from 'fs'
import * as path from 'path'
import { promisify } from 'util'

const mkdir = promisify(fs.mkdir)
const copyFile = promisify(fs.copyFile)
const stat = promisify(fs.stat)

// 确保目录存在的辅助函数
async function ensureDir(dirPath: string): Promise<void> {
  try {
    await mkdir(dirPath, { recursive: true })
  } catch (error) {
    // 如果目录已存在，忽略错误
    if ((error as NodeJS.ErrnoException).code !== 'EEXIST') {
      throw error
    }
  }
}

interface TableRow {
  filePath: string
  date: string
  title?: string
  tags?: string[]
  score?: number
  summary?: string
  source?: string
  selected?: boolean
  [key: string]: unknown
}

interface SyncConfig {
  obsidianPath: string
  projectContentPath: string
  syncOptions?: {
    preserveStructure?: boolean
    syncAttachments?: boolean
    incrementalSync?: boolean
  }
}

interface SyncStats {
  totalFiles: number
  syncedFiles: number
  skippedFiles: number
  errors: string[]
}

function getSourceFilePath(filePath: string, obsidianPath: string): string {
  if (path.isAbsolute(filePath)) {
    return filePath
  }
  return path.join(obsidianPath, filePath)
}

function getTargetFilePath(
  filePath: string,
  projectContentPath: string,
  preserveStructure: boolean
): string {
  if (preserveStructure) {
    return path.join(projectContentPath, filePath)
  } else {
    const fileName = path.basename(filePath)
    return path.join(projectContentPath, fileName)
  }
}

async function syncFiles(
  rows: TableRow[],
  config: SyncConfig
): Promise<SyncStats> {
  const stats: SyncStats = {
    totalFiles: rows.length,
    syncedFiles: 0,
    skippedFiles: 0,
    errors: [],
  }

  const syncOptions = config.syncOptions || {}
  const preserveStructure = syncOptions.preserveStructure !== false
  // const syncAttachments = syncOptions.syncAttachments !== false // 暂时未使用
  const incrementalSync = syncOptions.incrementalSync !== false

  // 确保目标目录存在
  await ensureDir(config.projectContentPath)

  for (const row of rows) {
    try {
      const sourcePath = getSourceFilePath(row.filePath, config.obsidianPath)

      if (!fs.existsSync(sourcePath)) {
        stats.skippedFiles++
        stats.errors.push(`文件不存在: ${sourcePath}`)
        continue
      }

      const targetPath = getTargetFilePath(
        row.filePath,
        config.projectContentPath,
        preserveStructure
      )

      // 增量同步检查
      if (incrementalSync && fs.existsSync(targetPath)) {
        const sourceStat = await stat(sourcePath)
        const targetStat = await stat(targetPath)

        if (sourceStat.mtime <= targetStat.mtime) {
          stats.skippedFiles++
          continue
        }
      }

      // 确保目标目录存在
      await ensureDir(path.dirname(targetPath))

      // 复制文件
      await copyFile(sourcePath, targetPath)
      stats.syncedFiles++
    } catch (error) {
      stats.skippedFiles++
      const errorMessage =
        error instanceof Error ? error.message : String(error)
      stats.errors.push(`同步失败 ${row.filePath}: ${errorMessage}`)
    }
  }

  return stats
}

export async function POST(request: NextRequest) {
  try {
    const { selectedRows, config } = await request.json()

    if (!selectedRows || !Array.isArray(selectedRows)) {
      return NextResponse.json(
        { success: false, error: '缺少必需参数：selectedRows' },
        { status: 400 }
      )
    }

    if (!config || !config.obsidianPath || !config.projectContentPath) {
      return NextResponse.json(
        { success: false, error: '缺少必需配置：obsidianPath 或 projectContentPath' },
        { status: 400 }
      )
    }

    // 解析项目内容路径为绝对路径
    // Next.js 的 process.cwd() 指向项目根目录（网站代码目录）
    const projectRoot = process.cwd()
    const projectContentPath = path.isAbsolute(config.projectContentPath)
      ? config.projectContentPath
      : path.resolve(projectRoot, config.projectContentPath.replace(/^\.\//, ''))

    const syncConfig: SyncConfig = {
      ...config,
      projectContentPath,
    }

    const stats = await syncFiles(selectedRows, syncConfig)

    return NextResponse.json({
      success: true,
      stats,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 }
    )
  }
}

