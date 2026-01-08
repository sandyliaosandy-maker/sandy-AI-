#!/bin/bash
# Git 仓库初始化脚本

echo "=========================================="
echo "Git 仓库初始化"
echo "=========================================="
echo ""

cd "$(dirname "$0")"

# 检查是否已经是 git 仓库
if [ -d ".git" ]; then
  echo "✅ 项目已经是 Git 仓库"
  git status
  exit 0
fi

echo "1. 初始化 Git 仓库..."
git init
echo "   ✅ Git 仓库已初始化"
echo ""

echo "2. 配置 .gitignore..."
# 确保根目录有 .gitignore
if [ ! -f ".gitignore" ]; then
  cat > .gitignore << 'EOF'
# 依赖
node_modules/
.pnp
.pnp.js

# 构建产物
.next/
out/
dist/
build/
.contentlayer/

# 环境变量
.env*.local
.env*.production

# 日志
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# 系统文件
.DS_Store
*.pem
.vscode/
.idea/
*.swp
*.swo

# 私有内容
01-源代码/内容源/私有笔记/
**/私有笔记/

# 临时文件
08-临时文件/
*.tmp
*.cache

# Vercel
.vercel

# TypeScript
*.tsbuildinfo
next-env.d.ts
EOF
  echo "   ✅ .gitignore 已创建"
else
  echo "   ✅ .gitignore 已存在"
fi
echo ""

echo "3. 添加文件到暂存区..."
git add .
echo "   ✅ 文件已添加到暂存区"
echo ""

echo "4. 创建初始提交..."
git commit -m "初始提交: Sandy的AI收藏夹项目"
echo "   ✅ 初始提交已创建"
echo ""

echo "=========================================="
echo "✅ Git 仓库初始化完成！"
echo "=========================================="
echo ""
echo "下一步："
echo "1. 在 GitHub 创建新仓库"
echo "2. 运行以下命令连接远程仓库："
echo "   git remote add origin <你的GitHub仓库URL>"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""

