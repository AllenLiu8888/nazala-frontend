import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'  // 导入 RouterProvider
import './index.css'
import router from './routes.jsx'  // 导入路由配置

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />  {/* 使用 RouterProvider */}
  </StrictMode>,
)
