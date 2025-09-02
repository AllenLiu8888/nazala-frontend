import { createBrowserRouter, Navigate } from 'react-router-dom';
import { getDeviceType } from '../utils/deviceDetection';

// 大屏幕页面组件
import HomePage from '../pages/screen/HomePage'; // 游戏首页
import GameLobby from '../pages/screen/GameLobby'; // 游戏大厅
import GameIntro from '../pages/screen/GameIntro'; // 游戏介绍
import GameDashboard from '../pages/screen/GameDashboard'; //游戏主界面 (Dashboard)
import GameOver from '../pages/screen/GameOver'; // 游戏结束页

// 手机端页面组件
import JoinPage from '../pages/mobile/JoinPage'; // 加入游戏页面
import VotingPage from '../pages/mobile/VotingPage'; // 投票页面
import WaitingPage from '../pages/mobile/WaitingPage'; // 等待页面

// 根路由重定向组件 - 根据设备类型自动跳转
const RootRedirect = () => {
  const deviceType = getDeviceType();
  
  if (deviceType === 'mobile') {
    // 移动设备跳转到加入游戏页面
    return <Navigate to="/mobile/join" replace />;
  } else {
    // 大屏幕设备跳转到首页
    return <Navigate to="/screen/home" replace />;
  }
};

// 创建路由配置
export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootRedirect />,
  },
  // 大屏幕路由组
  {
    path: "/screen",
    children: [
      {
        path: "home",
        element: <HomePage />,
      },
      {
        path: "lobby",
        element: <GameLobby />,
      },
      {
        path: "intro",
        element: <GameIntro />,
      },
      {
        path: "game",
        element: <GameDashboard />,
      },
      {
        path: "gameover",
        element: <GameOver />,
      },
      // 大屏幕默认跳转到首页
      {
        index: true,
        element: <Navigate to="/screen/home" replace />,
      },
    ],
  },
  // 手机端路由组
  {
    path: "/mobile",
    children: [
      {
        path: "join",
        element: <JoinPage />,
      },
      {
        path: "voting",
        element: <VotingPage />,
      },
      {
        path: "waiting",
        element: <WaitingPage />,
      },
      // 手机端默认跳转到加入页面
      {
        index: true,
        element: <Navigate to="/mobile/join" replace />,
      },
    ],
  },
  // 404 页面 - 根据设备类型重定向
  {
    path: "*",
    element: <RootRedirect />,
  },
]);

export default router;
