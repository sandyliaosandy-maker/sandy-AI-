/**
 * Obsidian 表格解析 API 路由
 * 
 * 功能：
 * - 解析 Obsidian Markdown 表格文件
 * - 提取表格中的内容项信息（标题、日期、标签、来源等）
 * - 支持中英文列名匹配（如 "抓取时间" 或 "date"）
 * - 提取扩展字段（中文标题、水下信息、案例提取、涉及公司）
 * 
 * 表格格式：
 * | 抓取时间 | 中文标题 | 来源 | 水下信息 | 案例提取 | 涉及公司 | ...
 */
import { NextRequest, NextResponse } from 'next/server'
import * as fs from 'fs'
import * as path from 'path'

/**
 * 表格行数据接口
 * 
 * 包含标准字段和扩展字段：
 * - 标准字段：filePath, date, title, tags, score, summary, source
 * - 扩展字段：chineseTitle, underwaterInfo, caseExtraction, relatedCompanies
 */
interface TableRow {
  filePath: string // 文件路径（如果表格中没有，会根据标题生成）
  date: string // 日期（支持 "抓取时间" 或 "date" 列名）
  title?: string // 标题（支持 "中文标题" 或 "title" 列名）
  tags?: string[] // 标签数组
  score?: number // 评分
  summary?: string // 摘要
  source?: string // 来源（支持 "来源" 或 "source" 列名）
  selected?: boolean // 是否被选中（前端使用）
  // 扩展字段
  chineseTitle?: string // 中文标题
  underwaterInfo?: string // 水下信息
  caseExtraction?: string // 案例提取
  relatedCompanies?: string // 涉及公司
  [key: string]: unknown // 允许其他字段
}

/**
 * 解析 Markdown 表格行
 * 
 * 处理逻辑：
 * 1. 移除行首尾的空白和 | 符号
 * 2. 按 | 分割单元格
 * 3. 去除每个单元格的首尾空白
 * 
 * @param line - 表格行字符串
 * @returns 单元格数组
 */
function parseTableRow(line: string): string[] {
  const trimmed = line.trim()
  if (!trimmed.startsWith('|')) {
    return []
  }
  // 移除首尾的 |，然后分割
  const cells = trimmed.slice(1, -1).split('|').map((cell) => cell.trim())
  return cells
}

/**
 * 解析标签字符串
 * 
 * 支持多种分隔符：逗号（中英文）、空格
 * 
 * @param tagString - 标签字符串，例如 "AI, 技术, 创新" 或 "AI 技术 创新"
 * @returns 标签数组
 */
function parseTags(tagString: string): string[] {
  if (!tagString) {
    return []
  }
  return tagString
    .split(/[,，\s]+/) // 支持中英文逗号和空格
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0)
}

function parseMarkdownTable(filePath: string): TableRow[] {
  if (!fs.existsSync(filePath)) {
    throw new Error(`表格文件不存在: ${filePath}`)
  }

  const content = fs.readFileSync(filePath, 'utf-8')
  const lines = content.split('\n')

  // 查找表格开始位置
  let tableStartIndex = -1
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim().startsWith('|')) {
      tableStartIndex = i
      break
    }
  }

  if (tableStartIndex === -1) {
    throw new Error('未找到表格')
  }

  // 解析表头
  const headerLine = lines[tableStartIndex].trim()
  const headers = parseTableRow(headerLine)

  // 跳过分隔行
  let dataStartIndex = tableStartIndex + 1
  if (lines[dataStartIndex] && lines[dataStartIndex].includes('---')) {
    dataStartIndex++
  }

  // 解析数据行
  const rows: TableRow[] = []
  for (let i = dataStartIndex; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line.startsWith('|')) {
      break
    }

    const values = parseTableRow(line)
    if (values.length === 0) {
      continue
    }

    const row: TableRow = {
      filePath: '',
      date: '',
      selected: false,
    }

    // 调试：输出表头信息（仅第一条记录）
    if (rows.length === 0) {
      console.log('[解析] 表头:', headers)
      console.log('[解析] 第一条数据行:', values)
      console.log('[解析] 表头索引映射:', headers.map((h, i) => `${i}: "${h.trim()}"`).join(', '))
    }

    headers.forEach((header, index) => {
      const value = values[index]?.trim() || ''
      const normalizedHeader = header.trim().toLowerCase()
      
      // 调试：输出每个字段的匹配过程（仅第一条记录）
      if (rows.length === 0 && index < 10) {
        console.log(`[解析] 列${index}: header="${header.trim()}", normalized="${normalizedHeader}", value="${value.substring(0, 30)}"`)
      }

      // 注意：normalizedHeader 已经转换为小写，但中文不会变化
      // 表格列顺序：已阅 | 收藏 | 序号 | 评分 | 类型 | 来源 | 抓取时间 | 中文标题 | 原标题
      
      if (
        normalizedHeader === '文件路径' ||
        normalizedHeader === 'filepath' ||
        normalizedHeader === 'file_path'
      ) {
        row.filePath = value
      } else if (
        normalizedHeader === '抓取时间' ||  // 优先匹配中文列名
        normalizedHeader === '日期' ||
        normalizedHeader === 'date'
      ) {
        row.date = value
      } else if (
        normalizedHeader === '中文标题' ||  // 优先匹配中文列名
        normalizedHeader === '标题' ||
        normalizedHeader === 'title'
      ) {
        // 清理标题：移除 Markdown 链接格式和 HTML 实体
        const cleanTitle = value
          // 移除 Markdown 链接格式 [文本](URL)，只保留文本部分
          .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
          // 移除 HTML 实体编码（如 &#124;）
          .replace(/&#\d+;/g, '')
          // 移除 HTML 标签
          .replace(/<[^>]+>/g, '')
          .trim()
        row.title = cleanTitle
      } else if (normalizedHeader === '标签' || normalizedHeader === 'tags') {
        row.tags = parseTags(value)
      } else if (normalizedHeader === '评分' || normalizedHeader === 'score') {
        row.score = parseFloat(value) || undefined
      } else if (normalizedHeader === '摘要' || normalizedHeader === 'summary') {
        row.summary = value
      } else if (
        normalizedHeader === '来源' ||  // 优先匹配中文列名
        normalizedHeader === 'source'
      ) {
        row.source = value
      } else if (normalizedHeader === '类型') {
        // 类型可以作为标签的一部分
        if (!row.tags) {
          row.tags = []
        }
        if (value) {
          // 处理包含 <br> 标签的值
          const types = value.split(/<br\s*\/?>/i).filter((t) => t.trim())
          row.tags.push(...types.map((t) => t.trim()))
        }
      } else if (
        normalizedHeader === '中文标题' ||
        normalizedHeader === 'chinesetitle' ||
        header.trim() === '中文标题'
      ) {
        // 中文标题字段
        row.chineseTitle = value
        // 如果没有 title，使用中文标题作为 title
        if (!row.title) {
          row.title = value
        }
      } else if (
        normalizedHeader === '水下信息' ||
        normalizedHeader === 'underwaterinfo' ||
        header.trim() === '水下信息'
      ) {
        row.underwaterInfo = value
        // 同时保存到通用字段中
        row['水下信息'] = value
      } else if (
        normalizedHeader === '案例提取' ||
        normalizedHeader === 'caseextraction' ||
        header.trim() === '案例提取'
      ) {
        row.caseExtraction = value
        // 同时保存到通用字段中
        row['案例提取'] = value
      } else if (
        normalizedHeader === '涉及公司' ||
        normalizedHeader === 'relatedcompanies' ||
        normalizedHeader === '涉及的公司' ||
        header.trim() === '涉及公司'
      ) {
        row.relatedCompanies = value
        // 同时保存到通用字段中
        row['涉及公司'] = value
      } else {
        // 保存其他字段（如金句等）
        row[header] = value
      }
    })
    
    // 调试：检查关键字段（仅第一条记录）
    if (rows.length === 0) {
      console.log('[解析] 第一条记录解析后字段:', {
        title: row.title,
        date: row.date,
        source: row.source,
        filePath: row.filePath,
      })
    }

    // 如果没有文件路径，根据标题生成一个默认路径（用户可以后续编辑）
    if (!row.filePath && row.title) {
      // 生成一个基于标题的文件名（保留中文字符，移除特殊字符，限制长度）
      const sanitizedTitle = row.title
        // 移除 Markdown 链接格式 [文本](URL)
        .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
        // 移除 HTML 实体编码（如 &#124;）
        .replace(/&#\d+;/g, '')
        // 移除 HTML 标签
        .replace(/<[^>]+>/g, '')
        // 移除文件系统不允许的字符
        .replace(/[<>:"/\\|?*\[\]()]/g, '')
        // 移除多个连续的空格或连字符
        .replace(/[\s-]+/g, '-')
        // 移除开头和结尾的连字符
        .replace(/^-+|-+$/g, '')
      
      // 限制文件名长度（按字符数，限制在50个字符内，避免文件名过长）
      const maxChars = 50
      let truncated = sanitizedTitle.substring(0, maxChars)
      // 如果截断后以连字符结尾，移除它
      truncated = truncated.replace(/-+$/, '')
      
      // 如果标题为空，使用日期作为文件名
      if (!truncated || truncated.length === 0) {
        truncated = row.date ? row.date.split(' ')[0].replace(/-/g, '') : 'untitled'
      }
      
      row.filePath = `公开内容/新闻/${truncated}.md`
    }

    // 验证必需字段（至少要有日期和标题或文件路径）
    if (row.date && (row.filePath || row.title)) {
      rows.push(row)
    }
  }

  return rows
}

export async function POST(request: NextRequest) {
  try {
    console.log('[API] 收到解析表格请求')
    const { obsidianPath, tableFile } = await request.json()
    console.log('[API] 请求参数:', { obsidianPath, tableFile })

    if (!obsidianPath || !tableFile) {
      console.error('[API] 缺少必需参数')
      return NextResponse.json(
        { success: false, error: '缺少必需参数：obsidianPath 或 tableFile' },
        { status: 400 }
      )
    }

    const tableFilePath = path.join(obsidianPath, tableFile)
    console.log('[API] 表格文件路径:', tableFilePath)
    
    // 检查文件是否存在
    if (!fs.existsSync(tableFilePath)) {
      console.error('[API] 文件不存在:', tableFilePath)
      return NextResponse.json(
        {
          success: false,
          error: `表格文件不存在: ${tableFilePath}\n\n请检查：\n1. Obsidian 路径是否正确\n2. 表格文件名是否正确\n3. 文件是否存在于指定路径`,
        },
        { status: 404 }
      )
    }

    console.log('[API] 开始解析表格...')
    const rows = parseMarkdownTable(tableFilePath)
    console.log(`[API] 解析完成，共 ${rows.length} 条记录`)

    // 添加 selected 字段
    const rowsWithSelection = rows.map((row) => ({
      ...row,
      selected: false,
    }))

    return NextResponse.json({
      success: true,
      data: rowsWithSelection,
      count: rowsWithSelection.length,
    })
  } catch (error) {
    console.error('[API] 解析表格错误:', error)
    const errorMessage = error instanceof Error ? error.message : '未知错误'
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    )
  }
}
