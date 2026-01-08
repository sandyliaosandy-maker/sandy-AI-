import * as fs from 'fs'
import * as path from 'path'

/**
 * 表格行数据接口
 */
export interface TableRow {
  filePath: string
  date: string
  title?: string
  tags?: string[]
  score?: number
  summary?: string
  source?: string
  [key: string]: unknown // 允许其他字段
}

/**
 * 解析 Markdown 表格
 * @param filePath 包含表格的 Markdown 文件路径
 * @returns 解析后的表格行数据数组
 */
export function parseMarkdownTable(filePath: string): TableRow[] {
  if (!fs.existsSync(filePath)) {
    throw new Error(`表格文件不存在: ${filePath}`)
  }

  const content = fs.readFileSync(filePath, 'utf-8')
  const lines = content.split('\n')

  // 查找表格开始位置（包含 | 的行）
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

  // 跳过分隔行（通常是 |---|---|）
  let dataStartIndex = tableStartIndex + 1
  if (lines[dataStartIndex] && lines[dataStartIndex].includes('---')) {
    dataStartIndex++
  }

  // 解析数据行
  const rows: TableRow[] = []
  for (let i = dataStartIndex; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line.startsWith('|')) {
      break // 表格结束
    }

    const values = parseTableRow(line)
    if (values.length === 0) {
      continue
    }

    // 构建行对象
    const row: TableRow = {
      filePath: '',
      date: '',
    }

    headers.forEach((header, index) => {
      const value = values[index]?.trim() || ''
      const normalizedHeader = header.toLowerCase().trim()

      // 映射常见字段名
      if (normalizedHeader === '文件路径' || normalizedHeader === 'filepath' || normalizedHeader === 'file_path') {
        row.filePath = value
      } else if (normalizedHeader === '日期' || normalizedHeader === 'date') {
        row.date = value
      } else if (normalizedHeader === '标题' || normalizedHeader === 'title') {
        row.title = value
      } else if (normalizedHeader === '标签' || normalizedHeader === 'tags') {
        row.tags = parseTags(value)
      } else if (normalizedHeader === '评分' || normalizedHeader === 'score') {
        row.score = parseFloat(value) || undefined
      } else if (normalizedHeader === '摘要' || normalizedHeader === 'summary') {
        row.summary = value
      } else if (normalizedHeader === '来源' || normalizedHeader === 'source') {
        row.source = value
      } else {
        // 保留其他字段
        row[header] = value
      }
    })

    // 验证必需字段
    if (row.filePath && row.date) {
      rows.push(row)
    }
  }

  return rows
}

/**
 * 解析表格行（分割 | 分隔的单元格）
 */
function parseTableRow(line: string): string[] {
  return line
    .split('|')
    .map((cell) => cell.trim())
    .filter((cell) => cell.length > 0)
}

/**
 * 解析标签字符串（支持逗号、空格分隔）
 */
function parseTags(tagString: string): string[] {
  if (!tagString) {
    return []
  }

  return tagString
    .split(/[,，\s]+/)
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0)
}

/**
 * 标准化日期格式
 * 支持多种日期格式：YYYY-MM-DD, YYYY/MM/DD, YYYY.MM.DD 等
 */
export function normalizeDate(dateString: string): Date | null {
  if (!dateString) {
    return null
  }

  // 尝试多种日期格式
  const formats = [
    /^(\d{4})-(\d{1,2})-(\d{1,2})/, // YYYY-MM-DD
    /^(\d{4})\/(\d{1,2})\/(\d{1,2})/, // YYYY/MM/DD
    /^(\d{4})\.(\d{1,2})\.(\d{1,2})/, // YYYY.MM.DD
  ]

  for (const format of formats) {
    const match = dateString.match(format)
    if (match) {
      const year = parseInt(match[1], 10)
      const month = parseInt(match[2], 10) - 1 // 月份从 0 开始
      const day = parseInt(match[3], 10)
      const date = new Date(year, month, day)
      if (!isNaN(date.getTime())) {
        return date
      }
    }
  }

  // 尝试直接解析
  const date = new Date(dateString)
  if (!isNaN(date.getTime())) {
    return date
  }

  return null
}


