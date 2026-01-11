# Vercel 部署错误修复指南

## ❌ 错误信息

```
npm 错误：存在冲突的对等依赖项：next@13.5.11
npm 错误 peer next@"^12 || ^13" 来自 next-contentlayer@0.3.4
```

## 🔍 问题原因

- 项目使用 **Next.js 14.2.0**
- `next-contentlayer@0.3.4` 只支持 **Next.js 12 或 13**
- Vercel 在安装依赖时检测到版本冲突

## ✅ 解决方案

### 方案 1: 使用 .npmrc 配置（已实施）

在 `01-源代码/网站代码/` 目录下创建 `.npmrc` 文件：

```
legacy-peer-deps=true
```

这样 Vercel 会自动使用 `--legacy-peer-deps` 安装依赖。

### 方案 2: 在 vercel.json 中配置（已实施）

更新 `vercel.json`：

```json
{
  "installCommand": "npm install --legacy-peer-deps"
}
```

### 方案 3: 在 Vercel 项目设置中配置

1. 访问 Vercel 项目设置
2. 进入 "Settings" > "General"
3. 找到 "Install Command"
4. 设置为：`npm install --legacy-peer-deps`

## 📝 已修复的文件

1. ✅ `01-源代码/网站代码/.npmrc` - 添加 legacy-peer-deps 配置
2. ✅ `01-源代码/网站代码/vercel.json` - 更新安装命令

## 🚀 下一步

1. **提交并推送更改**：
   ```bash
   cd "/Users/luyu/CascadeProjects/Sandy的AI收藏夹"
   git add .
   git commit -m "修复 Vercel 部署依赖冲突"
   git push
   ```

2. **Vercel 会自动重新部署**
   - 推送后，Vercel 会检测到新的提交
   - 自动触发新的部署
   - 这次应该能成功安装依赖

3. **验证部署**
   - 等待构建完成（通常 2-5 分钟）
   - 检查构建日志，确认 `npm install` 成功
   - 访问部署的网站验证功能

## 🔍 验证修复

部署成功后，检查：

- [ ] `npm install` 成功（没有依赖冲突错误）
- [ ] `npm run build` 成功
- [ ] 网站可以正常访问
- [ ] Contentlayer 正常工作

## ⚠️ 注意事项

- `--legacy-peer-deps` 会忽略 peer dependency 冲突
- Contentlayer 在 Next.js 14 上可能有一些兼容性问题
- 如果遇到运行时错误，可能需要考虑替代方案

## 🆘 如果仍然失败

如果使用 `--legacy-peer-deps` 后仍然有问题：

1. **检查构建日志**，查看具体错误
2. **考虑降级 Next.js** 到 13.x（不推荐）
3. **考虑替代方案**：使用 `next-mdx-remote` 或其他内容管理方案


