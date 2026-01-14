/**
 * Next.js 配置文件
 * 
 * 功能：
 * - 集成 Contentlayer 内容管理系统
 * - 配置图片优化选项
 * - 设置 URL 重写规则（支持中文路径重定向）
 * - 配置 Webpack 别名，解决 Contentlayer 生成的类型文件路径问题
 */
const { withContentlayer } = require('next-contentlayer')
const path = require('path')

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Docker 部署支持（standalone 输出）
  output: process.env.DOCKER_BUILD === 'true' ? 'standalone' : undefined,
  
  // 图片优化配置
  images: {
    formats: ['image/avif', 'image/webp'], // 支持的图片格式
    deviceSizes: [640, 750, 828, 1080, 1200], // 设备尺寸断点
    imageSizes: [16, 32, 48, 64, 96, 128, 256], // 图片尺寸
    unoptimized: false, // 启用图片优化
  },
  
  /**
   * URL 重写规则
   * 用于将某些路径重定向到其他路径，保持向后兼容性
   */
  async rewrites() {
    return [
      {
        source: '/attachments/:path*',
        destination: '/attachments/:path*',
      },
      {
        // 将英文路径 /admin 重定向到中文路径 /管理
        source: '/admin',
        destination: '/管理',
      },
      {
        // 将英文路径 /admin/api/:path* 重定向到中文路径 /管理/api/:path*
        // 确保 API 路由也能正确访问
        source: '/admin/api/:path*',
        destination: '/管理/api/:path*',
      },
      {
        /**
         * 将中文路径 /周报/:slug* 重定向到英文路径 /newsletter/:slug*
         * 原因：Next.js 在处理中文路径时可能存在编码问题
         * 这样可以避免中文路径编码导致的 404 错误
         */
        source: '/周报/:slug*',
        destination: '/newsletter/:slug*',
      },
      // 注释掉 /notes 的 rewrite 规则
      // 原因：我们已经创建了实际的 /notes 路由文件，不需要重定向
      // 这样可以避免 rewrite 规则干扰实际路由的匹配
      // {
      //   /**
      //    * 将英文路径 /notes 重定向到中文路径 /笔记
      //    * 原因：提供英文路径别名，避免中文路径编码问题
      //    * 这样可以同时支持 /笔记 和 /notes 两种访问方式
      //    */
      //   source: '/notes',
      //   destination: '/笔记',
      // },
      // {
      //   /**
      //    * 将英文路径 /notes/:id* 重定向到中文路径 /笔记/:id*
      //    * 原因：提供英文路径别名，避免中文路径编码问题
      //    * 这样可以同时支持 /笔记/:id 和 /notes/:id 两种访问方式
      //    */
      //   source: '/notes/:id*',
      //   destination: '/笔记/:id*',
      // },
    ]
  },
  
  /**
   * Webpack 配置
   * 
   * 功能：
   * - 配置模块路径别名，解决 Contentlayer 生成的模块文件解析问题
   * - 添加 ES 模块（.mjs）扩展名解析支持
   * 
   * 问题背景：
   * Contentlayer 在开发模式下生成 `.mjs` 文件（ES 模块格式）以提高 HMR 速度。
   * Next.js 的 webpack 默认无法解析不带扩展名的 `.mjs` 文件导入路径。
   * 
   * 解决方案：
   * 1. 通过别名配置，将导入路径直接指向 `index.mjs` 文件
   * 2. 添加 `.mjs` 到扩展名解析列表，确保 webpack 能够识别 ES 模块文件
   * 
   * @param {import('webpack').Configuration} config - Webpack 配置对象
   * @returns {import('webpack').Configuration} 修改后的配置对象
   */
  webpack: (config) => {
    // 配置模块路径别名
    // 将 `.contentlayer/generated` 和 `contentlayer/generated` 都指向实际生成的 index.mjs 文件
    // 这样代码中使用 `import { ... } from '../.contentlayer/generated'` 时，
    // webpack 会正确解析到 `.contentlayer/generated/index.mjs`
    config.resolve.alias = {
      ...config.resolve.alias,
      '.contentlayer/generated': path.resolve(__dirname, '.contentlayer/generated/index.mjs'),
      'contentlayer/generated': path.resolve(__dirname, '.contentlayer/generated/index.mjs'),
    }
    
    // 添加 .mjs 扩展名解析支持
    // 确保 webpack 能够识别和解析 ES 模块文件（.mjs）
    // 扩展名解析顺序：先尝试已有扩展名，再尝试 .mjs
    config.resolve.extensions = [
      ...config.resolve.extensions,
      '.mjs',
    ]
    
    return config
  },
}

module.exports = withContentlayer(nextConfig)

