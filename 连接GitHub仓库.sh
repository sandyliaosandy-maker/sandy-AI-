#!/bin/bash
# 连接 GitHub 仓库脚本

echo "=========================================="
echo "连接 GitHub 仓库"
echo "=========================================="
echo ""

cd "$(dirname "$0")"

# 检查是否是 git 仓库
if [ ! -d ".git" ]; then
  echo "❌ 错误: 当前目录不是 Git 仓库"
  echo "请先运行: ./初始化Git仓库.sh"
  exit 1
fi

# 获取用户输入
echo "请输入你的 GitHub 仓库信息："
echo ""
read -p "GitHub 用户名: " GITHUB_USER
read -p "仓库名称: " REPO_NAME

if [ -z "$GITHUB_USER" ] || [ -z "$REPO_NAME" ]; then
  echo "❌ 错误: 用户名和仓库名不能为空"
  exit 1
fi

# 检查是否已有远程仓库
if git remote get-url origin > /dev/null 2>&1; then
  echo ""
  echo "⚠️  已存在远程仓库，当前 URL:"
  git remote get-url origin
  echo ""
  read -p "是否要更新远程仓库 URL? (y/n): " UPDATE
  if [ "$UPDATE" = "y" ] || [ "$UPDATE" = "Y" ]; then
    git remote set-url origin "https://github.com/${GITHUB_USER}/${REPO_NAME}.git"
    echo "✅ 远程仓库 URL 已更新"
  else
    echo "取消操作"
    exit 0
  fi
else
  # 添加远程仓库
  git remote add origin "https://github.com/${GITHUB_USER}/${REPO_NAME}.git"
  echo "✅ 远程仓库已添加"
fi

# 显示远程仓库信息
echo ""
echo "远程仓库信息:"
git remote -v
echo ""

# 检查分支名称
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ] && [ "$CURRENT_BRANCH" != "master" ]; then
  echo "当前分支: $CURRENT_BRANCH"
  read -p "是否要重命名为 main? (y/n): " RENAME
  if [ "$RENAME" = "y" ] || [ "$RENAME" = "Y" ]; then
    git branch -M main
    echo "✅ 分支已重命名为 main"
  fi
fi

echo ""
echo "=========================================="
echo "✅ 配置完成！"
echo "=========================================="
echo ""
echo "下一步：推送到 GitHub"
echo ""
echo "运行以下命令推送代码："
echo "  git push -u origin main"
echo ""
echo "或者运行："
echo "  ./推送到GitHub.sh"
echo ""

