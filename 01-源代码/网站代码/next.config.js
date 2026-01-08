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
        /**
         * 将中文路径 /周报/:slug* 重定向到英文路径 /newsletter/:slug*
         * 原因：Next.js 在处理中文路径时可能存在编码问题
         * 这样可以避免中文路径编码导致的 404 错误
         */
        source: '/周报/:slug*',
        destination: '/newsletter/:slug*',
      },
    ]
  },
  
  /**
   * Webpack 配置
   * 配置别名，解决 Contentlayer 生成的类型文件路径问题
   */
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      // 将 contentlayer/generated 和 .contentlayer/generated 都指向实际生成的文件
      '.contentlayer/generated': path.resolve(__dirname, '.contentlayer/generated'),
      'contentlayer/generated': path.resolve(__dirname, '.contentlayer/generated'),
    }
    return config
  },
}

module.exports = withContentlayer(nextConfig)

