#!/bin/bash
# 推送脚本 - 简化版

# 切换到脚本所在目录
cd "$(dirname "$0")" || exit 1

echo "=========================================="
echo "推送到 GitHub"
echo "=========================================="
echo ""

# 显示远程仓库
echo "远程仓库:"
git remote -v
echo ""

# 添加所有文件
echo "添加文件..."
git add .

# 检查是否有更改
if [ -n "$(git status --porcelain)" ]; then
  echo "创建提交..."
  git commit -m "更新: $(date '+%Y-%m-%d %H:%M:%S')"
  echo "✅ 提交完成"
  echo ""
fi

# 推送
echo "正在推送到 GitHub..."
if git push -u origin main; then
  echo ""
  echo "=========================================="
  echo "✅ 推送成功！"
  echo "=========================================="
  echo ""
  echo "访问: https://github.com/sandyliaosandy-maker/sandy-AI-"
else
  echo ""
  echo "❌ 推送失败"
  echo ""
  echo "提示: 可能需要 Personal Access Token"
  echo "访问: https://github.com/settings/tokens"
fi




