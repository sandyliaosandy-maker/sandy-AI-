# Vercel 404 错误修复指南

## ❌ 错误现象

访问部署的网站时显示：
```
404: NOT_FOUND
Code: NOT_FOUND
```

## 🔍 问题原因

项目代码在子目录 `01-源代码/网站代码/` 中，但 Vercel 默认从仓库根目录开始构建，导致找不到 Next.js 项目。

## ✅ 解决方案

### 方法 1: 在 Vercel 项目设置中配置（推荐）

1. **访问 Vercel 项目设置**
   - 打开你的 Vercel 项目
   - 点击 "Settings"（设置）

2. **配置 Root Directory**
   - 在左侧菜单找到 "General"（常规）
   - 找到 "Root Directory" 选项
   - 点击 "Edit"（编辑）
   - 输入：`01-源代码/网站代码`
   - 点击 "Save"（保存）

3. **重新部署**
   - 配置保存后，Vercel 会自动触发新的部署
   - 或者手动点击 "Redeploy"

### 方法 2: 在项目根目录创建 vercel.json（备选）

如果方法 1 不行，可以在仓库根目录创建 `vercel.json`：

```json
{
  "buildCommand": "cd 01-源代码/网站代码 && npm run build",
  "devCommand": "cd 01-源代码/网站代码 && npm run dev",
  "installCommand": "cd 01-源代码/网站代码 && npm install --legacy-peer-deps",
  "outputDirectory": "01-源代码/网站代码/.next"
}
```

但这个方法不推荐，因为 Vercel 的 Root Directory 设置更简单可靠。

## 📝 详细步骤

### 步骤 1: 进入项目设置

1. 登录 Vercel
2. 选择项目 `sandy-ai`
3. 点击顶部导航栏的 **"Settings"**

### 步骤 2: 配置 Root Directory

1. 在左侧菜单点击 **"General"**
2. 找到 **"Root Directory"** 部分
3. 点击 **"Edit"** 按钮
4. 在输入框中输入：`01-源代码/网站代码`
5. 点击 **"Save"**

### 步骤 3: 重新部署

配置保存后：
- Vercel 会自动触发新的部署
- 或者点击 "Deployments" 标签页，找到最新的部署，点击 "Redeploy"

### 步骤 4: 验证

等待部署完成后：
- 访问网站，应该能看到首页
- 不再出现 404 错误

## 🎯 配置后的效果

配置 Root Directory 后，Vercel 会：
- ✅ 在 `01-源代码/网站代码/` 目录下执行 `npm install`
- ✅ 在 `01-源代码/网站代码/` 目录下执行 `npm run build`
- ✅ 正确找到 `package.json`、`next.config.js` 等文件
- ✅ 正确找到 `app/`、`components/` 等目录

## ⚠️ 注意事项

1. **Root Directory 路径区分大小写**
   - 确保路径完全正确：`01-源代码/网站代码`

2. **配置后需要重新部署**
   - 修改 Root Directory 后，必须重新部署才能生效

3. **如果路径中有空格或特殊字符**
   - Vercel 会自动处理，但建议使用准确的路径

## 🔍 验证配置

配置完成后，检查：

- [ ] Root Directory 设置为 `01-源代码/网站代码`
- [ ] 重新部署成功
- [ ] 网站可以正常访问（不再 404）
- [ ] 首页显示正常

## 🆘 如果仍然 404

如果配置 Root Directory 后仍然 404：

1. **检查构建日志**
   - 查看是否有构建错误
   - 确认 `npm run build` 是否成功

2. **检查文件结构**
   - 确认 `01-源代码/网站代码/app/page.tsx` 存在
   - 确认 `01-源代码/网站代码/package.json` 存在

3. **检查 Vercel 项目设置**
   - 确认 Framework Preset 是 "Next.js"
   - 确认 Build Command 和 Output Directory 正确

