'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Upload, X, Save, Loader2 } from 'lucide-react'
import dynamic from 'next/dynamic'
// 安全地导入 Contentlayer 数据
interface ContentItem {
  slug: string
  title: string
  date: string
  tags: string[]
  summary?: string
}

let allNews: ContentItem[] = []
let allNotes: ContentItem[] = []
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const contentlayerModule = require('../../../../.contentlayer/generated')
  allNews = (contentlayerModule.allNews as ContentItem[]) || []
  allNotes = (contentlayerModule.allNotes as ContentItem[]) || []
} catch (error) {
  // Contentlayer 数据尚未生成
  allNews = []
  allNotes = []
}

// 动态导入 Markdown 编辑器（避免 SSR 问题）
// 如果 @uiw/react-md-editor 未安装，使用简单的 textarea
let MDEditor: React.ComponentType<{
  value: string
  onChange: (value: string | undefined) => void
  height?: number
}> | null = null
try {
  // @ts-expect-error - 模块可能不存在
  MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false })
} catch (e) {
  // 如果导入失败，使用 textarea
  console.warn('Markdown 编辑器未安装，使用简单编辑器')
}

interface NewsletterFormData {
  title: string
  date: string
  coverImage: string
  editorialContent: string
  includedItems: string[]
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
  const [availableContent, setAvailableContent] = useState<ContentItem[]>([])
  const [searchQuery, setSearchQuery] = useState('')

  // 获取可用的内容列表
  useEffect(() => {
    const allContent = [...allNews, ...allNotes]
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

      const response = await fetch('/管理/api/upload-image', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()
      if (result.success) {
        setFormData((prev) => ({ ...prev, coverImage: result.url }))
      } else {
        alert(`上传失败: ${result.error || '未知错误'}`)
      }
    } catch (error) {
      console.error('上传错误:', error)
      alert('上传失败，请重试')
    } finally {
      setUploading(false)
    }
  }

  // 切换内容选择
  const toggleContentSelection = (slug: string) => {
    setFormData((prev) => {
      const included = prev.includedItems.includes(slug)
        ? prev.includedItems.filter((s) => s !== slug)
        : [...prev.includedItems, slug]
      return { ...prev, includedItems: included }
    })
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
      const response = await fetch('/管理/api/save-newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const result = await response.json()
      if (result.success) {
        alert('周报保存成功！')
        router.push('/管理')
      } else {
        alert(`保存失败: ${result.error || '未知错误'}`)
      }
    } catch (error) {
      console.error('保存错误:', error)
      alert('保存失败，请重试')
    } finally {
      setSaving(false)
    }
  }

  // 筛选内容
  const filteredContent = availableContent.filter((item) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      item.title.toLowerCase().includes(query) ||
      ('summary' in item && item.summary?.toLowerCase().includes(query)) ||
      item.tags.some((tag: string) => tag.toLowerCase().includes(query))
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
                placeholder="例如：增长黑客AI周报 EP#12"
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
                {formData.tags.map((tag: string) => (
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
                placeholder={'输入标签后按 Enter 添加'}
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

        {/* 卷首语编辑器 */}
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
          <h2 className="text-xl font-semibold mb-4 text-neutral-800">卷首语</h2>
          {MDEditor ? (
            <div data-color-mode="light">
              <MDEditor
                value={formData.editorialContent}
                onChange={(value: string | undefined) =>
                  setFormData((prev) => ({ ...prev, editorialContent: value || '' }))
                }
                height={400}
              />
            </div>
          ) : (
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
                提示：支持 Markdown 格式。如需更好的编辑体验，请安装 @uiw/react-md-editor
              </p>
            </div>
          )}
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
                const isSelected = formData.includedItems.includes(item.slug)
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

