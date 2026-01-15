# Vercel 访问限制解决方案

## 🔒 问题描述

Vercel 部署的网站要求登录后才能访问，这不是正常情况。可能的原因：

1. **Password Protection（密码保护）已启用**
2. **项目在 Preview 模式而非 Production 模式**
3. **Vercel 账户设置问题**

## ✅ 解决方案

### 方法 1: 关闭 Password Protection（最常见）

1. **登录 Vercel Dashboard**
   - 访问 https://vercel.com
   - 登录你的账户

2. **进入项目设置**
   - 选择你的项目
   - 点击 **Settings**（设置）

3. **找到 Password Protection**
   - 在左侧菜单找到 **"Deployment Protection"** 或 **"Password Protection"**
   - 或者直接在 **Settings** → **General** 中查找

4. **关闭密码保护**
   - 找到 **"Password Protection"** 选项
   - 确保它是 **关闭（Disabled）** 状态
   - 如果已启用，点击关闭

5. **保存并重新部署**
   - 保存设置
   - 可能需要重新部署才能生效

### 方法 2: 检查部署模式

1. **确认是 Production 部署**
   - 进入 **Deployments** 标签页
   - 确认最新部署显示为 **"Production"** 而不是 **"Preview"**
   - Preview 部署可能有访问限制

2. **使用 Production 域名**
   - Production 域名格式：`your-project.vercel.app`
   - Preview 域名格式：`your-project-git-branch-username.vercel.app`
   - 确保使用 Production 域名访问

### 方法 3: 检查 Vercel 账户设置

1. **检查账户类型**
   - 进入 **Settings** → **General**
   - 确认账户是 **Hobby（免费）** 或 **Pro** 计划
   - 某些企业计划可能有默认访问限制

2. **检查团队设置**
   - 如果项目在团队中，检查团队设置
   - 确保没有团队级别的访问限制

## 🔍 详细步骤（推荐）

### 步骤 1: 检查 Password Protection

1. 登录 Vercel Dashboard
2. 选择项目：`sandy-ai` 或你的项目名
3. 点击顶部 **Settings**
4. 在左侧菜单找到 **"Deployment Protection"**
5. 查看 **"Password Protection"** 部分
6. 如果显示 **"Enabled"**，点击 **"Disable"**

### 步骤 2: 检查部署设置

1. 进入 **Deployments** 标签页
2. 找到最新的部署
3. 确认状态是 **"Production"** 和 **"Ready"**
4. 点击部署，查看详情
5. 确认使用的是 Production 域名

### 步骤 3: 验证访问

1. 使用无痕模式（Incognito）打开浏览器
2. 访问 Production 域名
3. 应该可以直接访问，不需要登录

## 📋 常见问题

### Q: 为什么会有密码保护？

**A**: 可能的原因：
- 之前手动启用了 Password Protection
- 项目在 Preview 分支，默认有保护
- 团队或账户设置导致

### Q: 如何确认已关闭？

**A**: 
- 使用无痕模式访问
- 或使用其他设备/网络访问
- 应该不需要任何登录或密码

### Q: Production 和 Preview 的区别？

**A**:
- **Production**: 主分支（通常是 `main`）的部署，公开访问
- **Preview**: 其他分支或 PR 的部署，可能有访问限制

## 🎯 快速检查清单

- [ ] 登录 Vercel Dashboard
- [ ] 进入项目 Settings
- [ ] 检查 Password Protection 是否关闭
- [ ] 确认使用 Production 部署
- [ ] 使用 Production 域名访问
- [ ] 无痕模式测试访问

## 💡 如果仍然需要登录

如果关闭 Password Protection 后仍然需要登录，可能是：

1. **Next.js 应用内的认证**
   - 检查是否有中间件要求登录
   - 检查 `middleware.ts` 文件
   - 检查路由保护设置

2. **Vercel 团队设置**
   - 检查团队是否有访问限制
   - 联系团队管理员

3. **浏览器缓存**
   - 清除浏览器缓存
   - 使用无痕模式测试

## 🔧 需要帮助？

如果按照上述步骤操作后仍然有问题，请提供：
1. Vercel 项目设置截图（Password Protection 部分）
2. 部署详情截图
3. 访问时的错误信息或提示
