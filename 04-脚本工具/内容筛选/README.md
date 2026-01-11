# Obsidian 表格筛选和内容同步工具

基于 Node.js 实现的内容筛选和同步系统，从 Obsidian 知识库的 Markdown 表格中读取内容元数据，根据日期等条件筛选，只同步符合条件的内容到网站项目。

## 功能特性

- ✅ 解析 Obsidian Markdown 表格
- ✅ 基于日期的智能筛选（支持自定义规则）
- ✅ 支持标签、评分等多条件筛选
- ✅ 文件同步（保持目录结构）
- ✅ 图片附件自动同步
- ✅ 增量同步（只同步变更文件）

## 目录结构

```
内容筛选/
├── src/
│   ├── table-parser.ts      # Markdown 表格解析器
│   ├── filter-engine.ts     # 筛选引擎
│   ├── file-sync.ts         # 文件同步脚本
│   ├── config.ts            # 配置管理
│   └── index.ts             # 主入口
├── config/
│   └── filter-config.json   # 筛选规则配置
├── package.json
├── tsconfig.json
└── README.md
```

## 安装依赖

```bash
cd 04-脚本工具/内容筛选
npm install
```

## 配置

编辑 `config/filter-config.json` 文件：

```json
{
  "obsidianPath": "/path/to/obsidian/vault",
  "tableFile": "内容索引.md",
  "projectContentPath": "../01-源代码/网站代码/内容",
  "filters": {
    "date": {
      "custom": "最近30天"
    }
  },
  "syncOptions": {
    "preserveStructure": true,
    "syncAttachments": true,
    "incrementalSync": true
  }
}
```

### 配置说明

- **obsidianPath**: Obsidian 知识库的绝对路径
- **tableFile**: 包含表格的 Markdown 文件名（相对于 obsidianPath）
- **projectContentPath**: 项目内容目录路径（相对于配置文件）
- **filters**: 筛选规则
  - **date.custom**: 日期筛选规则
    - `"最近30天"` - 最近30天的内容
    - `"2025-01-01 to 2025-01-31"` - 指定日期范围
    - `"2025-01-06"` - 单个日期
  - **date.start**: 开始日期（YYYY-MM-DD）
  - **date.end**: 结束日期（YYYY-MM-DD）
  - **tags**: 标签数组，只要包含任一标签即可
  - **minScore**: 最低评分
- **syncOptions**: 同步选项
  - **preserveStructure**: 是否保持目录结构（默认：true）
  - **syncAttachments**: 是否同步图片附件（默认：true）
  - **incrementalSync**: 是否启用增量同步（默认：true）

## 使用方法

### 方法 1: 直接运行脚本

```bash
cd 04-脚本工具/内容筛选
npm start
```

### 方法 2: 从项目根目录运行

```bash
# 在项目根目录（Sandy的AI收藏夹/）执行
cd 01-源代码/网站代码
npm run sync:content
```

### 方法 3: 监听模式（开发时使用）

```bash
npm run sync:content:watch
```

## 表格格式要求

Obsidian 表格需要包含以下列：

| 文件路径 | 日期 | 标题 | 标签 | 评分 | 摘要 | 来源 |
|---------|------|------|------|------|------|------|
| 公开内容/新闻/文章1.md | 2025-01-06 | 文章标题 | AI,商业 | 9.5 | 摘要内容 | - |

### 必需列

- **文件路径** (或 filePath, file_path): 相对于 Obsidian 知识库的文件路径
- **日期** (或 date): 日期，支持格式：YYYY-MM-DD, YYYY/MM/DD, YYYY.MM.DD

### 可选列

- **标题** (或 title)
- **标签** (或 tags): 逗号或空格分隔
- **评分** (或 score): 数字
- **摘要** (或 summary)
- **来源** (或 source)

## 筛选规则示例

### 最近30天的内容

```json
{
  "filters": {
    "date": {
      "custom": "最近30天"
    }
  }
}
```

### 指定日期范围

```json
{
  "filters": {
    "date": {
      "custom": "2025-01-01 to 2025-01-31"
    }
  }
}
```

### 单个日期

```json
{
  "filters": {
    "date": {
      "custom": "2025-01-06"
    }
  }
}
```

### 使用开始和结束日期

```json
{
  "filters": {
    "date": {
      "start": "2025-01-01",
      "end": "2025-01-31"
    }
  }
}
```

### 组合筛选（日期 + 标签）

```json
{
  "filters": {
    "date": {
      "custom": "最近30天"
    },
    "tags": ["AI", "商业"]
  }
}
```

### 组合筛选（日期 + 评分）

```json
{
  "filters": {
    "date": {
      "custom": "最近30天"
    },
    "minScore": 8.0
  }
}
```

## 输出示例

```
🚀 开始内容筛选和同步...

📋 加载配置文件: /path/to/config/filter-config.json
✅ 配置加载成功
   Obsidian 路径: /path/to/obsidian/vault
   表格文件: 内容索引.md
   项目内容路径: /path/to/project/content

📊 解析表格文件: /path/to/obsidian/vault/内容索引.md
✅ 解析完成，共 100 条记录

🔍 应用筛选规则...
✅ 筛选完成，符合条件的有 25 条记录
   (过滤了 75 条记录)

📦 开始同步文件...

✅ 同步完成！
   总计: 25 个文件
   成功: 25 个文件
   跳过: 0 个文件

🎉 所有操作完成！
```

## 错误处理

脚本会自动处理以下错误情况：

- 配置文件不存在或格式错误
- 表格文件不存在或格式错误
- 文件路径错误或文件不存在
- 文件复制失败

所有错误都会在输出中显示，不会中断整个流程。

## 注意事项

1. **路径配置**: `obsidianPath` 必须使用绝对路径
2. **日期格式**: 支持多种日期格式，但建议使用 YYYY-MM-DD
3. **文件路径**: 表格中的文件路径可以是相对路径（相对于 obsidianPath）或绝对路径
4. **增量同步**: 启用增量同步时，只会同步修改时间更新的文件
5. **附件同步**: 会自动同步 Markdown 文件中引用的图片

## 开发

### 构建

```bash
npm run build
```

### 类型检查

```bash
cd 01-源代码/网站代码
npm run type-check
```

## 故障排查

### 问题 1: 找不到配置文件

**错误**: `配置文件不存在: ...`

**解决方案**: 检查 `config/filter-config.json` 文件是否存在，路径是否正确

### 问题 2: 表格解析失败

**错误**: `未找到表格` 或 `表格文件不存在`

**解决方案**: 
- 检查表格文件路径是否正确
- 确认表格格式正确（使用 `|` 分隔）

### 问题 3: 文件同步失败

**错误**: `文件不存在: ...`

**解决方案**:
- 检查表格中的文件路径是否正确
- 确认文件确实存在于 Obsidian 知识库中

## 相关文档

- [项目迭代计划](../../02-文档资料/需求文档/项目迭代计划.md)
- [内容审查流程](../../02-文档资料/需求文档/内容审查流程.md)





