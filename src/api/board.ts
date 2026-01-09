import type { FetchColumnsRes } from '@/features/board/types.ts'

export const fetchColumns = async (): Promise<FetchColumnsRes> => {
  try {
    const res = await fetch('/api/columns')

    if (!res.ok) throw new Error('fetchColumns failed')

    return await res.json()
  } catch (err) {
    console.error('fetchColumns fetch error:', err)
    return { data: [] }
  }
}
