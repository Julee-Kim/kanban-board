import type { FetchColumnsRes, ColumnRes, DeleteColumnRes } from '@/features/board/types.ts'
import { handleApiError } from './error'

export const fetchColumns = async (): Promise<FetchColumnsRes> => {
  const res = await fetch('/api/columns')

  if (!res.ok) await handleApiError(res, '컬럼 목록을 불러오는데 실패했습니다.')

  return await res.json()
}

/**
 * 컬럼 생성 API
 * @param title - 생성할 컬럼 제목
 */
export const createColumn = async (title: string): Promise<ColumnRes> => {
  const res = await fetch('/api/columns', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title }),
  })

  if (!res.ok) await handleApiError(res, '컬럼 생성에 실패했습니다.')

  return await res.json()
}

/**
 * 컬럼 제목 수정 API
 * @param columnId - 수정할 컬럼 ID
 * @param title - 새로운 제목
 */
export const updateColumnTitle = async (columnId: string, title: string): Promise<ColumnRes> => {
  const res = await fetch(`/api/columns/${columnId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title }),
  })

  if (!res.ok) await handleApiError(res, '컬럼 제목 수정에 실패했습니다.')

  return await res.json()
}

/**
 * 컬럼 삭제 API
 * @param columnId - 삭제할 컬럼 ID
 * @returns 삭제 결과 (삭제된 카드 수 포함)
 */
export const deleteColumn = async (columnId: string): Promise<DeleteColumnRes> => {
  const res = await fetch(`/api/columns/${columnId}`, {
    method: 'DELETE',
  })

  if (!res.ok) await handleApiError(res, '컬럼 삭제에 실패했습니다.')

  return await res.json()
}
