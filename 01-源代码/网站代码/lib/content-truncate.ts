/**
 * 内容截断工具
 * 智能截取预览内容，在段落边界截断
 */

/**
 * 截断内容到指定长度
 * @param content 原始内容（Markdown 格式）
 * @param maxLength 最大长度（字符数，默认 500）
 * @returns 截断后的内容
 */
export function truncateContent(content: string, maxLength: number = 500): string {
  if (!content || content.length <= maxLength) {
    return content
  }

  // 先尝试在段落边界截断
  const paragraphs = content.split(/\n\n+/)
  let truncated = ''
  let currentLength = 0

  for (const paragraph of paragraphs) {
    if (currentLength + paragraph.length + 2 <= maxLength) {
      truncated += (truncated ? '\n\n' : '') + paragraph
      currentLength += paragraph.length + 2
    } else {
      // 如果当前段落加上去会超过，尝试在句子边界截断
      const remaining = maxLength - currentLength
      if (remaining > 50) {
        // 如果剩余空间足够，尝试截取部分段落
        const sentences = paragraph.split(/([。！？\n])/)
        let sentenceLength = 0
        for (let i = 0; i < sentences.length; i += 2) {
          const sentence = sentences[i] + (sentences[i + 1] || '')
          if (sentenceLength + sentence.length <= remaining) {
            truncated += (truncated ? '\n\n' : '') + sentence
            sentenceLength += sentence.length
          } else {
            break
          }
        }
      }
      break
    }
  }

  // 如果截断后内容为空或太短，使用简单截断
  if (truncated.length < maxLength * 0.3) {
    truncated = content.substring(0, maxLength)
    // 尝试在最后一个句号、问号、感叹号处截断
    const lastPunctuation = Math.max(
      truncated.lastIndexOf('。'),
      truncated.lastIndexOf('！'),
      truncated.lastIndexOf('？'),
      truncated.lastIndexOf('.'),
      truncated.lastIndexOf('!'),
      truncated.lastIndexOf('?')
    )
    if (lastPunctuation > maxLength * 0.5) {
      truncated = truncated.substring(0, lastPunctuation + 1)
    }
  }

  // 确保截断后的内容以标点符号结尾，如果没有则添加省略号
  if (truncated.length < content.length) {
    const lastChar = truncated[truncated.length - 1]
    if (!/[。！？.?!\n]/.test(lastChar)) {
      truncated += '...'
    }
  }

  return truncated
}

/**
 * 检查内容是否被截断
 * @param original 原始内容
 * @param truncated 截断后的内容
 * @returns 是否被截断
 */
export function isTruncated(original: string, truncated: string): boolean {
  return original.length > truncated.length
}
