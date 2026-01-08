# Contentlayer 安装指南

## 安装步骤

### 步骤 1: 安装 Contentlayer 依赖

在终端中执行以下命令：

```bash
cd "/Users/luyu/CascadeProjects/Sandy的AI收藏夹/01-源代码/网站代码"
npm install contentlayer next-contentlayer remark-gfm rehype-pretty-code rehype-slug rehype-autolink-headings
```

**预期输出**:
- 会显示安装进度
- 安装完成后会显示依赖树

### 步骤 2: 验证安装

安装完成后，验证是否成功：

```bash
# 检查 Contentlayer 是否安装
npm list contentlayer

# 检查所有相关依赖
npm list | grep -E "(contentlayer|remark|rehype)"
```

### 步骤 3: 类型检查

运行 TypeScript 类型检查，Contentlayer 会自动生成类型：

```bash
npm run type-check
```

**预期结果**:
- 如果成功，会看到 Contentlayer 生成的类型文件
- 类型检查通过

### 步骤 4: 测试构建

测试 Contentlayer 是否能正常读取内容：

```bash
npm run build
```

**预期结果**:
- Contentlayer 会读取 `内容/公开内容/` 目录下的文件
- 生成 `.contentlayer/generated` 目录
- 构建成功

### 步骤 5: 启动开发服务器

启动开发服务器查看效果：

```bash
npm run dev
```

**预期结果**:
- 开发服务器启动在 http://localhost:3002
- 页面可以正常显示内容

## 故障排查

### 问题 1: 安装失败

**可能原因**:
- 网络问题
- npm 版本过低

**解决方案**:
```bash
# 清理缓存
npm cache clean --force

# 重新安装
npm install
```

### 问题 2: 类型检查失败

**可能原因**:
- Contentlayer 类型未生成

**解决方案**:
```bash
# 清理并重新构建
rm -rf .contentlayer
npm run build
```

### 问题 3: 内容读取失败

**检查清单**:
- [ ] 内容文件是否在 `内容/公开内容/` 目录
- [ ] Frontmatter 格式是否正确
- [ ] 文件路径是否符合配置

## 安装后验证清单

- [ ] Contentlayer 依赖安装成功
- [ ] `npm run type-check` 通过
- [ ] `npm run build` 成功
- [ ] `.contentlayer/generated` 目录存在
- [ ] 开发服务器可以正常启动
- [ ] 页面可以显示内容

## 下一步

安装完成后：
1. 添加更多内容文件到 `内容/公开内容/` 目录
2. 测试内容显示
3. 开始 Phase 2: 内容管理流程



