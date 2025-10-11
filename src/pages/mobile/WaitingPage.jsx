import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { gameApi } from '../../services/gameApi';
import { GAME_STATUS } from '../../constants/constants';

const WaitingPage = () => {
  // 从 URL 参数获取真实的 gameId
  const { gameId } = useParams();
  const navigate = useNavigate();
  const hasInitialized = useRef(false);
  const [gameStatus, setGameStatus] = useState(null);

  // 自动创建/获取用户
  const createPlayer = async (gameId) => {
    try {
      console.log('🎮 开始处理用户，游戏ID:', gameId);
      
      // 获取现有的 authToken（如果有的话）
      const existingToken = localStorage.getItem('authToken');
      console.log('🔍 现有 authToken:', existingToken);
      
      // 直接调用API，让后端决定是返回现有用户还是创建新用户
      const result = await gameApi.joinGame(gameId, existingToken);
      console.log('✅ 用户处理成功:', result, gameId);
      localStorage.setItem('authToken', result.player.auth_token);
      localStorage.setItem('playerId', result.player.id);
      console.log('💾 authToken，playerId已保存', result.player.auth_token);
      
    } catch (error) {
      console.error('❌ 处理用户失败:', error, gameId);
    }
  };

  //检测游戏是否开始：如果游戏已经开始，则跳转到投票页
  const checkGameStarted = async () => {
    try {
      const gameData = await gameApi.getGameDetail(gameId);
      console.log('🔍 完整响应:', gameData);
      const game = gameData.game;
      console.log('🎮 游戏对象:', game);
      console.log('🎮 游戏状态:', game.status, '类型:', typeof game.status);
      

      // 将API获取的游戏状态保存到state中
      setGameStatus(game.status);
      if (game && game.status === GAME_STATUS.IN_PROGRESS) {
        console.log('✅ 条件满足，准备跳转');
        navigate(`/game/${gameId}/voting`);
        // console.log('🎮 游戏已经开始，跳转到投票页');
      } else if (game && game.status === GAME_STATUS.COMPLETED) {
        console.log('⚠️ 游戏已完成，跳转到 summary 页面');
        navigate(`/game/${gameId}/summary`);
      } else if (game && game.status === GAME_STATUS.ARCHIVED) {
        console.log('⚠️ 游戏已归档');
      }
    } catch (error) {
      console.error('❌ 检查游戏状态失败:', error);
    }
  };
  const goVotingPage = () => {
    navigate(`/game/${gameId}/voting`);
  };

  // 页面加载时自动创建用户
  useEffect(() => {
    if (!gameId) {
      console.error('❌ 未找到 gameId，无法初始化');
      return;
    }
    
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      createPlayer(gameId);
    }
  }, [gameId]);

  // 定期检查游戏状态
  useEffect(() => {
    if (!gameId) {
      console.error('❌ 未找到 gameId，无法检查游戏状态');
      return;
    }
    
    // 立即检查一次
    checkGameStarted();
    
    // 设置定时器，每3秒检查一次
    const interval = setInterval(() => {
      checkGameStarted();
    }, 3000);

    // 清理定时器
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameId]);



  return (
    <>
      <div className="flex items-center justify-center min-h-screen">
          {/* 主要内容区域 */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
          {/* 双层旋转 */}
        <div className="relative w-16 h-16 mb-12"> 
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-transparent border-cyan-300" ></div> 

          <div className="animate-spin rounded-full h-12 w-12 border-2 border-b-transparent absolute top-2 left-2 border-cyan-300" ></div> 

        </div>

           {/* 等待文字 */}
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2 text-cyan-300"
              onClick={goVotingPage}
            >
              {gameStatus === GAME_STATUS.ARCHIVED ? '游戏未开始' : 'Waiting for players to join...'}
            </h1>
            {/* todo：显示加载人数：从api获取 */}

          </div>
         </div>
         {/* </div>
        <button
                  onClick={testFullFlow}
                  className="w-full py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors duration-200"
                >
                  🔄 重置用户 (重新显示输入框)
                </button>
      </div> */}

       </div>
    </>
  );
};

export default WaitingPage;