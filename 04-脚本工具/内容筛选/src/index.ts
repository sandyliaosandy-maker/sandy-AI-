#!/usr/bin/env node

import * as path from 'path'
import { loadConfig, getTableFilePath } from './config'
import { parseMarkdownTable } from './table-parser'
import { filterContent } from './filter-engine'
import { syncFiles } from './file-sync'

/**
 * 主函数
 */
async function main() {
  try {
    console.log('🚀 开始内容筛选和同步...\n')

    // 1. 加载配置
    // 获取配置文件路径（相对于当前脚本位置）
    // 在 TypeScript + ts-node 环境中，__dirname 指向编译后的 dist 目录
    // 我们需要使用相对于源文件的路径
    const configPath = path.resolve(__dirname, '../config/filter-config.json')
    console.log(`📋 加载配置文件: ${configPath}`)
    const config = loadConfig(configPath)
    console.log(`✅ 配置加载成功`)
    console.log(`   Obsidian 路径: ${config.obsidianPath}`)
    console.log(`   表格文件: ${config.tableFile}`)
    console.log(`   项目内容路径: ${config.projectContentPath}\n`)

    // 2. 解析表格
    const tableFilePath = getTableFilePath(config)
    console.log(`📊 解析表格文件: ${tableFilePath}`)
    const rows = parseMarkdownTable(tableFilePath)
    console.log(`✅ 解析完成，共 ${rows.length} 条记录\n`)

    // 3. 筛选内容
    console.log(`🔍 应用筛选规则...`)
    const filteredRows = filterContent(rows, config.filters)
    console.log(`✅ 筛选完成，符合条件的有 ${filteredRows.length} 条记录`)
    console.log(`   (过滤了 ${rows.length - filteredRows.length} 条记录)\n`)

    if (filteredRows.length === 0) {
      console.log('⚠️  没有符合条件的内容需要同步')
      return
    }

    // 4. 同步文件
    console.log(`📦 开始同步文件...`)
    const stats = await syncFiles(filteredRows, config)
    
    // 5. 输出结果
    console.log(`\n✅ 同步完成！`)
    console.log(`   总计: ${stats.totalFiles} 个文件`)
    console.log(`   成功: ${stats.syncedFiles} 个文件`)
    console.log(`   跳过: ${stats.skippedFiles} 个文件`)
    
    if (stats.errors.length > 0) {
      console.log(`\n⚠️  错误信息:`)
      stats.errors.forEach((error) => {
        console.log(`   - ${error}`)
      })
    }

    console.log(`\n🎉 所有操作完成！`)
  } catch (error) {
    console.error('\n❌ 发生错误:')
    if (error instanceof Error) {
      console.error(`   ${error.message}`)
      if (error.stack) {
        console.error(`\n堆栈信息:\n${error.stack}`)
      }
    } else {
      console.error(error)
    }
    process.exit(1)
  }
}

// 执行主函数
if (require.main === module) {
  main()
}

