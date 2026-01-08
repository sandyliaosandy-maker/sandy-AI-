import { NextRequest, NextResponse } from 'next/server'
import * as fs from 'fs'
import * as path from 'path'
import { promisify } from 'util'

const mkdir = promisify(fs.mkdir)
// const copyFile = promisify(fs.copyFile) // 暂时未使用
// const stat = promisify(fs.stat) // 暂时未使用
// const readdir = promisify(fs.readdir) // 暂时未使用

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

// 暂时未使用的函数
// function getSourceFilePath(filePath: string, obsidianPath: string): string {
//   if (path.isAbsolute(filePath)) {
//     return filePath
//   }
//   return path.join(obsidianPath, filePath)
// }

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

// 生成 Markdown 文件内容
function generateMarkdownContent(row: TableRow): string {
  const frontmatter: string[] = []
  
  // 必需字段
  if (row.title) {
    const cleanTitle = row.title
      .replace(/"/g, '\\"')
      .replace(/\n/g, ' ')
      .trim()
    frontmatter.push(`title: "${cleanTitle}"`)
  }
  
  if (row.date) {
    // 处理日期格式，确保是 YYYY-MM-DD 格式
    // 提取日期部分（可能是 "2026-01-07 08:03" 格式）
    let dateStr = row.date.trim()
    // 如果包含空格，取第一部分
    if (dateStr.includes(' ')) {
      dateStr = dateStr.split(' ')[0]
    }
    // 验证日期格式（YYYY-MM-DD）
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      frontmatter.push(`date: ${dateStr}`) // Contentlayer 的 date 类型不需要引号
    } else {
      console.warn(`[生成内容] 日期格式不正确: ${row.date}，使用原始值`)
      frontmatter.push(`date: "${dateStr}"`)
    }
  }
  
  // 可选字段
  if (row.tags && row.tags.length > 0) {
    const tagsStr = row.tags
      .map(tag => tag.replace(/"/g, '\\"').trim())
      .filter(tag => tag.length > 0)
      .map(tag => `"${tag}"`)
      .join(', ')
    if (tagsStr) {
      frontmatter.push(`tags: [${tagsStr}]`)
    }
  }
  if (row.score !== undefined && row.score !== null) {
    frontmatter.push(`score: ${row.score}`)
  }
  if (row.summary) {
    const cleanSummary = row.summary
      .replace(/"/g, '\\"')
      .replace(/\n/g, ' ')
      .trim()
    frontmatter.push(`summary: "${cleanSummary}"`)
  }
  if (row.source) {
    const cleanSource = row.source
      .replace(/"/g, '\\"')
      .trim()
    frontmatter.push(`source: "${cleanSource}"`)
  }
  
  // 从 Obsidian 表格中提取的字段
  // 注意：这些字段可能在 row['中文标题'] 或 row.chineseTitle 中
  const chineseTitleValue = (row['中文标题'] || row.chineseTitle || '') as string
  const chineseTitle = String(chineseTitleValue)
    .replace(/"/g, '\\"')
    .replace(/\n/g, ' ')
    .replace(/<br\s*\/?>/gi, ' ')
    .trim()
  if (chineseTitle) {
    frontmatter.push(`chineseTitle: "${chineseTitle}"`)
  }
  
  const underwaterInfoValue = (row['水下信息'] || row.underwaterInfo || '') as string
  const underwaterInfo = String(underwaterInfoValue)
    .replace(/"/g, '\\"')
    .replace(/<br\s*\/?>/gi, '\n')
    .trim()
  if (underwaterInfo) {
    // 对于多行文本，使用 YAML 的多行字符串格式
    const escapedInfo = underwaterInfo.replace(/\n/g, '\\n')
    frontmatter.push(`underwaterInfo: "${escapedInfo}"`)
  }
  
  const caseExtractionValue = (row['案例提取'] || row.caseExtraction || '') as string
  const caseExtraction = String(caseExtractionValue)
    .replace(/"/g, '\\"')
    .replace(/<br\s*\/?>/gi, '\n')
    .trim()
  if (caseExtraction) {
    const escapedExtraction = caseExtraction.replace(/\n/g, '\\n')
    frontmatter.push(`caseExtraction: "${escapedExtraction}"`)
  }
  
  const relatedCompaniesValue = (row['涉及公司'] || row.relatedCompanies || '') as string
  const relatedCompanies = String(relatedCompaniesValue)
    .replace(/"/g, '\\"')
    .replace(/<br\s*\/?>/gi, ',')
    .replace(/\n/g, ',')
    .trim()
  if (relatedCompanies) {
    frontmatter.push(`relatedCompanies: "${relatedCompanies}"`)
  }
  
  // 调试日志
  if (process.env.NODE_ENV === 'development') {
    console.log('[同步] 提取的字段:', {
      chineseTitle: chineseTitle ? chineseTitle.substring(0, 50) : '无',
      underwaterInfo: underwaterInfo ? underwaterInfo.substring(0, 50) : '无',
      caseExtraction: caseExtraction ? caseExtraction.substring(0, 50) : '无',
      relatedCompanies: relatedCompanies ? relatedCompanies.substring(0, 50) : '无',
    })
  }
  
  // 构建内容
  let content = `---\n${frontmatter.join('\n')}\n---\n\n`
  
  // 添加标题
  if (row.title) {
    content += `# ${row.title}\n\n`
  }
  
  // 添加摘要
  if (row.summary) {
    content += `${row.summary}\n\n`
  }
  
  // 添加其他信息
  if (row.source) {
    content += `**来源**: ${row.source}\n\n`
  }
  
  // 添加其他字段（如果有）
  const otherFields = ['金句', '水下信息', '案例提取', '涉及公司', '原标题']
  for (const field of otherFields) {
    if (row[field] && typeof row[field] === 'string' && row[field].trim()) {
      // 将 <br> 标签转换为换行符，避免 MDX 解析错误
      let fieldContent = row[field]
        .replace(/<br\s*\/?>/gi, '\n')  // 将 <br> 或 <br/> 转换为换行
        .replace(/<br\s*\/?>/gi, '\n')  // 再次处理，确保所有变体都被转换
        .trim()
      content += `## ${field}\n\n${fieldContent}\n\n`
    }
  }
  
  return content
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

  // 确保目标目录存在
  await ensureDir(config.projectContentPath)

  for (const row of rows) {
    try {
      console.log(`[同步] 处理条目: ${row.title || row.filePath}`)
      
      // 生成目标文件路径
      const targetPath = getTargetFilePath(
        row.filePath,
        config.projectContentPath,
        preserveStructure
      )
      
      console.log(`[同步] 目标路径: ${targetPath}`)

      // 检查必需字段
      if (!row.title && !row.filePath) {
        stats.skippedFiles++
        stats.errors.push(`条目缺少标题和文件路径: ${JSON.stringify(row)}`)
        continue
      }
      
      if (!row.date) {
        stats.skippedFiles++
        stats.errors.push(`条目缺少日期: ${row.title || row.filePath}`)
        continue
      }

      // 确保目标目录存在
      await ensureDir(path.dirname(targetPath))

      // 生成 Markdown 内容
      const markdownContent = generateMarkdownContent(row)
      
      // 调试：输出生成的内容预览
      console.log(`[同步] 生成内容预览 (前200字符):`, markdownContent.substring(0, 200))
      
      // 写入文件
      const writeFile = promisify(fs.writeFile)
      await writeFile(targetPath, markdownContent, 'utf-8')
      
      console.log(`[同步] 文件创建成功: ${targetPath}`)
      stats.syncedFiles++
    } catch (error) {
      stats.skippedFiles++
      const errorMessage =
        error instanceof Error ? error.message : String(error)
      stats.errors.push(`同步失败 ${row.title || row.filePath}: ${errorMessage}`)
      console.error(`[同步] 错误:`, error)
    }
  }

  return stats
}

export async function POST(request: NextRequest) {
  console.log('[API] 收到同步请求')
  try {
    const body = await request.json()
    const { selectedRows, config } = body
    console.log('[API] 请求数据:', {
      selectedRowsCount: selectedRows?.length,
      obsidianPath: config?.obsidianPath,
      projectContentPath: config?.projectContentPath,
    })

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

    console.log('[API] 开始同步文件...')
    const stats = await syncFiles(selectedRows, syncConfig)
    console.log('[API] 同步完成:', stats)

    return NextResponse.json({
      success: true,
      stats,
    })
  } catch (error) {
    console.error('[API] 同步错误:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 }
    )
  }
}

