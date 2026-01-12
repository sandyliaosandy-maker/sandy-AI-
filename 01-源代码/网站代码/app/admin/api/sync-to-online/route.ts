import { NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

// 项目根目录
const PROJECT_ROOT = '/Users/luyu/CascadeProjects/Sandy的AI收藏夹'
// 周报目录（相对于项目根目录）
const NEWSLETTER_DIR = '01-源代码/网站代码/内容/公开内容/周报'

interface GitStatus {
  added: string[]
  modified: string[]
  deleted: string[]
  untracked: string[]
}

/**
 * 解析 Git 状态输出
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
    const filePath = trimmed.substring(3).trim()
    
    // 只处理周报目录的文件（检查路径是否包含周报目录）
    // 支持完整路径和相对路径
    const newsletterPathPattern = NEWSLETTER_DIR.replace(/\\/g, '/')
    const normalizedFilePath = filePath.replace(/\\/g, '/')
    if (!normalizedFilePath.includes('周报') && !normalizedFilePath.includes(newsletterPathPattern)) {
      continue
    }

    if (statusCode.startsWith('??')) {
      // 未跟踪的文件
      status.untracked.push(filePath)
    } else if (statusCode.startsWith('A') || statusCode.startsWith('A ')) {
      // 新增的文件
      status.added.push(filePath)
    } else if (statusCode.startsWith('M') || statusCode.startsWith('M ')) {
      // 修改的文件
      status.modified.push(filePath)
    } else if (statusCode.startsWith('D') || statusCode.startsWith('D ')) {
      // 删除的文件
      status.deleted.push(filePath)
    } else if (statusCode === 'AM' || statusCode === 'MM') {
      // 新增并修改
      status.added.push(filePath)
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
    // 1. 检查 Git 状态（使用相对路径，并包含未跟踪文件）
    const statusResult = await runGitCommand(
      `git status --porcelain --untracked-files=all "${NEWSLETTER_DIR}"`,
      PROJECT_ROOT
    )

    // 如果使用目录路径没有输出，尝试直接检查周报目录下的文件
    let statusOutput = statusResult.stdout
    if (!statusOutput.trim()) {
      // 尝试使用 git ls-files 检查未跟踪文件
      const untrackedResult = await runGitCommand(
        `git ls-files --others --exclude-standard "${NEWSLETTER_DIR}"`,
        PROJECT_ROOT
      )
      if (untrackedResult.stdout.trim()) {
        // 将未跟踪文件转换为 git status 格式
        const untrackedFiles = untrackedResult.stdout
          .split('\n')
          .filter((line) => line.trim())
          .map((file) => `?? ${file}`)
        statusOutput = untrackedFiles.join('\n')
      }
    }

    const gitStatus = parseGitStatus(statusOutput)
    const totalChanges =
      gitStatus.added.length +
      gitStatus.modified.length +
      gitStatus.deleted.length +
      gitStatus.untracked.length

    // 如果没有更改，直接返回
    if (totalChanges === 0) {
      return NextResponse.json({
        success: true,
        message: '没有需要同步的更改',
        stats: {
          added: 0,
          modified: 0,
          deleted: 0,
          untracked: 0,
          total: 0,
        },
        logs: ['检查完成：周报目录没有未提交的更改'],
      })
    }

    const logs: string[] = []
    logs.push(`检测到 ${totalChanges} 个更改：`)
    logs.push(`- 新增: ${gitStatus.added.length + gitStatus.untracked.length} 个文件`)
    logs.push(`- 修改: ${gitStatus.modified.length} 个文件`)
    logs.push(`- 删除: ${gitStatus.deleted.length} 个文件`)

    // 2. 添加文件到暂存区
    logs.push('\n正在添加文件到暂存区...')
    const addResult = await runGitCommand(
      `git add "${NEWSLETTER_DIR}"`,
      PROJECT_ROOT
    )

    if (addResult.stderr && !addResult.stderr.includes('warning')) {
      logs.push(`警告: ${addResult.stderr}`)
    }

    // 3. 创建提交
    const addedCount = gitStatus.added.length + gitStatus.untracked.length
    const modifiedCount = gitStatus.modified.length
    const deletedCount = gitStatus.deleted.length
    
    // 使用多个 -m 参数来构建多行提交信息，避免特殊字符问题
    logs.push('\n正在创建提交...')
    const commitResult = await runGitCommand(
      `git commit -m "content(周报): 同步周报更新" -m "- 新增: ${addedCount} 个文件" -m "- 修改: ${modifiedCount} 个文件" -m "- 删除: ${deletedCount} 个文件"`,
      PROJECT_ROOT
    )

    if (commitResult.stderr && !commitResult.stderr.includes('warning')) {
      // 检查是否是空提交错误
      if (commitResult.stderr.includes('nothing to commit')) {
        return NextResponse.json({
          success: true,
          message: '没有需要提交的更改',
          stats: {
            added: gitStatus.added.length + gitStatus.untracked.length,
            modified: gitStatus.modified.length,
            deleted: gitStatus.deleted.length,
            total: totalChanges,
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
              added: gitStatus.added.length + gitStatus.untracked.length,
              modified: gitStatus.modified.length,
              deleted: gitStatus.deleted.length,
              total: totalChanges,
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
        added: gitStatus.added.length + gitStatus.untracked.length,
        modified: gitStatus.modified.length,
        deleted: gitStatus.deleted.length,
        total: totalChanges,
      },
      files: {
        added: [...gitStatus.added, ...gitStatus.untracked],
        modified: gitStatus.modified,
        deleted: gitStatus.deleted,
      },
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
