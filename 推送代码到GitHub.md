# 推送代码到 GitHub - 操作指南

## 📋 当前状态

✅ Git 仓库已初始化  
✅ 远程仓库已配置: `https://github.com/sandyliaosandy-maker/sandy-AI-.git`  
✅ 代码已提交（2个提交）  
⏳ 等待推送到 GitHub

## 🚀 推送步骤

### 方法 1: 使用脚本（推荐）

```bash
cd "/Users/luyu/CascadeProjects/Sandy的AI收藏夹"
./快速推送.sh
```

### 方法 2: 手动推送

#### 步骤 1: 配置 Git 用户信息（如果还没有）

```bash
git config --global user.name "你的名字"
git config --global user.email "你的邮箱"
```

#### 步骤 2: 推送到 GitHub

```bash
cd "/Users/luyu/CascadeProjects/Sandy的AI收藏夹"
git push -u origin main
```

## 🔐 认证问题解决

如果推送时要求输入用户名和密码：

### 方案 1: 使用 Personal Access Token（推荐）

1. **生成 Token**
   - 访问 https://github.com/settings/tokens
   - 点击 "Generate new token" > "Generate new token (classic)"
   - 填写名称，选择 `repo` 权限
   - 点击 "Generate token"
   - **复制 token**（只显示一次）

2. **使用 Token 推送**
   - 用户名：你的 GitHub 用户名
   - 密码：粘贴刚才复制的 token

### 方案 2: 使用 SSH（更安全）

1. **生成 SSH 密钥**
   ```bash
   ssh-keygen -t ed25519 -C "your_email@example.com"
   # 按回车使用默认路径
   # 可以设置密码或直接回车
   ```

2. **复制公钥**
   ```bash
   cat ~/.ssh/id_ed25519.pub
   # 复制输出的内容
   ```

3. **添加到 GitHub**
   - 访问 https://github.com/settings/keys
   - 点击 "New SSH key"
   - 粘贴公钥内容
   - 点击 "Add SSH key"

4. **使用 SSH URL**
   ```bash
   git remote set-url origin git@github.com:sandyliaosandy-maker/sandy-AI-.git
   git push -u origin main
   ```

## ✅ 验证推送成功

推送成功后，访问以下 URL 查看你的代码：

**https://github.com/sandyliaosandy-maker/sandy-AI-**

## 📝 后续操作

推送成功后，可以：

1. **在 Vercel 部署**
   - 访问 https://vercel.com
   - 导入 GitHub 仓库
   - 设置 Root Directory: `01-源代码/网站代码`
   - 点击 Deploy

2. **查看部署文档**
   - `02-文档资料/开发文档/部署文档/快速部署指南.md`

## 🆘 常见问题

### 问题 1: 推送失败 - 认证错误

**错误信息**: `fatal: Authentication failed`

**解决方案**: 使用 Personal Access Token 或配置 SSH

### 问题 2: 推送失败 - 证书验证错误

**错误信息**: `error setting certificate verify locations`

**解决方案**:
```bash
# macOS 上修复证书
git config --global http.sslCAInfo /etc/ssl/cert.pem
# 或者禁用 SSL 验证（不推荐，仅用于测试）
git config --global http.sslVerify false
```

### 问题 3: 推送失败 - 远程仓库不存在

**错误信息**: `remote: Repository not found`

**解决方案**:
1. 确认仓库 URL 正确
2. 确认有访问权限
3. 在 GitHub 上创建仓库（如果还没有）

## 📚 相关文档

- [Git 仓库初始化指南](./02-文档资料/开发文档/部署文档/Git仓库初始化指南.md)
- [部署准备指南](./02-文档资料/开发文档/部署文档/部署准备指南.md)




