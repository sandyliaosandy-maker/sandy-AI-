/**
 * 从周报完整标题中拆出「期号标签」与「主标题」。
 * 例：`Sandy观察EP05：副标题` → episodeLabel + headline
 */
export function parseNewsletterDisplayTitle(fullTitle: string): {
  episodeLabel: string | null
  headline: string
} {
  const t = (fullTitle || '').trim()
  const m = t.match(/^(Sandy观察EP\d{1,2})\s*[：:]\s*(.+)$/i)
  if (m) {
    return { episodeLabel: m[1], headline: m[2].trim() }
  }
  const epOnly = t.match(/^(Sandy观察EP\d{1,2})$/i)
  if (epOnly) {
    return { episodeLabel: epOnly[1], headline: t }
  }
  return { episodeLabel: null, headline: t }
}
