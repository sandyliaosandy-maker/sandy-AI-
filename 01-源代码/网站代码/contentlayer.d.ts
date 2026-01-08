/**
 * Contentlayer 类型声明
 * 用于开发时的类型检查，实际文件会在构建时由 Contentlayer 生成
 */

declare module '../.contentlayer/generated' {
  export interface News {
    _id: string
    _raw: any
    type: 'News'
    title: string
    date: string
    tags: string[]
    score?: number
    summary?: string
    slug: string
    chineseTitle?: string
    underwaterInfo?: string
    caseExtraction?: string
    relatedCompanies?: string
    body: {
      raw: string
      code: string
    }
  }

  export interface Note {
    _id: string
    _raw: any
    type: 'Note'
    title: string
    date: string
    tags: string[]
    source?: string
    slug: string
    chineseTitle?: string
    underwaterInfo?: string
    caseExtraction?: string
    relatedCompanies?: string
    body: {
      raw: string
      code: string
    }
  }

  export interface Page {
    _id: string
    _raw: any
    type: 'Page'
    title: string
    slug: string
    body: {
      raw: string
      code: string
    }
  }

  export interface Newsletter {
    _id: string
    _raw: any
    type: 'Newsletter'
    title: string
    date: string
    coverImage?: string
    editorialContent?: {
      code: string
    }
    includedItems?: string
    tags: string[]
    published?: boolean
    slug: string
    body: {
      raw: string
      code: string
    }
  }

  export const allNews: News[]
  export const allNotes: Note[]
  export const allPages: Page[]
  export const allNewsletters: Newsletter[]
  export const allDocuments: (News | Note | Page | Newsletter)[]
}

declare module '../../.contentlayer/generated' {
  export * from '../.contentlayer/generated'
}

declare module '../../../.contentlayer/generated' {
  export * from '../.contentlayer/generated'
}

declare module '../../../../.contentlayer/generated' {
  export * from '../.contentlayer/generated'
}

