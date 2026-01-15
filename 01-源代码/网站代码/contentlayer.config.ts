import { defineDocumentType, makeSource } from 'contentlayer/source-files'
import remarkGfm from 'remark-gfm'
// import rehypePrettyCode from 'rehype-pretty-code' // 暂时禁用，因为 shiki 版本兼容性问题
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'

export const News = defineDocumentType(() => ({
  name: 'News',
  filePathPattern: '公开内容/新闻/**/*.md',
  contentType: 'mdx',
  fields: {
    title: { type: 'string', required: true },
    date: { type: 'date', required: true },
    tags: { type: 'list', of: { type: 'string' }, default: [] },
    score: { type: 'number', required: false },
    summary: { type: 'string', required: false },
    source: { type: 'string', required: false }, // 来源名称
    sourceUrl: { type: 'string', required: false }, // 原始链接 URL
    // 从 Obsidian 表格中提取的字段
    chineseTitle: { type: 'string', required: false }, // 中文标题
    underwaterInfo: { type: 'string', required: false }, // 水下信息
    caseExtraction: { type: 'string', required: false }, // 案例提取
    relatedCompanies: { type: 'string', required: false }, // 涉及公司
    // 付费内容标记
    isPremium: { type: 'boolean', required: false, default: false }, // 是否付费内容，默认免费
    previewLength: { type: 'number', required: false }, // 预览字符数（可选，默认500字）
  },
  computedFields: {
    /**
     * 生成新闻的 slug（URL 路径）
     * 
     * 处理逻辑：
     * 1. 移除路径前缀 '公开内容/新闻/'
     * 2. 移除文件扩展名 '.md'
     */
    slug: {
      type: 'string',
      resolve: (doc) => {
        // 移除路径前缀 '公开内容/新闻/'
        const path = doc._raw.flattenedPath.replace('公开内容/新闻/', '')
        // 移除文件扩展名 '.md'，确保 slug 不包含扩展名
        return path.replace(/\.md$/, '')
      },
    },
  },
}))

export const Note = defineDocumentType(() => ({
  name: 'Note',
  filePathPattern: '公开内容/笔记/**/*.md',
  contentType: 'mdx',
  fields: {
    title: { type: 'string', required: true },
    date: { type: 'date', required: true },
    tags: { type: 'list', of: { type: 'string' }, default: [] },
    source: { type: 'string', required: false },
    // 从 Obsidian 表格中提取的字段
    chineseTitle: { type: 'string', required: false }, // 中文标题
    underwaterInfo: { type: 'string', required: false }, // 水下信息
    caseExtraction: { type: 'string', required: false }, // 案例提取
    relatedCompanies: { type: 'string', required: false }, // 涉及公司
    // 付费内容标记
    isPremium: { type: 'boolean', required: false, default: false }, // 是否付费内容，默认免费
    previewLength: { type: 'number', required: false }, // 预览字符数（可选，默认500字）
  },
  computedFields: {
    /**
     * 生成笔记的 slug（URL 路径）
     * 
     * 处理逻辑：
     * 1. 移除路径前缀 '公开内容/笔记/'
     * 2. 移除文件扩展名 '.md'
     */
    slug: {
      type: 'string',
      resolve: (doc) => {
        // 移除路径前缀 '公开内容/笔记/'
        const path = doc._raw.flattenedPath.replace('公开内容/笔记/', '')
        // 移除文件扩展名 '.md'，确保 slug 不包含扩展名
        return path.replace(/\.md$/, '')
      },
    },
  },
}))

export const Page = defineDocumentType(() => ({
  name: 'Page',
  filePathPattern: '公开内容/页面/**/*.md',
  contentType: 'mdx',
  fields: {
    title: { type: 'string', required: true },
  },
  computedFields: {
    /**
     * 生成页面的 slug（URL 路径）
     * 
     * 处理逻辑：
     * 1. 移除路径前缀 '公开内容/页面/'
     * 2. 移除文件扩展名 '.md'
     */
    slug: {
      type: 'string',
      resolve: (doc) => {
        // 移除路径前缀 '公开内容/页面/'
        const path = doc._raw.flattenedPath.replace('公开内容/页面/', '')
        // 移除文件扩展名 '.md'，确保 slug 不包含扩展名
        return path.replace(/\.md$/, '')
      },
    },
  },
}))

export const Newsletter = defineDocumentType(() => ({
  name: 'Newsletter',
  filePathPattern: '公开内容/周报/**/*.md',
  contentType: 'mdx',
  fields: {
    title: { type: 'string', required: true },
    date: { type: 'date', required: true },
    coverImage: { type: 'string', required: false },
    editorialContent: { type: 'mdx', required: false },
    /**
     * 包含的内容项列表（JSON 字符串格式）
     * 每个项包含：
     * - slug: 原始内容的 slug（用于关联）
     * - chineseTitle: 中文标题（可编辑）
     * - underwaterInfo: 水下信息（可编辑）
     * - caseExtraction: 案例提取（可编辑）
     * - relatedCompanies: 涉及公司（可编辑）
     * 
     * 存储格式：JSON 字符串，例如：
     * [{"slug":"xxx","chineseTitle":"中文标题","underwaterInfo":"水下信息","caseExtraction":"案例提取","relatedCompanies":"涉及公司"}]
     */
    includedItems: { type: 'string', required: false },
    tags: { type: 'list', of: { type: 'string' }, default: [] },
    published: { type: 'boolean', default: true },
    // 付费内容标记
    isPremium: { type: 'boolean', required: false, default: false }, // 是否付费内容，默认免费
    previewLength: { type: 'number', required: false }, // 预览字符数（可选，默认500字）
  },
  computedFields: {
    /**
     * 生成周报的 slug（URL 路径）
     * 
     * 处理逻辑：
     * 1. 移除路径前缀 '公开内容/周报/'
     * 2. 移除文件扩展名 '.md'
     * 
     * 例如：
     * - 文件路径: '公开内容/周报/本周有趣的物联网创新.md'
     * - 生成的 slug: '本周有趣的物联网创新'
     */
    slug: {
      type: 'string',
      resolve: (doc) => {
        // 移除路径前缀 '公开内容/周报/'
        const path = doc._raw.flattenedPath.replace('公开内容/周报/', '')
        // 移除文件扩展名 '.md'，确保 slug 不包含扩展名
        return path.replace(/\.md$/, '')
      },
    },
  },
}))

export default makeSource({
  contentDirPath: '内容',
  documentTypes: [News, Note, Page, Newsletter],
  mdx: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [
      rehypeSlug,
      // rehypePrettyCode, // 暂时禁用，因为 shiki 版本兼容性问题
      [rehypeAutolinkHeadings, { behavior: 'wrap' }],
    ],
  },
})
// 触发 Contentlayer 重新生成 - 周报功能已添加 - 更新时间: 2026-01-07
// 修复 slug 生成逻辑，移除 .md 扩展名 - 更新时间: 2026-01-07
// 触发 Contentlayer 重新生成 - 更新时间: 2025-01-14 17:10




