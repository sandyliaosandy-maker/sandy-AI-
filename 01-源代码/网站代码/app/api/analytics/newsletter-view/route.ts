/**
 * 周报访问统计 API
 * 
 * 功能：
 * - 记录用户访问周报的详细信息
 * - 收集用户信息（IP、User-Agent、Referer 等）
 * - 记录访问时间、周报 slug 等信息
 * 
 * 数据存储：可以存储到数据库或文件系统
 * 当前实现：存储到文件系统（JSON 格式）
 */
import { NextRequest, NextResponse } from 'next/server'
import * as fs from 'fs'
import * as path from 'path'
import { promisify } from 'util'

const writeFile = promisify(fs.writeFile)
const readFile = promisify(fs.readFile)
const mkdir = promisify(fs.mkdir)

// 确保目录存在
async function ensureDir(dirPath: string): Promise<void> {
  try {
    await mkdir(dirPath, { recursive: true })
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'EEXIST') {
      throw error
    }
  }
}

/**
 * 获取客户端 IP 地址
 */
function getClientIP(request: NextRequest): string {
  // 尝试从各种头部获取 IP
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const cfConnectingIP = request.headers.get('cf-connecting-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  if (realIP) {
    return realIP
  }
  if (cfConnectingIP) {
    return cfConnectingIP
  }
  return 'unknown'
}

/**
 * 访问记录接口
 */
interface ViewRecord {
  newsletterSlug: string // 周报 slug
  timestamp: string // 访问时间（ISO 格式）
  ip: string // 客户端 IP
  userAgent: string // User-Agent
  referer: string // Referer
  pathname: string // 访问路径
  language: string // 浏览器语言
  timezone: string // 时区
  screenResolution?: string // 屏幕分辨率
  viewport?: string // 视口大小
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { newsletterSlug, screenResolution, viewport } = body

    if (!newsletterSlug) {
      return NextResponse.json(
        { success: false, error: 'newsletterSlug 不能为空' },
        { status: 400 }
      )
    }

    // 收集访问信息
    const viewRecord: ViewRecord = {
      newsletterSlug,
      timestamp: new Date().toISOString(),
      ip: getClientIP(request),
      userAgent: request.headers.get('user-agent') || 'unknown',
      referer: request.headers.get('referer') || 'direct',
      pathname: request.nextUrl.pathname,
      language: request.headers.get('accept-language') || 'unknown',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      screenResolution,
      viewport,
    }

    // 保存到文件系统
    const analyticsDir = path.join(process.cwd(), '数据', '访问统计')
    await ensureDir(analyticsDir)

    // 按日期创建文件（每天一个文件）
    const date = new Date().toISOString().split('T')[0]
    const filePath = path.join(analyticsDir, `newsletter-views-${date}.json`)

    // 读取现有记录
    let records: ViewRecord[] = []
    try {
      const existingData = await readFile(filePath, 'utf-8')
      records = JSON.parse(existingData)
    } catch {
      // 文件不存在，创建新数组
      records = []
    }

    // 添加新记录
    records.push(viewRecord)

    // 写入文件
    await writeFile(filePath, JSON.stringify(records, null, 2), 'utf-8')

    console.log(`[访问统计] 记录成功: ${newsletterSlug} - ${viewRecord.ip}`)

    return NextResponse.json({
      success: true,
      message: '访问记录已保存',
    })
  } catch (error) {
    console.error('[访问统计] 记录错误:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '记录失败',
      },
      { status: 500 }
    )
  }
}

// 允许 GET 请求用于测试
export async function GET() {
  return NextResponse.json({
    message: '周报访问统计 API',
    usage: 'POST /api/analytics/newsletter-view',
    body: {
      newsletterSlug: 'string (required)',
      screenResolution: 'string (optional)',
      viewport: 'string (optional)',
    },
  })
}


