#!/bin/bash
# 快速推送到 GitHub

cd "$(dirname "$0")"

echo "=========================================="
echo "推送到 GitHub"
echo "=========================================="
echo ""

# 显示远程仓库
echo "远程仓库:"
git remote -v
echo ""

# 添加所有更改
echo "添加文件..."
git add .

# 检查是否有更改
if [ -z "$(git status --porcelain)" ]; then
  echo "✅ 没有需要提交的更改"
else
  echo "创建提交..."
  git commit -m "更新代码: $(date '+%Y-%m-%d %H:%M:%S')"
  echo "✅ 提交完成"
  echo ""
fi

# 推送
echo "推送到 GitHub..."
if git push -u origin main; then
  echo ""
  echo "=========================================="
  echo "✅ 推送成功！"
  echo "=========================================="
  echo ""
  echo "你的代码已推送到:"
  echo "https://github.com/sandyliaosandy-maker/sandy-AI-"
else
  echo ""
  echo "❌ 推送失败"
  echo ""
  echo "可能的原因："
  echo "1. 需要认证（使用 Personal Access Token 或 SSH）"
  echo "2. 网络问题"
  echo ""
  echo "解决方案："
  echo "1. 访问 https://github.com/settings/tokens 生成 token"
  echo "2. 推送时使用 token 作为密码"
  exit 1
fi




