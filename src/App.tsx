import { RouterProvider } from 'react-router-dom'
import router from '@/router'
import QueryProvider from '@/providers/query/QueryProvider'
import { Toaster } from 'sonner'
import './styles/index.css'

const App = () => {
  return (
    <QueryProvider>
      <RouterProvider router={router} />
      <Toaster
        position="top-right"
        richColors
        expand // 여러개가 겹치지 않는 옵션
        toastOptions={{ style: { width: '300px' } }}
      />
    </QueryProvider>
  )
}

export default App
