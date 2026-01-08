/**
 * 占位数据类型定义
 * 用于开发阶段，后续将替换为 Contentlayer 生成的类型
 */

export interface MockNews {
  id: string
  title: string
  date: string
  tags: string[]
  score?: number
  summary?: string
  content: string
  thumbnail?: string
}

export interface MockNote {
  id: string
  title: string
  date: string
  tags: string[]
  source?: string
  content: string
  thumbnail?: string
}

export interface MockPage {
  id: string
  title: string
  content: string
}



