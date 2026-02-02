'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, CheckCircle2, Loader2, FileText, Upload } from 'lucide-react'

interface TableRow {
  filePath: string
  date: string
  title?: string
  tags?: string[]
  score?: number
  summary?: string
  source?: string
  selected: boolean
  [key: string]: unknown
}

export function AdminPageClient() {
  const router = useRouter()
  const [obsidianPath, setObsidianPath] = useState('/Users/luyu/CascadeProjects/陆羽的知识萃取系统V1.0/obsidian_export')
  const [tableFile, setTableFile] = useState('知识萃取库.md')
  const [rows, setRows] = useState<TableRow[]>([])
  const [loading, setLoading] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [syncingToOnline, setSyncingToOnline] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [syncResult, setSyncResult] = useState<{
    success: boolean
    stats?: {
      totalFiles: number
      syncedFiles: number
      skippedFiles: number
      errors: string[]
    }
    error?: string
  } | null>(null)
  const [syncToOnlineResult, setSyncToOnlineResult] = useState<{
    success: boolean
    message?: string
    stats?: {
      added: number
      modified: number
      deleted: number
      total: number
    }
    files?: {
      added: string[]
      modified: string[]
      deleted: string[]
    }
    logs?: string[]
    error?: string
  } | null>(null)

  const handleParseTable = async () => {
    if (!obsidianPath || !tableFile) {
      alert('请填写 Obsidian 路径和表格文件名')
      return
    }
    setLoading(true)
    setSyncResult(null)
    try {
      const response = await fetch('/admin/api/parse-table', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ obsidianPath, tableFile }),
      })
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${await response.text()}`)
      const result = await response.json()
      if (result.success) {
        setRows(result.data)
        setSyncResult(null)
      } else {
        alert(`解析失败: ${result.error || '未知错误'}`)
      }
    } catch (error) {
      alert(`解析失败: ${error instanceof Error ? error.message : '未知错误'}`)
    } finally {
      setLoading(false)
    }
  }

  const toggleSelection = (index: number) => {
    if (index < 0 || index >= rows.length) return
    setRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, selected: !row.selected } : row))
    )
  }

  const toggleAll = () => {
    const allSelected = rows.every((row) => row.selected)
    setRows(rows.map((row) => ({ ...row, selected: !allSelected })))
  }

  const handleSync = async () => {
    const selectedRows = rows.filter((row) => row.selected)
    if (selectedRows.length === 0) {
      alert('请至少选择一个条目')
      return
    }
    setSyncing(true)
    setSyncResult(null)
    try {
      const response = await fetch('/admin/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selectedRows,
          config: {
            obsidianPath,
            projectContentPath: './内容',
            syncOptions: { preserveStructure: true, syncAttachments: true, incrementalSync: true },
          },
        }),
      })
      if (!response.ok) throw new Error(`API 错误: ${response.status}`)
      const result = await response.json()
      setSyncResult(result.success ? { success: true, stats: result.stats } : { success: false, error: result.error })
    } catch (error) {
      setSyncResult({ success: false, error: error instanceof Error ? error.message : '未知错误' })
    } finally {
      setSyncing(false)
    }
  }

  const handleSyncToOnline = async () => {
    if (!confirm('确定要将周报目录的所有更改同步到线上吗？')) return
    setSyncingToOnline(true)
    setSyncToOnlineResult(null)
    try {
      const response = await fetch('/admin/api/sync-to-online', { method: 'POST', headers: { 'Content-Type': 'application/json' } })
      const result = await response.json()
      setSyncToOnlineResult(
        result.success
          ? { success: true, message: result.message, stats: result.stats, files: result.files, logs: result.logs }
          : { success: false, error: result.error, logs: result.logs }
      )
    } catch (error) {
      setSyncToOnlineResult({ success: false, error: error instanceof Error ? error.message : '未知错误' })
    } finally {
      setSyncingToOnline(false)
    }
  }

  const filteredRows = rows.filter((row) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    const get = (field: string): string => (row[field] && typeof row[field] === 'string' ? String(row[field]) : '')
    return (
      row.title?.toLowerCase().includes(query) ||
      get('中文标题').toLowerCase().includes(query) ||
      get('chineseTitle').toLowerCase().includes(query) ||
      row.filePath.toLowerCase().includes(query) ||
      row.date.toLowerCase().includes(query) ||
      row.tags?.some((t) => String(t).toLowerCase().includes(query)) ||
      row.summary?.toLowerCase().includes(query) ||
      row.source?.toLowerCase().includes(query) ||
      get('水下信息').toLowerCase().includes(query) ||
      get('underwaterInfo').toLowerCase().includes(query) ||
      get('案例提取').toLowerCase().includes(query) ||
      get('caseExtraction').toLowerCase().includes(query) ||
      get('涉及公司').toLowerCase().includes(query) ||
      get('relatedCompanies').toLowerCase().includes(query) ||
      Object.keys(row).some((key) => typeof row[key] === 'string' && String(row[key]).toLowerCase().includes(query))
    )
  })

  const selectedCount = rows.filter((r) => r.selected).length

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-neutral-800 mb-4">内容管理</h1>
            <p className="text-neutral-600 text-lg">从 Obsidian 表格中解析内容，手动选择需要同步的条目</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleSyncToOnline}
              disabled={syncingToOnline}
              className="inline-flex items-center px-6 py-3 bg-primary-blue text-white rounded-lg font-medium hover:bg-primary-blue/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {syncingToOnline ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" />同步中...</> : <><Upload className="mr-2 h-5 w-5" />同步到线上</>}
            </button>
            <button
              onClick={() => {
                if (syncResult?.success && syncResult.stats && syncResult.stats.syncedFiles > 0) router.push('/admin/newsletter-editor')
                else alert('请先执行同步操作，至少同步一个文件后再创建周报')
              }}
              disabled={!syncResult?.success || !syncResult?.stats || syncResult.stats.syncedFiles === 0}
              className="inline-flex items-center px-6 py-3 bg-primary-pink text-white rounded-lg font-medium hover:bg-primary-pink/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FileText className="mr-2 h-5 w-5" />创建周报
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 text-neutral-800">配置</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-neutral-700">Obsidian 知识库路径</label>
            <input
              type="text"
              value={obsidianPath}
              onChange={(e) => setObsidianPath(e.target.value)}
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-pink focus:border-transparent"
              placeholder="/Users/username/Documents/ObsidianVault"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-neutral-700">表格文件名</label>
            <input
              type="text"
              value={tableFile}
              onChange={(e) => setTableFile(e.target.value)}
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-pink focus:border-transparent"
              placeholder="内容索引.md"
            />
          </div>
          <button
            onClick={handleParseTable}
            disabled={loading || !obsidianPath || !tableFile}
            className="px-6 py-3 bg-primary-pink text-white rounded-lg font-medium hover:bg-primary-pink/90 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center"
          >
            {loading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" />解析中...</> : '解析表格'}
          </button>
        </div>
      </div>

      {rows.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
            <div>
              <h2 className="text-xl font-semibold text-neutral-800">条目列表</h2>
              <p className="text-sm text-neutral-600">共 {rows.length} 条记录，已选中 {selectedCount} 条</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={toggleAll} className="px-4 py-2 border-2 border-primary-pink text-primary-pink rounded-lg font-medium text-sm">
                {rows.every((r) => r.selected) ? '取消全选' : '全选'}
              </button>
              <button
                onClick={handleSync}
                disabled={syncing || selectedCount === 0}
                className="px-6 py-2 bg-primary-blue text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center"
              >
                {syncing ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" />同步中...</> : <><CheckCircle2 className="mr-2 h-5 w-5" />执行同步 ({selectedCount})</>}
              </button>
            </div>
          </div>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-pink"
                placeholder="搜索标题、路径、日期、标签..."
              />
            </div>
          </div>
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {filteredRows.length === 0 ? (
              <div className="text-center py-8 text-neutral-500">{searchQuery ? '没有找到匹配的条目' : '暂无条目'}</div>
            ) : (
              filteredRows.map((row, index) => {
                const originalIndex = rows.findIndex((r) => r.filePath === row.filePath && r.date === row.date)
                const safeIndex = originalIndex >= 0 ? originalIndex : index
                return (
                  <div
                    key={`${row.filePath}-${row.date}-${index}`}
                    className={`flex items-start p-4 border rounded-lg ${row.selected ? 'bg-primary-blue/10 border-primary-blue/50' : 'bg-neutral-50 border-neutral-200'}`}
                  >
                    <input
                      type="checkbox"
                      checked={!!row.selected}
                      onChange={() => toggleSelection(safeIndex)}
                      className="mt-1 mr-4 h-5 w-5 text-primary-blue focus:ring-primary-blue border-neutral-300 rounded cursor-pointer"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-neutral-800 mb-1">{row.title || row.filePath}</div>
                      <div className="text-sm text-neutral-600 mb-2 font-mono">{row.filePath}</div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-500">
                        <span>📅 {row.date}</span>
                        {row.tags?.length ? <span>🏷️ {row.tags.join(', ')}</span> : null}
                        {row.score !== undefined ? <span>⭐ {row.score}</span> : null}
                        {row.source ? <span>📌 {row.source}</span> : null}
                      </div>
                      {row.summary ? <div className="text-sm text-neutral-600 mt-2 line-clamp-2">{row.summary}</div> : null}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}

      {syncToOnlineResult && (
        <div className={`mt-6 p-6 rounded-lg border ${syncToOnlineResult.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <h3 className={`font-semibold mb-2 ${syncToOnlineResult.success ? 'text-green-800' : 'text-red-800'}`}>
            {syncToOnlineResult.success ? '同步到线上成功！' : '同步到线上失败'}
          </h3>
          {syncToOnlineResult.success && syncToOnlineResult.stats && (
            <div className="text-sm text-green-700 space-y-1">
              <p>总计: {syncToOnlineResult.stats.total} 个更改</p>
              <p>新增: {syncToOnlineResult.stats.added}，修改: {syncToOnlineResult.stats.modified}，删除: {syncToOnlineResult.stats.deleted}</p>
            </div>
          )}
          {!syncToOnlineResult.success && syncToOnlineResult.error && <p className="text-sm text-red-700">{syncToOnlineResult.error}</p>}
        </div>
      )}

      {syncResult && (
        <div className={`mt-6 p-6 rounded-lg border ${syncResult.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <h3 className={`font-semibold mb-2 ${syncResult.success ? 'text-green-800' : 'text-red-800'}`}>{syncResult.success ? '同步完成！' : '同步失败'}</h3>
          {syncResult.success && syncResult.stats && (
            <div className="text-sm text-green-700 space-y-1">
              <p>总计: {syncResult.stats.totalFiles} 个文件，成功: {syncResult.stats.syncedFiles}，跳过: {syncResult.stats.skippedFiles}</p>
              {syncResult.stats.errors?.length ? <ul className="list-disc list-inside mt-2">{syncResult.stats.errors.map((e, i) => <li key={i}>{e}</li>)}</ul> : null}
            </div>
          )}
          {!syncResult.success && syncResult.error && <p className="text-sm text-red-700">{syncResult.error}</p>}
          {syncResult.success && syncResult.stats && syncResult.stats.syncedFiles > 0 && (
            <button onClick={() => router.push('/admin/newsletter-editor')} className="mt-4 inline-flex items-center px-4 py-2 bg-primary-pink text-white rounded-lg font-medium">
              <FileText className="mr-2 h-5 w-5" />创建周报
            </button>
          )}
        </div>
      )}
    </div>
  )
}
