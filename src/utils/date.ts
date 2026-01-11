/**
 * ISO 날짜 문자열을 '2025년 1월 12일 AM 12:14' 형식으로 변환
 * @param iso - ISO 형식의 날짜 문자열
 */
export const formatDateTime = (iso: string) => {
  if (!iso || iso === '-') return '-'

  const d = new Date(iso)

  // 잘못된 날짜 문자열 방어
  if (isNaN(d.getTime())) return '-'

  // 날짜 구성
  const yyyy = d.getFullYear()
  const month = d.getMonth() + 1 // month는 0부터 시작
  const day = d.getDate()

  // 시간 구성 (12시간제)
  let h = d.getHours()
  const m = String(d.getMinutes()).padStart(2, '0')

  const ap = h < 12 ? 'AM' : 'PM'
  h = h % 12 || 12
  const hh = String(h).padStart(2, '0')

  return `${yyyy}년 ${month}월 ${day}일 ${ap} ${hh}:${m}`
}
