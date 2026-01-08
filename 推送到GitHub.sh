#!/bin/bash
# 推送到 GitHub 脚本

echo "=========================================="
echo "推送到 GitHub"
echo "=========================================="
echo ""

cd "$(dirname "$0")"

# 检查是否是 git 仓库
if [ ! -d ".git" ]; then
  echo "❌ 错误: 当前目录不是 Git 仓库"
  echo "请先运行: ./初始化Git仓库.sh"
  exit 1
fi

# 检查是否有远程仓库
if ! git remote get-url origin > /dev/null 2>&1; then
  echo "❌ 错误: 未配置远程仓库"
  echo "请先运行: ./连接GitHub仓库.sh"
  exit 1
fi

# 显示当前状态
echo "当前 Git 状态:"
git status --short
echo ""

# 检查是否有未提交的更改
if [ -n "$(git status --porcelain)" ]; then
  echo "发现未提交的更改，是否要提交？"
  read -p "提交信息: " COMMIT_MSG
  
  if [ -z "$COMMIT_MSG" ]; then
    COMMIT_MSG="更新代码"
  fi
  
  echo ""
  echo "添加文件到暂存区..."
  git add .
  
  echo "创建提交..."
  git commit -m "$COMMIT_MSG"
  echo "✅ 提交完成"
  echo ""
fi

# 获取当前分支
CURRENT_BRANCH=$(git branch --show-current)
if [ -z "$CURRENT_BRANCH" ]; then
  CURRENT_BRANCH="main"
fi

# 显示远程仓库信息
echo "远程仓库:"
git remote -v
echo ""

# 确认推送
echo "准备推送到: origin/$CURRENT_BRANCH"
read -p "确认推送? (y/n): " CONFIRM

if [ "$CONFIRM" != "y" ] && [ "$CONFIRM" != "Y" ]; then
  echo "取消推送"
  exit 0
fi

echo ""
echo "正在推送到 GitHub..."
if git push -u origin "$CURRENT_BRANCH"; then
  echo ""
  echo "=========================================="
  echo "✅ 推送成功！"
  echo "=========================================="
  echo ""
  echo "你的代码已推送到 GitHub"
  echo "可以在 GitHub 上查看你的仓库"
else
  echo ""
  echo "❌ 推送失败"
  echo ""
  echo "可能的原因："
  echo "1. 远程仓库不存在，请先在 GitHub 创建仓库"
  echo "2. 认证失败，请检查 GitHub 凭证"
  echo "3. 网络问题"
  echo ""
  echo "解决方案："
  echo "1. 访问 https://github.com/new 创建仓库"
  echo "2. 使用 Personal Access Token 或配置 SSH"
  echo "3. 查看详细错误信息并解决"
  exit 1
fi

