# Vercel 部署错误修复说明

## ✅ 已修复的问题

**错误**: `npm 错误：存在冲突的对等依赖项：next@13.5.11`

**原因**: `next-contentlayer@0.3.4` 只支持 Next.js 12/13，但项目使用 Next.js 14.2.0

## 🔧 修复方案

### 1. 创建 `.npmrc` 文件

在 `01-源代码/网站代码/.npmrc` 中添加：

```
legacy-peer-deps=true
```

这样 npm 会自动使用 `--legacy-peer-deps` 安装依赖。

### 2. 更新 `vercel.json`

更新安装命令：

```json
{
  "installCommand": "npm install --legacy-peer-deps"
}
```

## 📝 下一步操作

### 步骤 1: 提交并推送修复

```bash
cd "/Users/luyu/CascadeProjects/Sandy的AI收藏夹"
git add .
git commit -m "修复 Vercel 部署依赖冲突"
git push
```

### 步骤 2: Vercel 自动重新部署

- 推送后，Vercel 会自动检测到新提交
- 触发新的部署
- 这次应该能成功安装依赖

### 步骤 3: 验证部署

1. 等待构建完成（2-5 分钟）
2. 检查构建日志，确认 `npm install` 成功
3. 访问部署的网站验证功能

## 🎯 预期结果

- ✅ `npm install` 成功（使用 legacy-peer-deps）
- ✅ `npm run build` 成功
- ✅ 网站可以正常访问
- ✅ Contentlayer 正常工作

## 📚 相关文档

- [Vercel部署错误修复](./02-文档资料/开发文档/部署文档/Vercel部署错误修复.md)
- [部署准备指南](./02-文档资料/开发文档/部署文档/部署准备指南.md)


