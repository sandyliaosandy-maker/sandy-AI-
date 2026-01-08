/**
 * 周报保存 API 路由
 * 
 * 功能：
 * - 接收周报编辑器提交的数据
 * - 生成 Markdown 文件并保存到 `内容/公开内容/周报/` 目录
 * - 处理 includedItems 的 JSON 字符串转义，确保在 YAML frontmatter 中正确存储
 * 
 * 注意：
 * - includedItems 是对象数组，需要转换为 JSON 字符串
 * - 在 YAML frontmatter 中存储 JSON 字符串时，需要特殊处理转义字符
 */
import { NextRequest, NextResponse } from 'next/server'
import * as fs from 'fs'
import * as path from 'path'
import { promisify } from 'util'

const writeFile = promisify(fs.writeFile)
const mkdir = promisify(fs.mkdir)

/**
 * 确保目录存在
 * 
 * @param dirPath - 目录路径
 * @throws 如果创建目录失败且错误不是 EEXIST
 */
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
 * 生成文件名（基于标题）
 * 
 * 处理逻辑：
 * 1. 移除文件系统不允许的特殊字符
 * 2. 将空格替换为连字符
 * 3. 转换为小写
 * 4. 限制长度为 50 个字符
 * 
 * @param title - 周报标题
 * @returns 生成的文件名（不含扩展名）
 */
function generateFileName(title: string): string {
  return title
    .replace(/[<>:"/\\|?*\[\]()]/g, '') // 移除特殊字符
    .replace(/\s+/g, '-') // 空格替换为连字符
    .toLowerCase() // 转换为小写
    .substring(0, 50) // 限制长度
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      title,
      date,
      coverImage,
      editorialContent,
      includedItems,
      tags,
      published,
    } = body

    if (!title || !title.trim()) {
      return NextResponse.json(
        { success: false, error: '周报标题不能为空' },
        { status: 400 }
      )
    }

    // 生成文件名
    const fileName = `${generateFileName(title)}.md`
    const newsletterDir = path.join(process.cwd(), '内容', '公开内容', '周报')
    await ensureDir(newsletterDir)
    const filePath = path.join(newsletterDir, fileName)

    // 构建 Frontmatter
    const frontmatter: string[] = []
    frontmatter.push(`title: "${title.replace(/"/g, '\\"')}"`)
    frontmatter.push(`date: ${date}`)
    if (coverImage) {
      frontmatter.push(`coverImage: "${coverImage}"`)
    }
    if (tags && tags.length > 0) {
      const tagsStr = tags.map((tag: string) => `"${tag.replace(/"/g, '\\"')}"`).join(', ')
      frontmatter.push(`tags: [${tagsStr}]`)
    }
    /**
     * 处理包含的内容项（对象数组，保存为 JSON 字符串）
     * 
     * 转义规则说明：
     * 1. JSON.stringify() 会自动将控制字符转义为 \n, \r, \t 等
     * 2. 在 YAML frontmatter 中，反斜杠需要双重转义（\\）才能表示字面量反斜杠
     *    例如：JSON 中的 \n 在 YAML 中需要写成 \\n
     * 3. 双引号需要转义为 \"，以便在 YAML 字符串中使用
     * 
     * 示例：
     * - 原始数据: { underwaterInfo: "第一行\n第二行" }
     * - JSON.stringify 后: {"underwaterInfo":"第一行\n第二行"}
     * - YAML frontmatter 中: includedItems: "{\"underwaterInfo\":\"第一行\\n第二行\"}"
     */
    if (includedItems && includedItems.length > 0) {
      // 将对象数组转换为 JSON 字符串
      // JSON.stringify 会自动转义控制字符（\n, \r, \t 等）
      let itemsJson = JSON.stringify(includedItems)
      
      // 在 YAML frontmatter 中，需要对 JSON 字符串中的反斜杠进行双重转义
      // 否则 Contentlayer 在解析时会因为 "Bad control character" 报错
      itemsJson = itemsJson.replace(/\\/g, '\\\\') // 先转义反斜杠：\ -> \\
      
      // 转义 JSON 字符串中的引号，以便在 YAML frontmatter 中使用
      frontmatter.push(`includedItems: "${itemsJson.replace(/"/g, '\\"')}"`)
    }
    frontmatter.push(`published: ${published ? 'true' : 'false'}`)

    // 构建内容
    let content = `---\n${frontmatter.join('\n')}\n---\n\n`

    // 如果有编辑内容，添加到正文
    if (editorialContent && editorialContent.trim()) {
      content += `${editorialContent}\n\n`
    }

    /**
     * 如果有包含的内容，在 Markdown 正文中添加引用列表
     * 
     * 注意：includedItems 现在是对象数组，每个对象包含：
     * - slug: 原始内容的 slug
     * - chineseTitle: 中文标题（优先使用）
     * - 其他字段：underwaterInfo, caseExtraction, relatedCompanies
     */
    if (includedItems && includedItems.length > 0) {
      content += `---\n\n## 本期内容\n\n`
      content += `本期周报包含了以下精选内容：\n\n`
      includedItems.forEach((item: string | { slug: string; chineseTitle?: string }, index: number) => {
        // 兼容处理：支持旧格式（字符串）和新格式（对象）
        const slug = typeof item === 'string' ? item : item.slug
        const title = typeof item === 'string' ? `内容 ${index + 1}` : (item.chineseTitle || `内容 ${index + 1}`)
        content += `${index + 1}. [${title}](#${slug})\n`
      })
      content += `\n---\n\n`
    }

    // 写入文件
    await writeFile(filePath, content, 'utf-8')

    // 调试日志（仅在开发环境）
    if (process.env.NODE_ENV === 'development') {
      console.log(`[周报] 保存成功: ${filePath}`)
    }

    return NextResponse.json({
      success: true,
      filePath,
      fileName,
    })
  } catch (error) {
    console.error('[周报] 保存错误:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '保存失败',
      },
      { status: 500 }
    )
  }
}

