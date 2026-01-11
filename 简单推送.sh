#!/bin/bash
# 简单推送脚本

# 获取脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "=========================================="
echo "推送到 GitHub"
echo "=========================================="
echo ""

# 显示远程仓库
git remote -v
echo ""

# 添加并提交
git add .
git commit -m "更新: $(date '+%Y-%m-%d %H:%M:%S')" 2>/dev/null || echo "没有新更改"

# 推送
echo "正在推送..."
git push -u origin main

echo ""
echo "完成！"

