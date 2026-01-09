import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import App from './App.tsx'

// 개발 환경에서만 MSW 활성화
const enableMocking = async () => {
  if (!import.meta.env.DEV) return

  const { worker } = await import('./mocks/browser')
  await worker.start()
}

enableMocking().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>
  )
})
