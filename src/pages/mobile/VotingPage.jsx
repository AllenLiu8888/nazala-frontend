import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Question from '../../components/mobile/Queston'; 
import VotingOption from '../../components/mobile/VotingOption';
import { gameApi } from '../../services/gameApi';

const VotingPage = () => {
  const [selectedOption, setSelectedOption] = useState('');
  const [countdown, setCountdown] = useState(30);
  const [currentGame, setCurrentGame] = useState(null);
  const [currentTurn, setCurrentTurn] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [authToken, setAuthToken] = useState(null);
  const { gameId } = useParams();
  const navigate = useNavigate();

  const goPersonalSummary = () => {
    const currentGameId = gameId || 'demo-game';
    navigate(`/game/${currentGameId}/summary`);
  };

  const goTimelinePage = () => {
    const currentGameId = gameId || 'demo-game';
    navigate(`/game/${currentGameId}/timeline`);
  };

  // 加载游戏数据
  const loadGameData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 1. 获取当前游戏
      const gameData = await gameApi.getCurrentGame();
      const game = gameData.game;
      setCurrentGame(game);
      
      // 2. 如果游戏正在进行中，获取当前回合
      if (game && game.id && game.status === 1) {
        try {
          console.log('🎮 正在获取回合数据，游戏ID:', game.id, '认证Token:', authToken ? '已提供' : '未提供');
          const turnData = await gameApi.getCurrentTurn(game.id, authToken);
          console.log('📊 回合数据返回:', turnData);
          setCurrentTurn(turnData.turn || turnData);
        } catch (turnError) {
          console.error('❌ 获取回合数据失败:', turnError);
          setCurrentTurn(null);
        }
      } else {
        console.log('⚠️ 游戏未进行中，跳过获取回合数据:', { 
          game, 
          status: game?.status,
          statusMeaning: game?.status === 0 ? 'WAITING' : game?.status === 1 ? 'ONGOING' : game?.status === 10 ? 'FINISHED' : '未知'
        });
        
        // 如果游戏在等待状态，提示用户
        if (game?.status === 0) {
          setError('游戏还在等待中，请等待游戏开始');
        }
      }
    } catch (err) {
      console.error('加载游戏数据失败:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // // 提交选择
  // const submitChoice = async (optionId) => {
  //   try {
  //     if (!currentGame?.id || !authToken) {
  //       console.error('缺少游戏ID或认证token');
  //       return;
  //     }
      
  //     await gameApi.submitChoice(currentGame.id, optionId, authToken);
  //     console.log('选择提交成功');
  //     // 重新加载数据
  //     loadGameData();
  //   } catch (err) {
  //     console.error('提交选择失败:', err);
  //     setError(err.message);
  //   }
  // };

  // 从localStorage获取token（如果有的话）
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      setAuthToken(token);
    }
  }, []);

  // 初始加载数据
  useEffect(() => {
    loadGameData();
  }, [authToken]);

  // 获取显示数据（优先使用API数据，否则使用默认数据）
  const question = currentTurn?.question_text || 'Memories is:';
  const votingOptions = currentTurn?.options || [
    { id: 1, text: 'a right', display_number: 1 },
    { id: 2, text: 'a resource', display_number: 2 },
    { id: 3, text: 'a responsibility', display_number: 3 },
    { id: 4, text: 'a trade', display_number: 4 }
  ];

  console.log('🔍 当前回合数据详情:', {
    currentTurn,
    hasQuestionText: !!currentTurn?.question_text,
    hasOptions: !!currentTurn?.options,
    questionText: currentTurn?.question_text,
    options: currentTurn?.options
  });

  console.log('📝 最终使用的数据:', {
    question,
    votingOptions,
    isUsingApiData: !!currentTurn?.question_text
  });

  // 倒计时效果
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => prev > 0 ? prev - 1 : 0);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
    console.log('Selected option:', option);
    
    // 如果是API数据，提交选择
    if (typeof option === 'object' && option.id) {
      submitChoice(option.id);
    }
  };

  // 显示加载状态
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-cyan-400 text-xl">加载中...</div>
      </div>
    );
  }

  // 显示错误状态
  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-red-400 text-xl">错误: {error}</div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-black flex flex-col justify-center px-6 py-8">
        {/* 游戏状态显示 */}
        {currentGame && (
          <div className="text-center mb-4">
            <div className="text-cyan-400 text-sm">
              游戏 #{currentGame.id} | 状态: {currentGame.status === 1 ? '进行中' : '等待中'} | 回合: {currentTurn?.index + 1 || 0}
            </div>
          </div>
        )}
        
        {/* 投票标题 */}
        <Question question={question} />
        {/* 倒计时显示 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full border-4 border-cyan-400 mb-4">
            <span className="text-3xl text-2xl font-bold text-cyan-200">
              {countdown}
            </span>
          </div>
        </div>


        {/* 投票选项 */}
        <div className="max-w-sm mx-auto w-full space-y-4">
          {votingOptions.map((option, index) => (
            <VotingOption
              key={option.id || index}
              option={option.text || option}
              isSelected={selectedOption === option}
              onClick={() => handleOptionSelect(option)}
            />
          ))}
        </div>

        {/* 跳转链接 */}
        <div className="text-center mt-8">
          <button
            onClick={goPersonalSummary}
            className="text-cyan-400 text-sm underline hover:text-cyan-300 transition-colors duration-200"
          >
            查看个人总结
          </button>
        </div>
                {/* 跳转链接 */}
                <div className="text-center mt-8">
          <button
            onClick={goTimelinePage}
            className="text-cyan-400 text-sm underline hover:text-cyan-300 transition-colors duration-200"
          >
            查看时间轴
          </button>
        </div>
      </div>
    </>
  );
};

export default VotingPage;