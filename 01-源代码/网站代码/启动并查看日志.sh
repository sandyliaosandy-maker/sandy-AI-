#!/bin/bash
# 启动开发服务器并查看日志

cd "/Users/luyu/CascadeProjects/Sandy的AI收藏夹/01-源代码/网站代码"

# 清理端口
echo "清理端口 3002..."
lsof -ti:3002 | xargs kill -9 2>/dev/null
sleep 2

# 启动服务器（前台运行，可以看到所有日志）
echo "启动开发服务器..."
echo "按 Ctrl+C 可以停止服务器"
echo "================================"
npm run dev

