# Git 工作流规范

本文档定义 Git 使用、提交和分支管理规范。

## 提交信息规范

### 1. 约定式提交（Conventional Commits）

```bash
# 格式
<type>(<scope>): <subject>

<body>

<footer>
```

### 2. 提交类型（type）

- `feat`: 新功能
- `fix`: 修复 bug
- `docs`: 文档更新
- `style`: 代码格式（不影响功能）
- `refactor`: 重构
- `perf`: 性能优化
- `test`: 测试相关
- `chore`: 构建/工具相关
- `content`: 内容更新

### 3. 提交示例

```bash
# ✅ 正确 - 新功能
feat(首页): 添加文章列表组件

# ✅ 正确 - 修复 bug
fix(笔记页): 修复图片路径问题

# ✅ 正确 - 文档更新
docs(README): 更新项目说明

# ✅ 正确 - 样式调整
style(按钮): 调整按钮圆角和颜色

# ✅ 正确 - 内容更新
content(新闻): 添加新文章
```

## 分支管理规范

### 1. 分支命名

```bash
# 功能分支
feature/功能名称
feature/home-page

# 修复分支
fix/问题描述
fix/image-path

# 文档分支
docs/文档类型
docs/api-docs
```

### 2. 主分支

- `main`: 主分支，生产环境代码
- `develop`: 开发分支（如需要）

### 3. 分支工作流

```bash
# 1. 创建功能分支
git checkout -b feature/home-page

# 2. 开发并提交
git add .
git commit -m "feat(首页): 添加文章列表"

# 3. 推送到远程
git push origin feature/home-page

# 4. 合并到主分支（通过 Pull Request）
```

## .gitignore 规范

### 1. 基础忽略

```gitignore
# 依赖
node_modules/
.pnp
.pnp.js

# 构建输出
.next/
out/
dist/
build/

# 环境变量
.env*.local
.env*.production

# 日志
*.log
npm-debug.log*

# 编辑器
.vscode/
.idea/
*.swp
*.swo

# 系统文件
.DS_Store
Thumbs.db
```

### 2. 项目特定忽略

```gitignore
# Contentlayer 生成文件
.contentlayer/

# 私有内容
01-源代码/内容源/私有笔记/

# 备份和临时文件
07-备份存档/
08-临时文件/

# 测试覆盖率
coverage/
.nyc_output/
```

## 提交前检查

### 1. 代码检查清单

- [ ] 代码通过 TypeScript 类型检查
- [ ] 代码通过 ESLint 检查
- [ ] 所有测试通过
- [ ] 提交信息符合规范
- [ ] 没有提交敏感信息

### 2. 提交前命令

```bash
# 类型检查
npm run type-check

# 代码检查
npm run lint

# 构建测试
npm run build
```

## 开发流程

### 1. 日常开发流程

```bash
# 1. 拉取最新代码
git pull origin main

# 2. 创建功能分支
git checkout -b feature/功能名称

# 3. 开发
# ... 编写代码 ...

# 4. 暂存更改
git add .

# 5. 提交
git commit -m "feat(功能): 描述"

# 6. 推送
git push origin feature/功能名称

# 7. 创建 Pull Request
```

### 2. 内容更新流程

```bash
# 1. 在 Obsidian 中编辑内容
# 2. Obsidian Git 插件自动提交
# 3. 推送到 GitHub
# 4. Vercel 自动构建和部署
```

## 提交信息最佳实践

### 1. 清晰的提交信息

```bash
# ✅ 正确 - 清晰描述
feat(首页): 添加文章列表和分页功能

# ❌ 错误 - 不够清晰
feat: 更新
fix: 修复
```

### 2. 详细的提交信息

```bash
feat(首页): 添加文章列表组件

- 实现 PostList 组件
- 添加分页功能
- 优化加载性能

Closes #123
```

### 3. 相关提交

```bash
# ✅ 正确 - 相关更改一起提交
feat(按钮): 添加主要和次要样式变体

# ❌ 错误 - 不相关的更改分开提交
feat(按钮): 添加主要样式
feat(卡片): 添加圆角样式
```

## 开发注意事项

### ✅ 正确做法

1. **提交信息规范**：使用约定式提交格式
2. **小步提交**：频繁提交，每次提交一个功能点
3. **清晰描述**：提交信息清晰描述更改内容
4. **分支管理**：使用功能分支开发
5. **代码检查**：提交前进行代码检查

### ❌ 避免做法

1. **不要**提交敏感信息（API 密钥、密码等）
2. **不要**提交构建产物（.next、dist 等）
3. **不要**提交临时文件和备份
4. **不要**使用模糊的提交信息
5. **不要**在 main 分支直接开发

## 最佳实践总结

1. **约定式提交**：使用约定式提交格式
2. **分支管理**：使用功能分支开发
3. **代码检查**：提交前进行代码检查
4. **清晰描述**：提交信息清晰描述更改
5. **小步提交**：频繁提交，每次一个功能点
6. **保护主分支**：通过 Pull Request 合并代码






