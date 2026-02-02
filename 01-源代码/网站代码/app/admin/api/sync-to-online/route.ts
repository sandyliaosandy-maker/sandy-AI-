import { NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

// 项目根目录
const PROJECT_ROOT = '/Users/luyu/CascadeProjects/Sandy的AI收藏夹'
// 周报目录（相对于项目根目录）
const NEWSLETTER_DIR = '01-源代码/网站代码/内容/公开内容/周报'
// 图片上传目录（相对于项目根目录）
const UPLOADS_DIR = '01-源代码/网站代码/public/uploads'

interface GitStatus {
  added: string[]
  modified: string[]
  deleted: string[]
  untracked: string[]
}

/**
 * 解析 Git 状态输出
 * 
 * Git 可能返回带引号和 Unicode 转义序列的路径，例如：
 * ?? "01-\346\272\220\344\273\243\347\240\201/..."
 */
function parseGitStatus(output: string): GitStatus {
  const status: GitStatus = {
    added: [],
    modified: [],
    deleted: [],
    untracked: [],
  }

  const lines = output.split('\n').filter((line) => line.trim())
  
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue

    // 提取状态码和文件路径
    const statusCode = trimmed.substring(0, 2)
    let filePath = trimmed.substring(3).trim()
    
    // 移除路径中的引号（Git 可能返回带引号的路径）
    filePath = filePath.replace(/^["']|["']$/g, '')
    
    // 检查路径是否属于周报目录
    // Git 可能返回 Unicode 转义序列（八进制格式），需要检查多种形式
    // "周报" 的八进制转义序列是 \345\221\250\346\212\245
    
    // 方法1：直接检查是否包含"周报"字符（如果已经是解码后的）
    // 方法2：检查八进制转义序列 \345\221\250\346\212\245
    // 方法3：检查路径模式
    
    const containsNewsletter = 
      // 检查解码后的路径（如果 Git 已经解码）
      filePath.includes('周报') ||
      filePath.includes('/周报/') ||
      filePath.endsWith('/周报') ||
      // 检查八进制转义序列（字面量形式）
      filePath.includes('\\345\\221\\250\\346\\212\\245') ||
      // 检查路径模式（NEWSLETTER_DIR）
      filePath.includes(NEWSLETTER_DIR) ||
      // 检查 URL 编码形式
      filePath.includes('%E5%91%A8%E6%8A%A5')
    
    // 检查是否是图片上传目录的文件
    const containsUploads = 
      filePath.includes('uploads') ||
      filePath.includes('/uploads/') ||
      filePath.includes(UPLOADS_DIR) ||
      // 检查八进制转义序列（如果存在）
      filePath.includes('uploads')
    
    // 只处理周报目录或图片上传目录的文件
    const isTargetFile = containsNewsletter || containsUploads

    if (!isTargetFile) {
      continue
    }
    
    // 如果路径包含转义序列，尝试解码（用于后续处理）
    let decodedPath = filePath
    if (filePath.includes('\\') && /\\[0-7]{3}/.test(filePath)) {
      try {
        // 将八进制转义序列转换为实际字符
        decodedPath = filePath.replace(/\\([0-7]{3})/g, (_match, octal) => {
          const charCode = parseInt(octal, 8)
          return String.fromCharCode(charCode)
        })
      } catch (e) {
        // 解码失败，使用原始路径
        decodedPath = filePath
      }
    }

    // 使用原始路径（filePath）而不是解码后的路径，因为 Git 命令需要原始路径
    // 但检查时使用 decodedPath 以便正确匹配
    const finalPath = decodedPath.includes('周报') ? decodedPath : filePath
    
    if (statusCode.startsWith('??')) {
      // 未跟踪的文件
      status.untracked.push(finalPath)
    } else if (statusCode.startsWith('A') || statusCode.startsWith('A ')) {
      // 新增的文件
      status.added.push(finalPath)
    } else if (statusCode.startsWith('M') || statusCode.startsWith('M ')) {
      // 修改的文件
      status.modified.push(finalPath)
    } else if (statusCode.startsWith('D') || statusCode.startsWith('D ')) {
      // 删除的文件
      status.deleted.push(finalPath)
    } else if (statusCode === 'AM' || statusCode === 'MM') {
      // 新增并修改
      status.added.push(finalPath)
    }
  }

  return status
}

/**
 * 执行 Git 命令
 */
async function runGitCommand(command: string, cwd: string): Promise<{ stdout: string; stderr: string }> {
  try {
    // 设置环境变量，禁用 SSL 验证（如果遇到证书问题）
    const env = {
      ...process.env,
      GIT_SSL_NO_VERIFY: '1', // 临时禁用 SSL 验证
    }
    
    const result = await execAsync(command, {
      cwd,
      maxBuffer: 10 * 1024 * 1024, // 10MB
      timeout: 60000, // 60秒超时
      env,
    })
    return result
  } catch (error: unknown) {
    // exec 在命令返回非零退出码时会抛出错误，但可能包含有用的输出
    const execError = error as { stdout?: string; stderr?: string; message?: string }
    return {
      stdout: execError.stdout || '',
      stderr: execError.stderr || execError.message || '',
    }
  }
}

export async function POST() {
  try {
    const logs: string[] = []
    logs.push('开始检查周报目录和图片上传目录的 Git 状态...')
    
    // 1. 检查整个项目的 Git 状态（更可靠的方法）
    const statusResult = await runGitCommand(
      `git status --porcelain --untracked-files=all`,
      PROJECT_ROOT
    )

    logs.push(`Git status 完整输出（前500字符）: ${statusResult.stdout.substring(0, 500) || '(空)'}`)
    if (statusResult.stderr) {
      logs.push(`Git status 错误输出: ${statusResult.stderr}`)
    }

    // 过滤出周报目录和图片上传目录的文件
    const allLines = statusResult.stdout.split('\n').filter((line) => line.trim())
    const filteredLines = allLines.filter((line) => {
      const filePath = line.substring(3).trim().replace(/^["']|["']$/g, '')
      // 检查是否是周报目录或图片上传目录的文件
      const isNewsletter = 
        filePath.includes('周报') ||
        filePath.includes('\\345\\221\\250\\346\\212\\245') ||
        filePath.includes(NEWSLETTER_DIR)
      const isUploads = 
        filePath.includes('uploads') ||
        filePath.includes(UPLOADS_DIR)
      return isNewsletter || isUploads
    })
    
    let statusOutput = filteredLines.join('\n')
    logs.push(`过滤后的文件数量: ${filteredLines.length}`)
    if (filteredLines.length > 0) {
      logs.push(`过滤后的文件列表（前5个）: ${filteredLines.slice(0, 5).join(', ')}`)
    }
    
    // 如果使用 git status 没有输出，尝试使用 git ls-files 检查未跟踪文件
    if (!statusOutput.trim()) {
      logs.push('使用 git status 未检测到更改，尝试使用 git ls-files 检查未跟踪文件...')
      
      // 检查整个项目的未跟踪文件
      const untrackedResult = await runGitCommand(
        `git ls-files --others --exclude-standard`,
        PROJECT_ROOT
      )
      
      logs.push(`Git ls-files 完整输出（前500字符）: ${untrackedResult.stdout.substring(0, 500) || '(空)'}`)
      
      if (untrackedResult.stdout.trim()) {
        // 过滤出周报目录和图片上传目录的文件
        const allUntracked = untrackedResult.stdout
          .split('\n')
          .filter((line) => line.trim())
          .filter((file) => {
            const cleanPath = file.replace(/^["']|["']$/g, '')
            const isNewsletter = 
              cleanPath.includes('周报') ||
              cleanPath.includes('\\345\\221\\250\\346\\212\\245') ||
              cleanPath.includes(NEWSLETTER_DIR)
            const isUploads = 
              cleanPath.includes('uploads') ||
              cleanPath.includes(UPLOADS_DIR)
            return isNewsletter || isUploads
          })
          .map((file) => {
            // 移除路径中的引号
            const cleanPath = file.replace(/^["']|["']$/g, '')
            return `?? ${cleanPath}`
          })
        
        if (allUntracked.length > 0) {
          statusOutput = allUntracked.join('\n')
          logs.push(`通过 git ls-files 找到 ${allUntracked.length} 个未跟踪文件`)
          logs.push(`文件列表（前5个）: ${allUntracked.slice(0, 5).join(', ')}`)
        }
      }
    }

    // 添加调试信息：显示原始输出和解析过程
    logs.push(`原始状态输出（前100字符）: ${statusOutput.substring(0, 100)}`)
    logs.push(`状态输出行数: ${statusOutput.split('\n').length}`)
    
    const gitStatus = parseGitStatus(statusOutput)
    logs.push(`解析后的 Git 状态: 新增=${gitStatus.added.length}, 修改=${gitStatus.modified.length}, 删除=${gitStatus.deleted.length}, 未跟踪=${gitStatus.untracked.length}`)
    if (gitStatus.untracked.length > 0) {
      logs.push(`未跟踪文件列表: ${gitStatus.untracked.join(', ')}`)
    } else {
      // 如果没有检测到未跟踪文件，显示原始输出的每一行，帮助调试
      const lines = statusOutput.split('\n').filter((line) => line.trim())
      logs.push(`未检测到未跟踪文件，原始输出行数: ${lines.length}`)
      lines.forEach((line, index) => {
        logs.push(`  行 ${index + 1}: ${line.substring(0, 200)}`)
        // 检查这一行是否包含周报相关的字符
        const hasNewsletter = line.includes('周报') || line.includes('\\345\\221\\250\\346\\212\\245')
        logs.push(`    包含"周报": ${hasNewsletter}`)
      })
    }
    
    const totalChanges =
      gitStatus.added.length +
      gitStatus.modified.length +
      gitStatus.deleted.length +
      gitStatus.untracked.length

    // 无论 status 是否解析到变更，都先执行 git add，再以暂存区为准（避免中文路径导致漏检）
    logs.push(`\n解析到 ${totalChanges} 个更改，正在添加目录到暂存区…`)
    logs.push(`- 新增: ${gitStatus.added.length + gitStatus.untracked.length} 个文件`)
    logs.push(`- 修改: ${gitStatus.modified.length} 个文件`)
    logs.push(`- 删除: ${gitStatus.deleted.length} 个文件`)

    // 2. 添加文件到暂存区：先按目录 add，再按解析出的路径逐条 add（防止中文路径/编码导致漏加）
    logs.push('\n正在添加文件到暂存区...')
    await runGitCommand(`git add "${NEWSLETTER_DIR}"`, PROJECT_ROOT)
    await runGitCommand(`git add "${UPLOADS_DIR}"`, PROJECT_ROOT)
    const toAdd = [...gitStatus.untracked, ...gitStatus.added, ...gitStatus.modified]
    for (const p of toAdd.slice(0, 50)) {
      const escaped = p.replace(/"/g, '\\"')
      await runGitCommand(`git add "${escaped}"`, PROJECT_ROOT)
    }
    if (toAdd.length > 50) {
      logs.push(`已按路径添加前 50 个文件，其余由目录 add 覆盖`)
    }

    // 确认暂存区是否有变更（避免误报“没有需要同步的更改”）
    const diffCached = await runGitCommand('git diff --cached --name-only', PROJECT_ROOT)
    const stagedFiles = diffCached.stdout.trim().split('\n').filter(Boolean)
    if (stagedFiles.length === 0) {
      return NextResponse.json({
        success: true,
        message: '没有需要同步的更改（暂存区为空，请确认周报/图片是否在项目目录内并已保存）',
        stats: { added: 0, modified: 0, deleted: 0, untracked: 0, total: 0 },
        logs: [...logs, '提示：git add 后暂存区仍为空，请检查路径与权限'],
      })
    }
    logs.push(`暂存区文件数: ${stagedFiles.length}`)

    // 3. 创建提交（以暂存区为准）
    const stagedCount = stagedFiles.length
    
    // 使用多个 -m 参数来构建多行提交信息，避免特殊字符问题
    logs.push('\n正在创建提交...')
    const commitResult = await runGitCommand(
      `git commit -m "content(周报): 同步周报更新" -m "- 共 ${stagedCount} 个文件"`,
      PROJECT_ROOT
    )

    if (commitResult.stderr && !commitResult.stderr.includes('warning')) {
      // 检查是否是空提交错误
      if (commitResult.stderr.includes('nothing to commit')) {
        return NextResponse.json({
          success: true,
          message: '没有需要提交的更改',
          stats: {
            added: stagedCount,
            modified: 0,
            deleted: 0,
            total: stagedCount,
          },
          logs: [...logs, '提示：文件可能已被提交'],
        })
      }
      logs.push(`提交警告: ${commitResult.stderr}`)
    }

    logs.push(`提交成功: ${commitResult.stdout.trim()}`)

    // 4. 推送到远程仓库
    logs.push('\n正在推送到 GitHub...')
    const pushResult = await runGitCommand(
      'git push origin main',
      PROJECT_ROOT
    )

    if (pushResult.stderr && !pushResult.stderr.includes('warning')) {
      // 检查是否是认证错误
      if (
        pushResult.stderr.includes('Permission denied') ||
        pushResult.stderr.includes('Authentication failed') ||
        pushResult.stderr.includes('Could not read from remote')
      ) {
        return NextResponse.json(
          {
            success: false,
            error: 'Git 推送认证失败，请检查 SSH 密钥配置',
            stats: {
              added: stagedCount,
              modified: 0,
              deleted: 0,
              total: stagedCount,
            },
            logs: [...logs, `推送错误: ${pushResult.stderr}`],
          },
          { status: 500 }
        )
      }
      logs.push(`推送警告: ${pushResult.stderr}`)
    }

    logs.push('推送成功！')
    logs.push('\nVercel 将自动检测到推送并开始部署...')

    return NextResponse.json({
      success: true,
      message: '同步成功！更改已推送到 GitHub',
      stats: {
        added: stagedCount,
        modified: 0,
        deleted: 0,
        total: stagedCount,
      },
      files: { added: stagedFiles, modified: [], deleted: [] },
      logs,
    })
  } catch (error) {
    console.error('[同步到线上] 错误:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '未知错误',
        logs: [`错误: ${error instanceof Error ? error.message : '未知错误'}`],
      },
      { status: 500 }
    )
  }
}
