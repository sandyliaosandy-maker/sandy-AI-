import * as fs from 'fs-extra'
import * as path from 'path'
import type { TableRow } from './table-parser'
import type { AppConfig } from './config'

/**
 * 同步统计信息
 */
export interface SyncStats {
  totalFiles: number
  syncedFiles: number
  skippedFiles: number
  errors: string[]
}

/**
 * 同步文件到项目目录
 * @param rows 要同步的文件列表
 * @param config 配置对象
 * @returns 同步统计信息
 */
export async function syncFiles(rows: TableRow[], config: AppConfig): Promise<SyncStats> {
  const stats: SyncStats = {
    totalFiles: rows.length,
    syncedFiles: 0,
    skippedFiles: 0,
    errors: [],
  }

  const syncOptions = config.syncOptions || {}
  const preserveStructure = syncOptions.preserveStructure !== false
  const syncAttachments = syncOptions.syncAttachments !== false
  const incrementalSync = syncOptions.incrementalSync !== false

  // 确保目标目录存在
  await fs.ensureDir(config.projectContentPath)

  for (const row of rows) {
    try {
      // 获取源文件路径
      const sourcePath = getSourceFilePath(row.filePath, config.obsidianPath)
      
      if (!fs.existsSync(sourcePath)) {
        stats.skippedFiles++
        stats.errors.push(`文件不存在: ${sourcePath}`)
        continue
      }

      // 确定目标路径
      const targetPath = getTargetFilePath(row.filePath, config.projectContentPath, preserveStructure)

      // 增量同步：检查文件是否需要更新
      if (incrementalSync && fs.existsSync(targetPath)) {
        const sourceStat = fs.statSync(sourcePath)
        const targetStat = fs.statSync(targetPath)
        
        // 如果源文件没有更新，跳过
        if (sourceStat.mtime <= targetStat.mtime) {
          stats.skippedFiles++
          continue
        }
      }

      // 确保目标目录存在
      await fs.ensureDir(path.dirname(targetPath))

      // 复制文件
      await fs.copy(sourcePath, targetPath, { overwrite: true })
      stats.syncedFiles++

      // 同步附件（如果启用）
      if (syncAttachments && row.filePath.endsWith('.md')) {
        await syncAttachmentsForFile(sourcePath, config)
      }
    } catch (error) {
      stats.skippedFiles++
      const errorMessage = error instanceof Error ? error.message : String(error)
      stats.errors.push(`同步失败 ${row.filePath}: ${errorMessage}`)
    }
  }

  return stats
}

/**
 * 获取源文件的完整路径
 */
function getSourceFilePath(filePath: string, obsidianPath: string): string {
  // 如果已经是绝对路径，直接返回
  if (path.isAbsolute(filePath)) {
    return filePath
  }

  // 如果是相对路径，相对于 Obsidian 知识库路径
  return path.join(obsidianPath, filePath)
}

/**
 * 获取目标文件的完整路径
 */
function getTargetFilePath(
  filePath: string,
  projectContentPath: string,
  preserveStructure: boolean
): string {
  if (preserveStructure) {
    // 保持目录结构
    // 例如：公开内容/新闻/文章.md -> 项目内容/公开内容/新闻/文章.md
    return path.join(projectContentPath, filePath)
  } else {
    // 只保留文件名
    const fileName = path.basename(filePath)
    return path.join(projectContentPath, fileName)
  }
}

/**
 * 同步文件的附件
 */
async function syncAttachmentsForFile(filePath: string, config: AppConfig): Promise<void> {
  // 读取文件内容，查找图片引用
  const content = await fs.readFile(filePath, 'utf-8')
  
  // 匹配 Markdown 图片语法：![alt](path)
  const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g
  const matches = Array.from(content.matchAll(imageRegex))

  for (const match of matches) {
    const imagePath = match[2]
    
    // 跳过网络图片
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      continue
    }

    try {
      // 获取图片的源路径和目标路径
      const sourceImagePath = getSourceFilePath(imagePath, config.obsidianPath)
      const targetImagePath = getTargetFilePath(imagePath, config.projectContentPath, true)

      if (fs.existsSync(sourceImagePath)) {
        await fs.ensureDir(path.dirname(targetImagePath))
        await fs.copy(sourceImagePath, targetImagePath, { overwrite: true })
      }
    } catch (error) {
      // 附件同步失败不影响主流程，只记录错误
      console.warn(`附件同步失败 ${imagePath}:`, error)
    }
  }
}

