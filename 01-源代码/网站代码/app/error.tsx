'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl text-center">
      <h1 className="text-4xl font-bold text-neutral-800 mb-4">出错了</h1>
      <p className="text-xl text-neutral-600 mb-4">{error.message}</p>
      {error.digest && (
        <p className="text-sm text-neutral-500 mb-8">错误 ID: {error.digest}</p>
      )}
      <button
        onClick={() => reset()}
        className="px-4 py-2 bg-primary-blue text-white rounded hover:bg-primary-pink transition-colors"
      >
        重试
      </button>
    </div>
  )
}

