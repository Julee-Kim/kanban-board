/**
 * API 응답 에러 처리
 * 서버 에러 메시지가 있으면 사용, 없으면 fallbackMessage 사용
 */
export const handleApiError = async (res: Response, fallbackMessage: string): Promise<never> => {
  const data = await res.json().catch(() => null)
  const message = data?.error?.message || fallbackMessage
  throw new Error(message)
}
