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
import { execSync } from 'child_process'
import { promisify } from 'util'
import { revalidatePath } from 'next/cache'

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
 * 获取网站内容根目录（与 Contentlayer、同步到线上 使用同一路径）
 * - 若当前 cwd 已是网站代码目录（含 内容 与 contentlayer.config.ts），用 cwd
 * - 否则若 cwd 为工作区根（含 01-源代码/网站代码/内容），用 01-源代码/网站代码
 * 这样无论从「网站代码」还是「Sandy的AI收藏夹」启动 dev，都写入同一目录
 */
function getContentRoot(): string {
  const cwd = process.cwd()
  const hasContentHere = fs.existsSync(path.join(cwd, '内容'))
  const hasConfigHere = fs.existsSync(path.join(cwd, 'contentlayer.config.ts'))
  if (hasContentHere && hasConfigHere) {
    return cwd
  }
  const nested = path.join(cwd, '01-源代码', '网站代码')
  if (fs.existsSync(path.join(nested, '内容'))) {
    return nested
  }
  return cwd
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

    // 生成文件名，并写入与 Contentlayer / 同步到线上 一致的内容目录
    const contentRoot = getContentRoot()
    const fileName = `${generateFileName(title)}.md`
    const newsletterDir = path.join(contentRoot, '内容', '公开内容', '周报')
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

    // 1) 修改 config 文件，让 dev 下的 watch 也能检测到
    try {
      const configPath = path.join(contentRoot, 'contentlayer.config.ts')
      let raw = fs.readFileSync(configPath, 'utf-8')
      raw = raw.replace(/\n\/\/ 周报已保存，触发重新生成 - \d+\n?$/g, '')
      fs.writeFileSync(configPath, raw + `\n// 周报已保存，触发重新生成 - ${Date.now()}\n`, 'utf-8')
    } catch (e) {
      console.warn('[周报] 轻触 config 失败:', e)
    }

    // 2) 立即执行 Contentlayer 生成，保证首页刷新时数据已更新
    let buildOk = false
    let buildError: string | null = null
    try {
      execSync('npx contentlayer build', {
        cwd: contentRoot,
        encoding: 'utf-8',
        timeout: 60000,
        stdio: 'pipe',
      })
      buildOk = true
    } catch (e) {
      const err = e as { message?: string; stderr?: string; stdout?: string }
      buildError = err.message || String(err)
      if (err.stderr) buildError += ` stderr: ${err.stderr.slice(0, 500)}`
      if (err.stdout) buildError += ` stdout: ${err.stdout.slice(0, 300)}`
      console.warn('[周报] contentlayer build 失败:', buildError)
    }

    // 使首页与周报列表下次请求时重新拉取数据
    revalidatePath('/')
    revalidatePath('/newsletter/[slug]')

    // 调试日志（仅在开发环境）
    if (process.env.NODE_ENV === 'development') {
      console.log(`[周报] 保存成功 contentRoot=${contentRoot} filePath=${filePath} buildOk=${buildOk}`)
    }

    return NextResponse.json({
      success: true,
      filePath,
      fileName,
      contentRoot,
      contentlayerBuildOk: buildOk,
      contentlayerBuildError: buildError ?? undefined,
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

