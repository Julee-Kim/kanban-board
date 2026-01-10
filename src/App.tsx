import { RouterProvider } from 'react-router-dom'
import router from '@/router'
import QueryProvider from '@/providers/query/QueryProvider'
import './styles/index.css'

const App = () => {
  return (
    <QueryProvider>
      <RouterProvider router={router} />
    </QueryProvider>
  )
}

export default App
