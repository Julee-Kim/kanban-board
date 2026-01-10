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

/**
 * 컬럼 생성 API
 * @param title - 생성할 컬럼 제목
 */
export const createColumn = async (title: string): Promise<void> => {
  try {
    const res = await fetch('/api/columns', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title }),
    })

    if (!res.ok) throw new Error('createColumn failed')
  } catch (err) {
    console.error('createColumn fetch error:', err)
    throw err
  }
}

/**
 * 컬럼 제목 수정 API
 * @param columnId - 수정할 컬럼 ID
 * @param title - 새로운 제목
 */
export const updateColumnTitle = async (columnId: string, title: string): Promise<void> => {
  try {
    const res = await fetch(`/api/columns/${columnId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title }),
    })

    if (!res.ok) throw new Error('updateColumnTitle failed')
  } catch (err) {
    console.error('updateColumnTitle fetch error:', err)
    throw err
  }
}
