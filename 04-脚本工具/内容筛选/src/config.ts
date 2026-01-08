import * as fs from 'fs'
import * as path from 'path'
import type { FilterConfig } from './filter-engine'

/**
 * 完整配置接口
 */
export interface AppConfig {
  obsidianPath: string
  tableFile: string
  projectContentPath: string
  filters: FilterConfig
  syncOptions?: {
    preserveStructure?: boolean
    syncAttachments?: boolean
    incrementalSync?: boolean
  }
}

/**
 * 加载配置文件
 * @param configPath 配置文件路径
 * @returns 配置对象
 */
export function loadConfig(configPath: string): AppConfig {
  const fullPath = path.resolve(configPath)
  
  if (!fs.existsSync(fullPath)) {
    throw new Error(`配置文件不存在: ${fullPath}`)
  }

  const configContent = fs.readFileSync(fullPath, 'utf-8')
  const config: AppConfig = JSON.parse(configContent)

  // 验证必需字段
  if (!config.obsidianPath) {
    throw new Error('配置文件中缺少 obsidianPath')
  }
  if (!config.tableFile) {
    throw new Error('配置文件中缺少 tableFile')
  }
  if (!config.projectContentPath) {
    throw new Error('配置文件中缺少 projectContentPath')
  }

  // 解析相对路径为绝对路径
  if (!path.isAbsolute(config.obsidianPath)) {
    config.obsidianPath = path.resolve(path.dirname(fullPath), config.obsidianPath)
  }
  if (!path.isAbsolute(config.projectContentPath)) {
    config.projectContentPath = path.resolve(path.dirname(fullPath), config.projectContentPath)
  }

  return config
}

/**
 * 获取表格文件的完整路径
 */
export function getTableFilePath(config: AppConfig): string {
  return path.join(config.obsidianPath, config.tableFile)
}


