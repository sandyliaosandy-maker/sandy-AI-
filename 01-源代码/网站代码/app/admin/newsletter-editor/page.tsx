'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Upload, X, Save, Loader2 } from 'lucide-react'
import { allNews, allNotes, type News, type Note } from '../../../.contentlayer/generated'

/**
 * 周报编辑器页面
 * 
 * 功能：
 * - 创建和编辑周报
 * - 支持编辑每个包含项的详细信息（中文标题、水下信息、案例提取、涉及公司）
 * - 上传封面图
 * - 编辑卷首语（Markdown 格式）
 */

// 注意：Markdown 编辑器功能
// 如果需要更好的编辑体验，可以安装 @uiw/react-md-editor
// 当前使用简单的 textarea 作为编辑器

/**
 * 包含的内容项接口
 */
interface IncludedItem {
  slug: string // 原始内容的 slug（用于关联）
  chineseTitle: string // 中文标题（可编辑）
  underwaterInfo: string // 水下信息（可编辑）
  caseExtraction: string // 案例提取（可编辑）
  relatedCompanies: string // 涉及公司（可编辑）
}

interface NewsletterFormData {
  title: string
  date: string
  coverImage: string
  editorialContent: string
  includedItems: IncludedItem[] // 改为对象数组
  tags: string[]
  published: boolean
}

export default function NewsletterEditorPage() {
  const router = useRouter()
  const [formData, setFormData] = useState<NewsletterFormData>({
    title: '',
    date: new Date().toISOString().split('T')[0],
    coverImage: '',
    editorialContent: '',
    includedItems: [],
    tags: [],
    published: true,
  })
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [availableContent, setAvailableContent] = useState<(News | Note)[]>([])
  const [searchQuery, setSearchQuery] = useState('')

  // 获取可用的内容列表
  useEffect(() => {
    const allContent = [...allNews, ...allNotes]
    
    // 添加调试日志，确认 Contentlayer 实际生成的数据量
    console.log('[周报编辑器] Contentlayer 数据统计:', {
      allNewsCount: allNews.length,
      allNotesCount: allNotes.length,
      totalContentCount: allContent.length,
      sampleNews: allNews.slice(0, 3).map(n => ({ 
        slug: n.slug, 
        title: n.title,
        chineseTitle: (n as News & { chineseTitle?: string }).chineseTitle 
      })),
      sampleNotes: allNotes.slice(0, 3).map(n => ({ 
        slug: n.slug, 
        title: n.title,
        chineseTitle: (n as Note & { chineseTitle?: string }).chineseTitle 
      })),
    })
    
    // 按日期排序，最新的在前
    const sorted = allContent.sort((a, b) => {
      const dateA = new Date(a.date as string).getTime()
      const dateB = new Date(b.date as string).getTime()
      return dateB - dateA
    })
    setAvailableContent(sorted)
  }, [])

  // 处理封面图上传
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/admin/api/upload-image', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()
      if (result.success) {
        setFormData((prev) => ({ ...prev, coverImage: result.url }))
      } else {
        alert(`上传失败: ${result.error}`)
      }
    } catch (error) {
      console.error('上传错误:', error)
      alert('上传失败，请重试')
    } finally {
      setUploading(false)
    }
  }

  /**
   * 切换内容选择
   * 当选择内容时，创建一个包含详细信息的对象
   * 当取消选择时，从列表中移除
   */
  const toggleContentSelection = (slug: string) => {
    setFormData((prev) => {
      const existingIndex = prev.includedItems.findIndex((item) => item.slug === slug)
      if (existingIndex >= 0) {
        // 如果已选择，取消选择
        return {
          ...prev,
          includedItems: prev.includedItems.filter((item) => item.slug !== slug),
        }
      } else {
        // 如果未选择，添加新项（从原始内容中自动获取字段）
        const content = availableContent.find((item) => item.slug === slug)
        
        // 安全地获取字段值（处理可能为 undefined 的情况）
        const getFieldValue = (field: string): string => {
          if (!content) return ''
          // 使用类型断言和可选链操作符
          const value = (content as Record<string, unknown>)[field]
          return value && typeof value === 'string' ? value : ''
        }
        
        const newItem: IncludedItem = {
          slug,
          // 优先使用 chineseTitle，如果没有则使用 title
          chineseTitle: getFieldValue('chineseTitle') || content?.title || '',
          // 从原始内容中获取其他字段
          underwaterInfo: getFieldValue('underwaterInfo'),
          caseExtraction: getFieldValue('caseExtraction'),
          relatedCompanies: getFieldValue('relatedCompanies'),
        }
        
        // 调试日志（仅在开发环境）
        if (process.env.NODE_ENV === 'development') {
          console.log('[编辑器] 选择内容，自动填充字段:', {
            slug,
            title: content?.title,
            chineseTitle: newItem.chineseTitle,
            underwaterInfo: newItem.underwaterInfo,
            caseExtraction: newItem.caseExtraction,
            relatedCompanies: newItem.relatedCompanies,
            contentKeys: content ? Object.keys(content) : [],
          })
        }
        return {
          ...prev,
          includedItems: [...prev.includedItems, newItem],
        }
      }
    })
  }

  /**
   * 更新包含项的详细信息
   */
  const updateIncludedItem = (slug: string, field: keyof IncludedItem, value: string) => {
    setFormData((prev) => ({
      ...prev,
      includedItems: prev.includedItems.map((item) =>
        item.slug === slug ? { ...item, [field]: value } : item
      ),
    }))
  }

  // 添加标签
  const addTag = (tag: string) => {
    if (tag && !formData.tags.includes(tag)) {
      setFormData((prev) => ({ ...prev, tags: [...prev.tags, tag] }))
    }
  }

  // 移除标签
  const removeTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }))
  }

  // 保存周报
  const handleSave = async () => {
    if (!formData.title.trim()) {
      alert('请输入周报标题')
      return
    }

    setSaving(true)
    try {
      const response = await fetch('/admin/api/save-newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const result = await response.json()
      if (result.success) {
        alert('周报保存成功！')
        router.push('/admin')
      } else {
        alert(`保存失败: ${result.error}`)
      }
    } catch (error) {
      console.error('保存错误:', error)
      alert('保存失败，请重试')
    } finally {
      setSaving(false)
    }
  }

  // 筛选内容 - 改进搜索功能，支持搜索更多字段（包括正文内容）
  const filteredContent = availableContent.filter((item) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    
    // 辅助函数：安全获取字段值
    const getFieldValue = (field: string): string => {
      const value = (item as Record<string, unknown>)[field]
      return value && typeof value === 'string' ? value : ''
    }
    
    // 获取正文内容（body.raw 或 body.code）
    const getBodyContent = (): string => {
      const body = (item as { body?: { raw?: string; code?: string } }).body
      if (!body) return ''
      // 优先使用 raw（原始 Markdown），如果没有则使用 code（编译后的 HTML）
      return (body.raw || body.code || '').toLowerCase()
    }
    
    // 搜索所有相关字段
    return (
      // 英文标题
      item.title.toLowerCase().includes(query) ||
      // 中文标题
      getFieldValue('chineseTitle').toLowerCase().includes(query) ||
      // 摘要（仅 News 类型）
      ('summary' in item && item.summary?.toLowerCase().includes(query)) ||
      // 标签
      item.tags.some((tag: string) => tag.toLowerCase().includes(query)) ||
      // 水下信息
      getFieldValue('underwaterInfo').toLowerCase().includes(query) ||
      // 案例提取
      getFieldValue('caseExtraction').toLowerCase().includes(query) ||
      // 涉及公司
      getFieldValue('relatedCompanies').toLowerCase().includes(query) ||
      // slug（文件路径）
      item.slug.toLowerCase().includes(query) ||
      // 来源
      getFieldValue('source').toLowerCase().includes(query) ||
      // 正文内容（搜索前 2000 字符，避免性能问题）
      getBodyContent().substring(0, 2000).includes(query)
    )
  })

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-neutral-800 mb-4">
          创建周报
        </h1>
        <p className="text-neutral-600 text-lg">
          编辑周报内容，添加封面图和卷首语，选择要包含的知识库内容
        </p>
      </div>

      <div className="space-y-6">
        {/* 基本信息 */}
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
          <h2 className="text-xl font-semibold mb-4 text-neutral-800">基本信息</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-neutral-700">
                周报标题 *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-pink"
                placeholder="例如：Sandy的AI观察报 EP#12"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-neutral-700">
                发布日期
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, date: e.target.value }))
                }
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-pink"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-neutral-700">
                标签
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-primary-blue/20 text-primary-blue rounded-full text-sm flex items-center gap-2"
                  >
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="hover:text-primary-blue/70"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
              <input
                type="text"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addTag(e.currentTarget.value.trim())
                    e.currentTarget.value = ''
                  }
                }}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-pink"
                placeholder="输入标签后按 Enter 添加"
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="published"
                checked={formData.published}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, published: e.target.checked }))
                }
                className="mr-2 h-5 w-5"
              />
              <label htmlFor="published" className="text-sm text-neutral-700">
                立即发布
              </label>
            </div>
          </div>
        </div>

        {/* 封面图 */}
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
          <h2 className="text-xl font-semibold mb-4 text-neutral-800">封面图</h2>
          <div className="space-y-4">
            {formData.coverImage && (
              <div className="relative w-full h-64 rounded-lg overflow-hidden border border-neutral-200">
                <Image
                  src={formData.coverImage}
                  alt="封面图"
                  fill
                  className="object-cover"
                />
                <button
                  onClick={() => setFormData((prev) => ({ ...prev, coverImage: '' }))}
                  className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
            <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-neutral-300 rounded-lg cursor-pointer hover:border-primary-pink transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                disabled={uploading}
              />
              <div className="text-center">
                {uploading ? (
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary-pink" />
                ) : (
                  <>
                    <Upload className="h-8 w-8 mx-auto text-neutral-400 mb-2" />
                    <span className="text-sm text-neutral-600">
                      {formData.coverImage ? '更换封面图' : '上传封面图'}
                    </span>
                  </>
                )}
              </div>
            </label>
          </div>
        </div>

        {/* 内容选择器 */}
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
          <h2 className="text-xl font-semibold mb-4 text-neutral-800">
            选择要包含的内容 ({formData.includedItems.length} 项已选择)
          </h2>
          <div className="mb-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-pink"
              placeholder="搜索内容..."
            />
          </div>
          <div className="max-h-96 overflow-y-auto space-y-2">
            {filteredContent.length === 0 ? (
              <div className="text-center py-8 text-neutral-500">
                没有找到内容
              </div>
            ) : (
              filteredContent.map((item) => {
                const isSelected = formData.includedItems.some((i) => i.slug === item.slug)
                return (
                  <div
                    key={item.slug}
                    className={`flex items-start p-4 border rounded-lg cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-primary-blue/10 border-primary-blue/50'
                        : 'bg-neutral-50 border-neutral-200 hover:border-neutral-300'
                    }`}
                    onClick={() => toggleContentSelection(item.slug)}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleContentSelection(item.slug)}
                      className="mt-1 mr-4 h-5 w-5"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="flex-1">
                      <div className="font-medium text-neutral-800 mb-1">
                        {item.title}
                      </div>
                      {'summary' in item && item.summary && (
                        <div className="text-sm text-neutral-600 mb-2">
                          {item.summary.substring(0, 100)}...
                        </div>
                      )}
                      <div className="flex flex-wrap gap-2 text-xs text-neutral-500">
                        <span>📅 {new Date(item.date as string).toLocaleDateString('zh-CN')}</span>
                        {item.tags.length > 0 && (
                          <span>🏷️ {item.tags.join(', ')}</span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* 已选择内容的详细信息编辑 - 放在内容选择器之后 */}
        {formData.includedItems.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border-2 border-primary-blue p-6">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-neutral-800 mb-2">
                ✏️ 编辑包含内容的详细信息 ({formData.includedItems.length} 项)
              </h2>
              <p className="text-sm text-neutral-600">
                请为每个包含的内容填写详细信息：中文标题、水下信息、案例提取、涉及公司
              </p>
            </div>
            <div className="space-y-6">
              {formData.includedItems.map((includedItem, index) => {
                const originalContent = availableContent.find(
                  (item) => item.slug === includedItem.slug
                )
                return (
                  <div
                    key={includedItem.slug}
                    className="border border-neutral-200 rounded-lg p-4 space-y-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-neutral-800">
                        {index + 1}. {originalContent?.title || includedItem.slug}
                      </h3>
                      <button
                        onClick={() => toggleContentSelection(includedItem.slug)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-neutral-700">
                        中文标题 *
                      </label>
                      <input
                        type="text"
                        value={includedItem.chineseTitle}
                        onChange={(e) =>
                          updateIncludedItem(includedItem.slug, 'chineseTitle', e.target.value)
                        }
                        className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-pink"
                        placeholder="输入中文标题"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-neutral-700">
                        水下信息
                      </label>
                      <textarea
                        value={includedItem.underwaterInfo}
                        onChange={(e) =>
                          updateIncludedItem(includedItem.slug, 'underwaterInfo', e.target.value)
                        }
                        className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-pink"
                        rows={3}
                        placeholder="输入水下信息（隐藏的、不为人知的信息）"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-neutral-700">
                        案例提取
                      </label>
                      <textarea
                        value={includedItem.caseExtraction}
                        onChange={(e) =>
                          updateIncludedItem(includedItem.slug, 'caseExtraction', e.target.value)
                        }
                        className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-pink"
                        rows={3}
                        placeholder="输入案例提取（关键案例或示例）"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-neutral-700">
                        涉及公司
                      </label>
                      <input
                        type="text"
                        value={includedItem.relatedCompanies}
                        onChange={(e) =>
                          updateIncludedItem(includedItem.slug, 'relatedCompanies', e.target.value)
                        }
                        className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-pink"
                        placeholder="输入涉及的公司名称（多个公司用逗号分隔）"
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* 卷首语编辑器 */}
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
          <h2 className="text-xl font-semibold mb-4 text-neutral-800">卷首语</h2>
          <div>
            <textarea
              value={formData.editorialContent}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, editorialContent: e.target.value }))
              }
              className="w-full h-96 px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-pink font-mono text-sm"
              placeholder="输入 Markdown 格式的内容..."
            />
            <p className="mt-2 text-xs text-neutral-500">
              提示：支持 Markdown 格式。如需更好的编辑体验，可以安装 <code className="bg-neutral-100 px-1 py-0.5 rounded">@uiw/react-md-editor</code>
            </p>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex justify-end gap-4">
          <button
            onClick={() => router.back()}
            className="px-6 py-2 border-2 border-neutral-300 text-neutral-700 rounded-lg font-medium hover:bg-neutral-50"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !formData.title.trim()}
            className="px-6 py-2 bg-primary-pink text-white rounded-lg font-medium hover:bg-primary-pink/90 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center"
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                保存中...
              </>
            ) : (
              <>
                <Save className="mr-2 h-5 w-5" />
                保存周报
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

