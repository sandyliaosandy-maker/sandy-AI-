import { NextResponse } from 'next/server'

interface ContentItem {
  slug: string
  title: string
  date: string
  tags: string[]
  summary?: string
}

/**
 * 获取所有内容列表（新闻和笔记）
 * 用于周报编辑页面，避免在客户端导入 Contentlayer 模块
 */
export async function GET() {
  try {
    // 动态导入 Contentlayer 数据
    const { allNews, allNotes } = await import('../../../../.contentlayer/generated')
    
    const newsItems: ContentItem[] = (allNews || []).map((item) => ({
      slug: item.slug,
      title: item.title,
      date: item.date as string,
      tags: item.tags || [],
      summary: 'summary' in item ? item.summary : undefined,
    }))
    
    const noteItems: ContentItem[] = (allNotes || []).map((item) => ({
      slug: item.slug,
      title: item.title,
      date: item.date as string,
      tags: item.tags || [],
      summary: undefined, // Note 类型没有 summary 字段
    }))
    
    return NextResponse.json({
      success: true,
      data: {
        news: newsItems,
        notes: noteItems,
        all: [...newsItems, ...noteItems],
      },
    })
  } catch (error) {
    console.error('[API] 获取内容列表失败:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '未知错误',
        data: {
          news: [],
          notes: [],
          all: [],
        },
      },
      { status: 500 }
    )
  }
}
