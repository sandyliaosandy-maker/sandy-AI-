/**
 * 周报内容列表组件
 * 
 * 功能：
 * - 根据周报的 includedItems（JSON 字符串）解析并显示对应的新闻或笔记
 * - 显示每个内容的详细信息：中文标题、水下信息、案例提取、涉及公司
 * - 支持点击跳转到内容详情页
 * 
 * @param includedItems - 包含的内容 JSON 字符串（格式：[{slug, chineseTitle, underwaterInfo, caseExtraction, relatedCompanies}...]）
 */
'use client' // 添加客户端组件标记，以便在浏览器控制台看到日志

import Link from 'next/link'
import { Calendar, Tag, ExternalLink, Building2, Info, Briefcase } from '@/components/界面组件/图标'
import type { News, Note } from '../../.contentlayer/generated'

/**
 * 包含的内容项接口
 */
interface IncludedItem {
  slug: string
  chineseTitle: string
  underwaterInfo?: string
  caseExtraction?: string
  relatedCompanies?: string
}

interface NewsletterContentListProps {
  includedItems: string // JSON 字符串格式的包含内容数组
  allNews: News[] // 所有新闻数据（从父组件传递）
  allNotes: Note[] // 所有笔记数据（从父组件传递）
  sourceUrlMap?: Record<string, string> // slug -> sourceUrl 映射
}

export default function NewsletterContentList({ includedItems, allNews, allNotes, sourceUrlMap = {} }: NewsletterContentListProps) {
  // 调试信息（仅在开发环境）
  if (process.env.NODE_ENV === 'development') {
    console.log('[周报内容列表] 接收到的数据:', {
      type: typeof includedItems,
      length: includedItems?.length,
      hasValue: !!includedItems,
    })
  }
  
  // 解析 JSON 字符串
  let parsedItems: IncludedItem[] = []
  try {
    if (includedItems && includedItems.trim()) {
      // 如果已经是数组，直接使用；如果是字符串，尝试解析
      if (typeof includedItems === 'string') {
        // 先尝试直接解析
        try {
          parsedItems = JSON.parse(includedItems)
        } catch (firstError) {
          // 如果失败，说明字符串中可能包含未转义的控制字符
          // JSON 标准要求控制字符必须被转义（\n, \r, \t 等）
          console.warn('[周报内容列表] 第一次解析失败，尝试清理控制字符:', firstError)
          
          // 改进的 JSON 清理方法：逐字符处理，智能检测转义序列
          // 避免使用负向后顾断言（可能不支持），使用更兼容的方法
          let cleanedJson = ''
          let inEscape = false
          
          for (let i = 0; i < includedItems.length; i++) {
            const char = includedItems[i]
            
            if (inEscape) {
              // 在转义序列中，直接添加字符（包括转义的控制字符）
              cleanedJson += char
              inEscape = false
              continue
            }
            
            if (char === '\\') {
              // 遇到反斜杠
              cleanedJson += char
              // 检查下一个字符是否是转义序列的开始
              if (i + 1 < includedItems.length) {
                const nextChar = includedItems[i + 1]
                // 如果下一个字符是有效的转义字符，标记为转义序列
                if ('"\\/bfnrtu'.includes(nextChar) || /[0-9a-fA-F]/.test(nextChar)) {
                  inEscape = true
                }
              }
              continue
            }
            
            // 处理未转义的控制字符
            const code = char.charCodeAt(0)
            if (code < 32 || code === 127) {
              // 控制字符需要转义
              switch (code) {
                case 0x08: cleanedJson += '\\b'; break // \b
                case 0x09: cleanedJson += '\\t'; break // \t
                case 0x0A: cleanedJson += '\\n'; break // \n
                case 0x0C: cleanedJson += '\\f'; break // \f
                case 0x0D: cleanedJson += '\\r'; break // \r
                default:
                  // 其他控制字符使用 Unicode 转义
                  cleanedJson += '\\u' + ('0000' + code.toString(16)).slice(-4)
              }
            } else {
              cleanedJson += char
            }
          }
          
          try {
            parsedItems = JSON.parse(cleanedJson)
            if (process.env.NODE_ENV === 'development') {
              console.log('[周报内容列表] 清理后解析成功')
            }
          } catch (secondError) {
            // 如果还是失败，抛出错误
            throw new Error(`JSON 解析失败: ${secondError instanceof Error ? secondError.message : String(secondError)}`)
          }
        }
      } else if (Array.isArray(includedItems)) {
        parsedItems = includedItems
      }
      
      if (process.env.NODE_ENV === 'development') {
        console.log('[周报内容列表] 解析成功:', {
          parsedCount: parsedItems.length,
        })
      }
    } else {
      if (process.env.NODE_ENV === 'development') {
        console.warn('[周报内容列表] includedItems 为空或无效')
      }
    }
  } catch (error) {
    console.error('[周报内容列表] 解析 includedItems 失败:', error)
    // 兼容旧格式（字符串数组）
    if (typeof includedItems === 'string' && includedItems.startsWith('[')) {
      try {
        const oldFormat = JSON.parse(includedItems)
        if (Array.isArray(oldFormat) && oldFormat.length > 0 && typeof oldFormat[0] === 'string') {
          // 旧格式：字符串数组，转换为新格式
          parsedItems = oldFormat.map((slug: string) => ({
            slug,
            chineseTitle: '',
          }))
        }
      } catch {
        // 忽略解析错误
      }
    }
  }

  // 空状态：如果没有包含的内容，显示提示信息
  if (!parsedItems || parsedItems.length === 0) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[周报内容列表] 解析结果为空')
    }
    return (
      <div className="text-center py-8 text-neutral-500">
        <p>本期暂无内容</p>
      </div>
    )
  }

  /**
   * 根据 slug 查找对应的原始内容
   * 遍历 parsedItems，在 allNews 和 allNotes 中查找匹配的内容
   */
  const contentsWithDetails: Array<{
    item: IncludedItem
    originalContent?: News | Note
  }> = []
  
  parsedItems.forEach((item) => {
    // 在新闻中查找
    const news = allNews.find((n) => n.slug === item.slug)
    // 在笔记中查找
    const note = allNotes.find((n) => n.slug === item.slug)
    // 如果找到，添加到内容数组
    const originalContent = news || note
    
    // 调试信息（仅在开发环境）
    if (process.env.NODE_ENV === 'development' && !originalContent) {
      console.warn(`[周报内容列表] 未找到原始内容: ${item.slug}`)
    }
    
    contentsWithDetails.push({
      item,
      originalContent,
    })
  })

  if (process.env.NODE_ENV === 'development') {
    console.log('[周报内容列表] 最终结果:', {
      parsedItemsCount: parsedItems.length,
      contentsWithDetailsCount: contentsWithDetails.length,
    })
  }

  // 即使找不到原始内容，也显示已解析的项（使用 includedItems 中的数据）
  // 这样即使原始内容不存在，也能显示周报中配置的信息
  if (contentsWithDetails.length === 0 && parsedItems.length > 0) {
    // 如果解析成功但找不到原始内容，仍然显示解析后的项
    parsedItems.forEach((item) => {
      contentsWithDetails.push({
        item,
        originalContent: undefined,
      })
    })
  }

  // 如果还是没有任何内容，显示提示信息
  if (contentsWithDetails.length === 0) {
    return (
      <div className="text-center py-8 text-neutral-500">
        <p>未找到对应的内容</p>
      </div>
    )
  }

  // 渲染内容列表
  return (
    <div className="space-y-6">
      {contentsWithDetails.map(({ item, originalContent }, index) => {
        // 格式化日期为中文格式（如果有原始内容）
        const formattedDate = originalContent
          ? new Date(originalContent.date as string).toLocaleDateString('zh-CN')
          : ''
        // 判断是新闻还是笔记（新闻有 score 字段）
        // const isNews = originalContent && 'score' in originalContent // 暂时未使用
        
        // 提取原始链接
        // 优先从 sourceUrlMap 中获取（服务端提取的）
        // 其次从 originalContent.sourceUrl 字段获取
        // 最后使用内部链接
        let originalUrl: string | null = null
        
        if (sourceUrlMap[item.slug]) {
          originalUrl = sourceUrlMap[item.slug]
        } else if (originalContent && 'sourceUrl' in originalContent && originalContent.sourceUrl) {
          originalUrl = originalContent.sourceUrl as string
        }
        
        // 如果有原始链接，使用原始链接；否则使用内部链接
        const linkUrl = originalUrl || `/笔记/${item.slug}`
        const isExternalLink = !!originalUrl

        return (
          <article
            key={item.slug}
            className="border border-neutral-200 rounded-lg p-6 hover:shadow-md transition-shadow"
          >
            <div className="space-y-4">
              {/* 标题和序号 */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3 flex-1">
                  <span className="text-3xl font-bold text-primary-blue flex-shrink-0">
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-neutral-800 mb-1">
                      {item.chineseTitle || originalContent?.title || item.slug}
                    </h3>
                    {originalContent && (
                      <div className="flex flex-wrap items-center gap-3 text-sm text-neutral-500">
                        {formattedDate && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <time>{formattedDate}</time>
                          </div>
                        )}
                        {originalContent.tags.length > 0 && (
                          <div className="flex items-center gap-2 flex-wrap">
                            <Tag className="h-4 w-4" />
                            {originalContent.tags.map((tag: string) => (
                              <span
                                key={tag}
                                className="px-2 py-1 bg-neutral-100 rounded-full"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                {isExternalLink ? (
                  <a
                    href={linkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-primary-blue hover:text-primary-pink transition-colors text-sm font-medium flex-shrink-0"
                  >
                    阅读全文
                    <ExternalLink className="h-4 w-4" />
                  </a>
                ) : (
                  <Link
                    href={linkUrl}
                    className="flex items-center gap-1 text-primary-blue hover:text-primary-pink transition-colors text-sm font-medium flex-shrink-0"
                  >
                    阅读全文
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                )}
              </div>

              {/* 水下信息 - 始终显示，即使为空也显示占位符 */}
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                <div className="flex items-start gap-2">
                  <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-blue-900 mb-1">水下信息</h4>
                    {item.underwaterInfo ? (
                      <p className="text-blue-800 text-sm leading-relaxed whitespace-pre-wrap">
                        {item.underwaterInfo}
                      </p>
                    ) : (
                      <p className="text-blue-600/60 text-sm italic">暂无水下信息</p>
                    )}
                  </div>
                </div>
              </div>

              {/* 案例提取 - 始终显示，即使为空也显示占位符 */}
              <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded">
                <div className="flex items-start gap-2">
                  <Briefcase className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-green-900 mb-1">案例提取</h4>
                    {item.caseExtraction ? (
                      <p className="text-green-800 text-sm leading-relaxed whitespace-pre-wrap">
                        {item.caseExtraction}
                      </p>
                    ) : (
                      <p className="text-green-600/60 text-sm italic">暂无案例提取</p>
                    )}
                  </div>
                </div>
              </div>

              {/* 涉及公司 - 始终显示，即使为空也显示占位符 */}
              <div className="bg-purple-50 border-l-4 border-purple-400 p-4 rounded">
                <div className="flex items-start gap-2">
                  <Building2 className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-purple-900 mb-1">涉及公司</h4>
                    {item.relatedCompanies && item.relatedCompanies.trim() ? (
                      <p className="text-purple-800 text-sm">
                        {item.relatedCompanies.split(',').map((company, i) => (
                          <span
                            key={i}
                            className="inline-block px-3 py-1 bg-purple-100 rounded-full mr-2 mb-2"
                          >
                            {company.trim()}
                          </span>
                        ))}
                      </p>
                    ) : (
                      <p className="text-purple-600/60 text-sm italic">暂无涉及公司</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </article>
        )
      })}
    </div>
  )
}

