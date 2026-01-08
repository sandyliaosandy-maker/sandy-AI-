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

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { success: false, error: '未找到文件' },
        { status: 400 }
      )
    }

    // 验证文件类型
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: '不支持的文件类型，仅支持 JPEG、PNG、GIF、WebP' },
        { status: 400 }
      )
    }

    // 验证文件大小（最大 5MB）
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: '文件大小超过 5MB 限制' },
        { status: 400 }
      )
    }

    // 生成唯一文件名
    const timestamp = Date.now()
    const randomStr = Math.random().toString(36).substring(2, 8)
    const ext = path.extname(file.name)
    const fileName = `${timestamp}-${randomStr}${ext}`

    // 确保上传目录存在
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
    await ensureDir(uploadsDir)

    // 保存文件
    const filePath = path.join(uploadsDir, fileName)
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    // 返回文件URL（相对于public目录）
    const fileUrl = `/uploads/${fileName}`

    console.log(`[上传] 图片上传成功: ${fileUrl}`)

    return NextResponse.json({
      success: true,
      url: fileUrl,
    })
  } catch (error) {
    console.error('[上传] 图片上传错误:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '上传失败',
      },
      { status: 500 }
    )
  }
}


