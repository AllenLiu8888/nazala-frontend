import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { gameApi } from '../../services/gameApi';

const WaitingPage = () => {
  const [hasStartedCreation, setHasStartedCreation] = useState(false);
  const { gameId } = useParams();

  const navigate = useNavigate();

  // 自动创建用户
  const createPlayer = async (gameId) => {
    if (hasStartedCreation) {
      console.log('⚠️ 已经开始创建用户，跳过重复执行');
      return;
    }
    
    setHasStartedCreation(true);
    
    try {
      console.log('🎮 开始创建用户，游戏ID:', gameId);
      
      // 检查本地是否已有 authToken
      const existingToken = localStorage.getItem('authToken');
      if (existingToken) {
        console.log('✅ 已有 authToken，跳过用户创建', existingToken);
        return;
      }
      
      // 没有 authToken，创建新用户
      console.log('📝 没有 authToken，开始创建用户...', gameId);
      const testName = `玩家_${Date.now()}`;
      const result = await gameApi.joinGame(gameId, testName);
      console.log('✅ 用户创建成功:', result, gameId);
      
      // 保存获得的 authToken
      if (result.player && result.player.auth_token) {
        localStorage.setItem('authToken', result.player.auth_token);
        localStorage.setItem('playerId', result.player.id);
        localStorage.setItem('playerName', testName);
        console.log('💾 authToken 已保存', result.player.auth_token);
      } else if (result.auth_token) {
        // 兼容不同的返回格式
        localStorage.setItem('authToken', result.auth_token);
        localStorage.setItem('playerId', result.id);
        localStorage.setItem('playerName', testName);
        console.log('💾 authToken 已保存 (兼容格式)', result.auth_token);
      } else {
        console.error('❌ 未收到 authToken', result);
      }
      
    } catch (error) {
      console.error('❌ 创建用户失败:', error, gameId);
    }
  };


  const goVotingPage = () => {
    navigate(`/game/${gameId}/voting`);
  };

  // 页面加载时自动创建用户
  useEffect(() => {
    createPlayer(gameId);
  }, []);


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
              Waiting for players to join...
            </h1>
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