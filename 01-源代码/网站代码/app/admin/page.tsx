'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, CheckCircle2, XCircle, Loader2, FileText, Upload } from 'lucide-react'

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

export default function AdminPage() {
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

  // 解析表格
  const handleParseTable = async () => {
    if (!obsidianPath || !tableFile) {
      alert('请填写 Obsidian 路径和表格文件名')
      return
    }

    setLoading(true)
    setSyncResult(null)
    try {
      console.log('[解析表格] 发送请求:', { obsidianPath, tableFile })
      const response = await fetch('/admin/api/parse-table', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ obsidianPath, tableFile }),
      })
      
      console.log('[解析表格] 响应状态:', response.status, response.statusText)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('[解析表格] 响应错误:', errorText)
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }
      
      const result = await response.json()
      console.log('[解析表格] 解析结果:', result)
      
      if (result.success) {
        setRows(result.data)
        setSyncResult(null)
        console.log(`[解析表格] 成功解析 ${result.count || result.data?.length || 0} 条记录`)
      } else {
        const errorMsg = result.error || '未知错误'
        console.error('[解析表格] 解析失败:', errorMsg)
        alert(`解析失败: ${errorMsg}`)
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : '未知错误'
      console.error('[解析表格] 异常:', error)
      alert(`解析失败: ${errorMsg}\n\n请检查：\n1. Obsidian 路径是否正确\n2. 表格文件名是否正确\n3. 文件是否存在\n4. 查看浏览器控制台获取详细错误信息`)
    } finally {
      setLoading(false)
    }
  }

  // 切换选择状态
  const toggleSelection = (index: number) => {
    console.log('切换选择状态，索引:', index, '总行数:', rows.length)
    if (index < 0 || index >= rows.length) {
      console.error('索引超出范围:', index)
      return
    }
    const newRows = rows.map((row, i) => {
      if (i === index) {
        const updated = { ...row, selected: !row.selected }
        console.log('更新行:', i, '新状态:', updated.selected)
        return updated
      }
      return row
    })
    setRows(newRows)
    const newSelectedCount = newRows.filter((r) => r.selected).length
    console.log('更新后的选中数量:', newSelectedCount)
  }

  // 全选/取消全选
  const toggleAll = () => {
    const allSelected = rows.every((row) => row.selected)
    setRows(rows.map((row) => ({ ...row, selected: !allSelected })))
  }

  // 执行同步
  const handleSync = async () => {
    console.log('handleSync 被调用')
    const selectedRows = rows.filter((row) => row.selected)
    console.log('选中的条目数量:', selectedRows.length)
    
    if (selectedRows.length === 0) {
      alert('请至少选择一个条目')
      return
    }

    setSyncing(true)
    setSyncResult(null)
    
    try {
      console.log('发送同步请求...', {
        selectedRowsCount: selectedRows.length,
        obsidianPath,
        projectContentPath: './内容',
      })
      
      const response = await fetch('/admin/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selectedRows,
          config: {
            obsidianPath,
            projectContentPath: './内容',
            syncOptions: {
              preserveStructure: true,
              syncAttachments: true,
              incrementalSync: true,
            },
          },
        }),
      })
      
      console.log('收到响应:', response.status, response.statusText)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('API 错误:', errorText)
        throw new Error(`API 错误: ${response.status} ${errorText}`)
      }
      
      const result = await response.json()
      console.log('解析结果:', result)
      console.log('同步统计:', result.stats)
      
      if (result.success) {
        console.log('同步成功！统计信息:', {
          totalFiles: result.stats?.totalFiles,
          syncedFiles: result.stats?.syncedFiles,
          skippedFiles: result.stats?.skippedFiles,
          errors: result.stats?.errors,
        })
        // 详细输出错误信息
        if (result.stats?.errors && result.stats.errors.length > 0) {
          console.error('同步错误详情:', result.stats.errors)
          result.stats.errors.forEach((error: string, index: number) => {
            console.error(`错误 ${index + 1}:`, error)
          })
        }
        setSyncResult({
          success: true,
          stats: result.stats,
        })
      } else {
        setSyncResult({
          success: false,
          error: result.error,
        })
      }
    } catch (error) {
      console.error('同步错误:', error)
      setSyncResult({
        success: false,
        error: error instanceof Error ? error.message : '未知错误',
      })
    } finally {
      setSyncing(false)
    }
  }

  // 同步到线上
  const handleSyncToOnline = async () => {
    if (!confirm('确定要将周报目录的所有更改同步到线上吗？\n\n这将执行 Git 提交和推送操作。')) {
      return
    }

    setSyncingToOnline(true)
    setSyncToOnlineResult(null)

    try {
      const response = await fetch('/admin/api/sync-to-online', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      const result = await response.json()

      if (result.success) {
        setSyncToOnlineResult({
          success: true,
          message: result.message,
          stats: result.stats,
          files: result.files,
          logs: result.logs,
        })
      } else {
        setSyncToOnlineResult({
          success: false,
          error: result.error,
          logs: result.logs,
        })
      }
    } catch (error) {
      setSyncToOnlineResult({
        success: false,
        error: error instanceof Error ? error.message : '未知错误',
      })
    } finally {
      setSyncingToOnline(false)
    }
  }

  // 筛选显示的行
  const filteredRows = rows.filter((row) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      row.title?.toLowerCase().includes(query) ||
      row.filePath.toLowerCase().includes(query) ||
      row.date.toLowerCase().includes(query) ||
      row.tags?.some((tag) => tag.toLowerCase().includes(query)) ||
      row.summary?.toLowerCase().includes(query)
    )
  })

  const selectedCount = rows.filter((row) => row.selected).length
  
  // 调试：输出选中状态
  if (rows.length > 0) {
    console.log('当前状态:', {
      totalRows: rows.length,
      selectedCount,
      selectedRows: rows.filter((row) => row.selected).map((r) => r.title || r.filePath),
    })
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-neutral-800 mb-4">
              内容管理
            </h1>
            <p className="text-neutral-600 text-lg">
              从 Obsidian 表格中解析内容，手动选择需要同步的条目
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleSyncToOnline}
              disabled={syncingToOnline}
              className="inline-flex items-center px-6 py-3 bg-primary-blue text-white rounded-lg font-medium hover:bg-primary-blue/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {syncingToOnline ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  同步中...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-5 w-5" />
                  同步到线上
                </>
              )}
            </button>
            <button
              onClick={() => {
                if (syncResult?.success && syncResult.stats && syncResult.stats.syncedFiles > 0) {
                  router.push('/admin/newsletter-editor')
                } else {
                  alert('请先执行同步操作，至少同步一个文件后再创建周报')
                }
              }}
              disabled={!syncResult?.success || !syncResult.stats || syncResult.stats.syncedFiles === 0}
              className="inline-flex items-center px-6 py-3 bg-primary-pink text-white rounded-lg font-medium hover:bg-primary-pink/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FileText className="mr-2 h-5 w-5" />
              创建周报
            </button>
          </div>
        </div>
      </div>

      {/* 配置区域 */}
      <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 text-neutral-800">配置</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-neutral-700">
              Obsidian 知识库路径
            </label>
            <input
              type="text"
              value={obsidianPath}
              onChange={(e) => setObsidianPath(e.target.value)}
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-pink focus:border-transparent"
              placeholder="/Users/username/Documents/ObsidianVault"
            />
            <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs font-medium text-blue-800 mb-2">
                📍 如何找到 Obsidian 路径：
              </p>
              <ol className="text-xs text-blue-700 space-y-1 list-decimal list-inside">
                <li>打开 Obsidian 应用</li>
                <li>按 <kbd className="px-1 py-0.5 bg-white border border-blue-300 rounded text-xs">Cmd + ,</kbd> (macOS) 或 <kbd className="px-1 py-0.5 bg-white border border-blue-300 rounded text-xs">Ctrl + ,</kbd> (Windows) 打开设置</li>
                <li>点击左侧的 <strong>"文件与链接"</strong> (Files & Links)</li>
                <li>查看顶部的 <strong>"库文件夹位置"</strong> (Vault location)</li>
                <li>复制显示的完整路径并粘贴到上方输入框</li>
              </ol>
              <p className="text-xs text-blue-600 mt-2">
                💡 提示：路径示例：<code className="bg-white px-1 py-0.5 rounded">/Users/你的用户名/Documents/ObsidianVault</code>
              </p>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-neutral-700">
              表格文件名
            </label>
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
            className="px-6 py-3 bg-primary-pink text-white rounded-lg font-medium transition-all duration-200 hover:bg-primary-pink/90 active:bg-primary-pink/80 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                解析中...
              </>
            ) : (
              '解析表格'
            )}
          </button>
        </div>
      </div>

      {/* 条目列表 */}
      {rows.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
            <div>
              <h2 className="text-xl font-semibold text-neutral-800 mb-1">
                条目列表
              </h2>
              <p className="text-sm text-neutral-600">
                共 {rows.length} 条记录，已选中 {selectedCount} 条
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={toggleAll}
                className="px-4 py-2 border-2 border-primary-pink text-primary-pink rounded-lg font-medium transition-all duration-200 hover:bg-primary-pink/10 active:bg-primary-pink/20 text-sm"
              >
                {rows.every((row) => row.selected) ? '取消全选' : '全选'}
              </button>
              <button
                onClick={async (e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  console.log('执行同步按钮被点击', { 
                    syncing, 
                    selectedCount, 
                    totalRows: rows.length,
                    selectedRows: rows.filter(r => r.selected).map(r => r.title || r.filePath),
                    disabled: syncing || selectedCount === 0 
                  })
                  if (syncing) {
                    console.log('正在同步中，忽略点击')
                    return
                  }
                  if (selectedCount === 0) {
                    alert('请至少选择一个条目')
                    return
                  }
                  await handleSync()
                }}
                disabled={syncing || selectedCount === 0}
                className="px-6 py-2 bg-primary-blue text-white rounded-lg font-medium transition-all duration-200 hover:bg-primary-blue/90 active:bg-primary-blue/80 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center"
                title={selectedCount === 0 ? '请至少选择一个条目' : '执行同步'}
              >
                {syncing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    同步中...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-5 w-5" />
                    执行同步 ({selectedCount})
                  </>
                )}
              </button>
            </div>
          </div>

          {/* 搜索框 */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-pink focus:border-transparent"
                placeholder="搜索标题、路径、日期、标签..."
              />
            </div>
          </div>

          {/* 条目列表 */}
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {filteredRows.length === 0 ? (
              <div className="text-center py-8 text-neutral-500">
                {searchQuery ? '没有找到匹配的条目' : '暂无条目'}
              </div>
            ) : (
              filteredRows.map((row, index) => {
                // 使用 filePath 和 date 作为唯一标识符来查找原始索引
                const originalIndex = rows.findIndex(
                  (r) => r.filePath === row.filePath && r.date === row.date
                )
                const safeIndex = originalIndex >= 0 ? originalIndex : index
                
                return (
                  <div
                    key={`${row.filePath}-${row.date}-${index}`}
                    className={`flex items-start p-4 border rounded-lg transition-all ${
                      row.selected
                        ? 'bg-primary-blue/10 border-primary-blue/50'
                        : 'bg-neutral-50 border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={row.selected || false}
                      onChange={(e) => {
                        e.stopPropagation()
                        console.log('复选框被点击，原始索引:', safeIndex, '当前状态:', row.selected, '总行数:', rows.length)
                        if (safeIndex >= 0 && safeIndex < rows.length) {
                          toggleSelection(safeIndex)
                        } else {
                          console.error('索引无效:', safeIndex)
                        }
                      }}
                      className="mt-1 mr-4 h-5 w-5 text-primary-blue focus:ring-primary-blue border-neutral-300 rounded cursor-pointer"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-neutral-800 mb-1">
                        {row.title || row.filePath}
                      </div>
                      <div className="text-sm text-neutral-600 mb-2">
                        <span className="font-mono">{row.filePath}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-500">
                        <span>📅 {row.date}</span>
                        {row.tags && row.tags.length > 0 && (
                          <span>🏷️ {row.tags.join(', ')}</span>
                        )}
                        {row.score !== undefined && (
                          <span>⭐ {row.score}</span>
                        )}
                        {row.source && <span>📌 {row.source}</span>}
                      </div>
                      {row.summary && (
                        <div className="text-sm text-neutral-600 mt-2 line-clamp-2">
                          {row.summary}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}

      {/* 同步到线上结果 */}
      {syncToOnlineResult && (
        <div
          className={`mt-6 p-6 rounded-lg border ${
            syncToOnlineResult.success
              ? 'bg-green-50 border-green-200'
              : 'bg-red-50 border-red-200'
          }`}
        >
          <div className="flex items-start">
            {syncToOnlineResult.success ? (
              <CheckCircle2 className="h-6 w-6 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
            ) : (
              <XCircle className="h-6 w-6 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <h3
                className={`font-semibold mb-2 ${
                  syncToOnlineResult.success ? 'text-green-800' : 'text-red-800'
                }`}
              >
                {syncToOnlineResult.success ? '同步到线上成功！' : '同步到线上失败'}
              </h3>
              {syncToOnlineResult.success && syncToOnlineResult.stats && (
                <div className="text-sm text-green-700 space-y-1 mb-3">
                  <p>总计: {syncToOnlineResult.stats.total} 个更改</p>
                  <p>新增: {syncToOnlineResult.stats.added} 个文件</p>
                  <p>修改: {syncToOnlineResult.stats.modified} 个文件</p>
                  <p>删除: {syncToOnlineResult.stats.deleted} 个文件</p>
                </div>
              )}
              {syncToOnlineResult.success && syncToOnlineResult.files && (
                <div className="text-sm text-green-700 space-y-2 mb-3">
                  {syncToOnlineResult.files.added.length > 0 && (
                    <div>
                      <p className="font-medium">新增文件:</p>
                      <ul className="list-disc list-inside ml-2 space-y-1">
                        {syncToOnlineResult.files.added.map((file, idx) => (
                          <li key={idx} className="font-mono text-xs break-all">
                            {file}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {syncToOnlineResult.files.modified.length > 0 && (
                    <div>
                      <p className="font-medium">修改文件:</p>
                      <ul className="list-disc list-inside ml-2 space-y-1">
                        {syncToOnlineResult.files.modified.map((file, idx) => (
                          <li key={idx} className="font-mono text-xs break-all">
                            {file}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {syncToOnlineResult.files.deleted.length > 0 && (
                    <div>
                      <p className="font-medium">删除文件:</p>
                      <ul className="list-disc list-inside ml-2 space-y-1">
                        {syncToOnlineResult.files.deleted.map((file, idx) => (
                          <li key={idx} className="font-mono text-xs break-all">
                            {file}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
              {syncToOnlineResult.logs && syncToOnlineResult.logs.length > 0 && (
                <div className="mt-3 pt-3 border-t border-green-200">
                  <p className="font-medium text-sm text-green-800 mb-2">操作日志:</p>
                  <div className="bg-white rounded p-3 max-h-48 overflow-y-auto">
                    <pre className="text-xs text-green-700 whitespace-pre-wrap font-mono">
                      {syncToOnlineResult.logs.join('\n')}
                    </pre>
                  </div>
                </div>
              )}
              {!syncToOnlineResult.success && syncToOnlineResult.error && (
                <div>
                  <p className="text-sm text-red-700 mb-2">{syncToOnlineResult.error}</p>
                  {syncToOnlineResult.logs && syncToOnlineResult.logs.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-red-200">
                      <p className="font-medium text-sm text-red-800 mb-2">错误日志:</p>
                      <div className="bg-white rounded p-3 max-h-48 overflow-y-auto">
                        <pre className="text-xs text-red-700 whitespace-pre-wrap font-mono">
                          {syncToOnlineResult.logs.join('\n')}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 同步结果 */}
      {syncResult && (
        <div
          className={`mt-6 p-6 rounded-lg border ${
            syncResult.success
              ? 'bg-green-50 border-green-200'
              : 'bg-red-50 border-red-200'
          }`}
        >
          <div className="flex items-start">
            {syncResult.success ? (
              <CheckCircle2 className="h-6 w-6 text-green-600 mr-3 mt-0.5" />
            ) : (
              <XCircle className="h-6 w-6 text-red-600 mr-3 mt-0.5" />
            )}
            <div className="flex-1">
              <h3
                className={`font-semibold mb-2 ${
                  syncResult.success ? 'text-green-800' : 'text-red-800'
                }`}
              >
                {syncResult.success ? '同步完成！' : '同步失败'}
              </h3>
              {syncResult.success && syncResult.stats && (
                <div className="text-sm text-green-700 space-y-1">
                  <p>总计: {syncResult.stats.totalFiles} 个文件</p>
                  <p>成功: {syncResult.stats.syncedFiles} 个文件</p>
                  <p>跳过: {syncResult.stats.skippedFiles} 个文件</p>
                  {syncResult.stats.errors.length > 0 && (
                    <div className="mt-3">
                      <p className="font-medium">错误信息:</p>
                      <ul className="list-disc list-inside space-y-1">
                        {syncResult.stats.errors.map((error, idx) => (
                          <li key={idx}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
              {!syncResult.success && syncResult.error && (
                <p className="text-sm text-red-700">{syncResult.error}</p>
              )}
              {syncResult.success && syncResult.stats && syncResult.stats.syncedFiles > 0 && (
                <div className="mt-4 pt-4 border-t border-green-200">
                  <button
                    onClick={() => router.push('/admin/newsletter-editor')}
                    className="inline-flex items-center px-4 py-2 bg-primary-pink text-white rounded-lg font-medium hover:bg-primary-pink/90 transition-colors"
                  >
                    <FileText className="mr-2 h-5 w-5" />
                    创建周报
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
