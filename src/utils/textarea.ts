/**
 * textarea 높이를 내용에 맞게 자동 조절
 * @param textarea - HTMLTextAreaElement 또는 null
 */
export const autoResizeTextarea = (textarea: HTMLTextAreaElement | null) => {
  if (textarea) {
    textarea.style.height = 'auto'
    textarea.style.height = `${textarea.scrollHeight}px`
  }
}
