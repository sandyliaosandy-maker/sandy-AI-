/**
 * 周报链路诊断 API（仅开发排查用）
 * GET /api/debug-newsletter
 * 返回：保存目录、生成目录、实际文件列表、首页读取结果等
 */
import { NextResponse } from 'next/server'
import * as fs from 'fs'
import * as path from 'path'

function getContentRoot(): string {
  const cwd = process.cwd()
  if (fs.existsSync(path.join(cwd, '内容')) && fs.existsSync(path.join(cwd, 'contentlayer.config.ts'))) {
    return cwd
  }
  const nested = path.join(cwd, '01-源代码', '网站代码')
  if (fs.existsSync(path.join(nested, '内容'))) {
    return nested
  }
  return cwd
}

export async function GET() {
  const root = getContentRoot()
  const newsletterMdDir = path.join(root, '内容', '公开内容', '周报')
  const generatedNewsletterDir = path.join(root, '.contentlayer', 'generated', 'Newsletter')

  const mdExists = fs.existsSync(newsletterMdDir)
  const genExists = fs.existsSync(generatedNewsletterDir)

  let mdFiles: string[] = []
  let jsonFiles: string[] = []
  let parsedCount = 0
  const sampleSlugs: string[] = []

  if (mdExists) {
    try {
      mdFiles = fs.readdirSync(newsletterMdDir).filter((f) => f.endsWith('.md'))
    } catch (e) {
      mdFiles = [`readdir error: ${(e as Error).message}`]
    }
  }
  if (genExists) {
    try {
      jsonFiles = fs.readdirSync(generatedNewsletterDir).filter((f) => f.endsWith('.json') && f !== '_index.json')
      for (const f of jsonFiles.slice(0, 5)) {
        try {
          const raw = fs.readFileSync(path.join(generatedNewsletterDir, f), 'utf-8')
          const doc = JSON.parse(raw) as { slug?: string }
          if (doc.slug) sampleSlugs.push(doc.slug)
        } catch {
          // skip
        }
      }
      parsedCount = jsonFiles.length
    } catch (e) {
      jsonFiles = [`readdir error: ${(e as Error).message}`]
    }
  }

  return NextResponse.json({
    processCwd: process.cwd(),
    contentRoot: root,
    paths: {
      newsletterMdDir,
      generatedNewsletterDir,
    },
    exists: {
      newsletterMdDir: mdExists,
      generatedNewsletterDir: genExists,
    },
    mdFileCount: mdFiles.length,
    mdFiles: mdFiles.slice(0, 20),
    generatedJsonCount: jsonFiles.length,
    generatedJsonFiles: jsonFiles.slice(0, 20),
    sampleSlugsFromJson: sampleSlugs,
    parsedCount,
  })
}
