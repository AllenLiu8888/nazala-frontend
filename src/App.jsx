import { Outlet } from 'react-router-dom';
// import { Outlet, useLoaderData } from 'react-router-dom';

// export async function loader() {
//   return {
//     return fetch('/api/games');
//   }
// }

function App() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* 页面内容区域 - 这里显示具体的页面组件 */}
      <main className="container mx-auto px-4">
        <Outlet />  {/* 🔑 关键：这里会显示子路由的内容 */}
      </main>
    </div>

  )
}

export default App