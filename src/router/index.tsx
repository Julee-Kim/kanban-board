import { createBrowserRouter, Navigate } from 'react-router-dom'
import BoardPage from '@/pages/board'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/board" replace={true} />,
  },
  {
    path: '/board',
    element: <BoardPage />,
  },
])

export default router
