/**
 * 占位数据（Mock Data）
 * 用于开发阶段，后续将替换为 Contentlayer 数据
 */

import type { MockNews, MockNote } from '../types/mock'

export const mockNews: MockNews[] = [
  {
    id: '1',
    title: 'DeepSeek 商业化分析',
    date: '2025-01-06',
    tags: ['AI', '商业'],
    score: 9.5,
    summary: '分析 DeepSeek 的商业化路径和策略，探讨AI公司的盈利模式',
    content: `# DeepSeek 商业化分析

## 背景

DeepSeek 作为新兴的AI公司，其商业化路径值得关注。

## 商业化策略

1. 技术优势
2. 市场定位
3. 商业模式

## 总结

DeepSeek 的商业化策略值得深入研究...`,
    thumbnail: '/attachments/deepseek-analysis.png',
  },
  {
    id: '2',
    title: 'AI 工具使用指南',
    date: '2025-01-05',
    tags: ['AI', '工具'],
    score: 8.5,
    summary: '介绍最实用的 AI 工具和使用技巧',
    content: `# AI 工具使用指南

## 工具推荐

1. ChatGPT
2. Claude
3. Midjourney

## 使用技巧

...`,
  },
  {
    id: '3',
    title: 'Next.js 14 新特性解析',
    date: '2025-01-04',
    tags: ['前端', 'Next.js'],
    score: 9.0,
    summary: '深入解析 Next.js 14 的新特性和最佳实践',
    content: `# Next.js 14 新特性解析

## App Router

Next.js 14 引入了全新的 App Router...

## 服务端组件

...`,
    thumbnail: '/attachments/nextjs14.png',
  },
  {
    id: '4',
    title: 'TypeScript 严格模式实践',
    date: '2025-01-03',
    tags: ['TypeScript', '开发'],
    score: 8.0,
    summary: '如何在项目中启用和利用 TypeScript 严格模式',
    content: `# TypeScript 严格模式实践

## 为什么使用严格模式

...`,
  },
  {
    id: '5',
    title: 'Tailwind CSS 设计系统',
    date: '2025-01-02',
    tags: ['CSS', '设计'],
    score: 8.5,
    summary: '使用 Tailwind CSS 构建统一的设计系统',
    content: `# Tailwind CSS 设计系统

## 主题配置

...`,
  },
]

export const mockNotes: MockNote[] = [
  {
    id: '1',
    title: '我的小红书笔记：AI 工具推荐',
    date: '2025-01-06',
    tags: ['生活', '分享'],
    source: 'xiaohongshu',
    content: `# AI 工具推荐

最近发现了一些非常好用的 AI 工具，分享给大家...

## 工具列表

1. ChatGPT
2. Claude
3. Midjourney

## 使用心得

...`,
    thumbnail: '/attachments/xiaohongshu-note1.png',
  },
  {
    id: '2',
    title: '个人知识管理心得',
    date: '2025-01-05',
    tags: ['知识管理', '效率'],
    source: 'personal',
    content: `# 个人知识管理心得

分享一些个人知识管理的方法和工具...

## 工具推荐

1. Obsidian
2. Notion
3. Roam Research

...`,
  },
  {
    id: '3',
    title: '开发工作流优化',
    date: '2025-01-04',
    tags: ['开发', '效率'],
    source: 'personal',
    content: `# 开发工作流优化

如何优化开发工作流，提高开发效率...

## 工具链

...`,
  },
]



