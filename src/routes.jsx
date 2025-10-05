import { createBrowserRouter, Navigate } from 'react-router-dom';
// import { loader } from './App.jsx';

// 大屏幕页面组件 - 管理员/主持人使用
import HomePage from './pages/screen/HomePage'; // 游戏首页
import GameIntro from './pages/screen/GameIntro'; // 游戏介绍
import GameLobby from './pages/screen/GameLobby'; // 游戏大厅
import GameDashboard from './pages/screen/GameDashboard'; // 游戏主界面 (Dashboard)
import GameOver from './pages/screen/GameOver'; // 游戏结束页

// 手机端页面组件 - 玩家扫码后使用
import VotingPage from './pages/mobile/VotingPage'; // 投票页面
import WaitingPage from './pages/mobile/WaitingPage'; // 等待页面
import TimelinePage from './pages/mobile/Timeline'; // 玩家查看时间线的页面
import PersonalSummary from './pages/mobile/PersonalSummary'; // 个人总结页面

// 管理员页面组件
import AdminDashboard from './pages/admin/AdminDashboard'; // 管理员仪表板

// 开发调试页面
import DevControlPanel from './pages/mobile/DevControlPanel.jsx'; // 开发控制面板

// 创建简化的路由配置
import App from './App.jsx';  // 导入 App 组件

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,  // App 作为根布局
    // loader: appLoader, 
    children: [        // 所有页面都是 App 的子路由
      {
        index: true,   // 默认路由
        element: <HomePage />,
      },
      // 将 screen 与 mobile 合并到同一前缀：/game/:gameId
      {
        path: "admin",
        element: <AdminDashboard />
      },
      {
        path: "dev",
        element: <DevControlPanel />
      },
      {
        path: "game/:gameId",
        children: [
          // 大屏入口
          { path: "lobby", element: <GameLobby /> },
          { path: "intro", element: <GameIntro /> },
          { path: "game", element: <GameDashboard /> },
          { path: "gameover", element: <GameOver /> },
          // 手机端页面
          { path: "waiting", element: <WaitingPage /> },
          { path: "voting", element: <VotingPage /> },
          { path: "timeline", element: <TimelinePage /> },
          { path: "summary", element: <PersonalSummary /> },
          // 默认进入等待页面
          {
            index: true,
              element: <Navigate to="waiting" replace />,
          },
        ]
      }
    ]
  },
  // 404 页面 - 跳转到首页
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);

export default router;
