import { parseISO, isAfter, isBefore, subDays, startOfDay, endOfDay } from 'date-fns'
import type { TableRow } from './table-parser'
import { normalizeDate } from './table-parser'

/**
 * 筛选配置接口
 */
export interface FilterConfig {
  dateRange?: {
    start?: string // 开始日期 YYYY-MM-DD
    end?: string // 结束日期 YYYY-MM-DD
    custom?: string // 自定义规则，如 "最近30天"
  }
  tags?: string[] // 标签筛选
  minScore?: number // 最低评分
  [key: string]: unknown // 允许其他筛选条件
}

/**
 * 筛选内容
 * @param rows 表格行数据
 * @param config 筛选配置
 * @returns 筛选后的行数据
 */
export function filterContent(rows: TableRow[], config: FilterConfig): TableRow[] {
  let filtered = [...rows]

  // 日期筛选
  if (config.dateRange) {
    filtered = filterByDate(filtered, config.dateRange)
  }

  // 标签筛选
  if (config.tags && config.tags.length > 0) {
    filtered = filterByTags(filtered, config.tags)
  }

  // 评分筛选
  if (config.minScore !== undefined) {
    filtered = filterByScore(filtered, config.minScore)
  }

  return filtered
}

/**
 * 根据日期范围筛选
 */
function filterByDate(rows: TableRow[], dateRange: FilterConfig['dateRange']): TableRow[] {
  if (!dateRange) {
    return rows
  }

  let startDate: Date | null = null
  let endDate: Date | null = null

  // 处理自定义规则
  if (dateRange.custom) {
    const customRule = dateRange.custom.trim()
    
    // 最近 N 天
    const recentDaysMatch = customRule.match(/最近(\d+)天/)
    if (recentDaysMatch) {
      const days = parseInt(recentDaysMatch[1], 10)
      endDate = endOfDay(new Date())
      startDate = startOfDay(subDays(new Date(), days))
    }
    
    // 日期范围 "YYYY-MM-DD to YYYY-MM-DD"
    const rangeMatch = customRule.match(/(\d{4}-\d{2}-\d{2})\s+to\s+(\d{4}-\d{2}-\d{2})/i)
    if (rangeMatch) {
      startDate = startOfDay(parseISO(rangeMatch[1]))
      endDate = endOfDay(parseISO(rangeMatch[2]))
    }
    
    // 单个日期 "YYYY-MM-DD"
    const singleDateMatch = customRule.match(/^(\d{4}-\d{2}-\d{2})$/)
    if (singleDateMatch) {
      const date = parseISO(singleDateMatch[1])
      startDate = startOfDay(date)
      endDate = endOfDay(date)
    }
  }

  // 使用配置的开始和结束日期
  if (dateRange.start) {
    startDate = startOfDay(parseISO(dateRange.start))
  }
  if (dateRange.end) {
    endDate = endOfDay(parseISO(dateRange.end))
  }

  // 如果没有设置日期范围，返回所有数据
  if (!startDate && !endDate) {
    return rows
  }

  return rows.filter((row) => {
    const rowDate = normalizeDate(row.date)
    if (!rowDate) {
      return false // 无效日期，过滤掉
    }

    // 检查是否在范围内
    if (startDate && isBefore(rowDate, startDate)) {
      return false
    }
    if (endDate && isAfter(rowDate, endDate)) {
      return false
    }

    return true
  })
}

/**
 * 根据标签筛选
 */
function filterByTags(rows: TableRow[], tags: string[]): TableRow[] {
  return rows.filter((row) => {
    if (!row.tags || row.tags.length === 0) {
      return false
    }

    // 只要包含任一标签即可
    return tags.some((tag) => row.tags?.includes(tag))
  })
}

/**
 * 根据评分筛选
 */
function filterByScore(rows: TableRow[], minScore: number): TableRow[] {
  return rows.filter((row) => {
    if (row.score === undefined) {
      return false // 没有评分的过滤掉
    }
    return row.score >= minScore
  })
}





