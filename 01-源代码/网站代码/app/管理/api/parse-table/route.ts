import { NextRequest, NextResponse } from 'next/server'
import * as fs from 'fs'
import * as path from 'path'

// 由于脚本工具在项目外部，我们需要直接实现解析逻辑或使用动态导入
// 这里我们直接实现简化的解析逻辑

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

function parseTableRow(line: string): string[] {
  return line
    .split('|')
    .map((cell) => cell.trim())
    .filter((cell) => cell.length > 0)
}

function parseTags(tagString: string): string[] {
  if (!tagString) {
    return []
  }
  return tagString
    .split(/[,，\s]+/)
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

    headers.forEach((header, index) => {
      const value = values[index]?.trim() || ''
      const normalizedHeader = header.toLowerCase().trim()

      if (
        normalizedHeader === '文件路径' ||
        normalizedHeader === 'filepath' ||
        normalizedHeader === 'file_path'
      ) {
        row.filePath = value
      } else if (
        normalizedHeader === '日期' ||
        normalizedHeader === 'date' ||
        normalizedHeader === '抓取时间'
      ) {
        row.date = value
      } else if (
        normalizedHeader === '标题' ||
        normalizedHeader === 'title' ||
        normalizedHeader === '中文标题'
      ) {
        row.title = value
      } else if (normalizedHeader === '标签' || normalizedHeader === 'tags') {
        row.tags = parseTags(value)
      } else if (normalizedHeader === '评分' || normalizedHeader === 'score') {
        row.score = parseFloat(value) || undefined
      } else if (normalizedHeader === '摘要' || normalizedHeader === 'summary') {
        row.summary = value
      } else if (normalizedHeader === '来源' || normalizedHeader === 'source') {
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
      } else {
        row[header] = value
      }
    })

    // 如果没有文件路径，根据标题生成一个默认路径（用户可以后续编辑）
    if (!row.filePath && row.title) {
      // 生成一个基于标题的文件名（移除特殊字符，限制长度）
      const sanitizedTitle = row.title
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .substring(0, 50)
      row.filePath = `公开内容/新闻/${sanitizedTitle}.md`
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
    const { obsidianPath, tableFile } = await request.json()

    if (!obsidianPath || !tableFile) {
      return NextResponse.json(
        { success: false, error: '缺少必需参数：obsidianPath 或 tableFile' },
        { status: 400 }
      )
    }

    const tableFilePath = path.join(obsidianPath, tableFile)
    const rows = parseMarkdownTable(tableFilePath)

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
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 }
    )
  }
}

