import { NextRequest, NextResponse } from 'next/server'
import * as fs from 'fs'
import * as path from 'path'
import { promisify } from 'util'

const writeFile = promisify(fs.writeFile)
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

// 生成文件名（基于标题）
function generateFileName(title: string): string {
  return title
    .replace(/[<>:"/\\|?*\[\]()]/g, '')
    .replace(/\s+/g, '-')
    .toLowerCase()
    .substring(0, 50)
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
    if (includedItems && includedItems.length > 0) {
      const itemsStr = includedItems.map((item: string) => `"${item}"`).join(', ')
      frontmatter.push(`includedItems: [${itemsStr}]`)
    }
    frontmatter.push(`published: ${published ? 'true' : 'false'}`)

    // 构建内容
    let content = `---\n${frontmatter.join('\n')}\n---\n\n`

    // 如果有编辑内容，添加到正文
    if (editorialContent && editorialContent.trim()) {
      content += `${editorialContent}\n\n`
    }

    // 如果有包含的内容，添加引用
    if (includedItems && includedItems.length > 0) {
      content += `---\n\n## 本期内容\n\n`
      content += `本期周报包含了以下精选内容：\n\n`
      includedItems.forEach((item: string, index: number) => {
        content += `${index + 1}. [内容 ${index + 1}](#${item})\n`
      })
      content += `\n---\n\n`
    }

    // 写入文件
    await writeFile(filePath, content, 'utf-8')

    console.log(`[周报] 保存成功: ${filePath}`)

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


