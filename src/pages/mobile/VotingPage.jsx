import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Question from '../../components/mobile/Queston';
import VotingOption from '../../components/mobile/VotingOption';
import useGameStoreMobile from '../../store/index_mobile';

const VotingPage = () => {
  const { gameId: gameIdParam } = useParams();
  const navigate = useNavigate();
  
  // Store状态
  const gameState = useGameStoreMobile(s => s.gameMeta.state);
  const gameMetaId = useGameStoreMobile(s => s.gameMeta.id);
  const turn = useGameStoreMobile(s => s.turn);
  const isGameArchived = useGameStoreMobile(s => s.gameMeta.state === 'archived');
  const isGameFinished = useGameStoreMobile(s => s.gameMeta.state === 'finished');
  const startPollingForVote = useGameStoreMobile(s => s.startPollingForVote);
  const stopPolling = useGameStoreMobile(s => s.stopPolling);
  
  // 本地状态
  const [selectedId, setSelectedId] = useState(null);
  const [submitOk, setSubmitOk] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [initError, setInitError] = useState(null);
  
  // 用于跟踪当前turn_index，检测变化
  const currentTurnIndexRef = useRef(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const hasInitialized = useRef(false);

  useEffect(() => {
    const loadPage = async () => {
      try {
        setIsInitializing(true);
        setInitError(null);
        setHasSubmitted(false);
        setSelectedId(null);
        setSubmitOk(false);

        const {
          fetchGameDetail,
          fetchCurrentTurn,
          gameMeta: { id },
        } = useGameStoreMobile.getState();

        // 获取游戏ID
        const paramId = Number(gameIdParam);
        const gameId = Number.isFinite(paramId) ? paramId : id;
        if (Number.isFinite(paramId) && id !== paramId) {
          useGameStoreMobile.getState().setGameMeta({ id: paramId });
        }
        // 获取token
        const token = localStorage.getItem('authToken');


        // 获取游戏详情和当前回合
        console.info('[VotingPage] 🔄 获取游戏数据...');
        const [game, currentTurn] = await Promise.all([
          fetchGameDetail(gameId),
          fetchCurrentTurn(gameId, token)
        ]);

        if (!game) {
          throw new Error('获取游戏详情失败');
        }

        // 记录当前turn_index
        if (currentTurn && typeof currentTurn.index === 'number') {
          currentTurnIndexRef.current = currentTurn.index;
          console.info('[VotingPage] ✅ 当前回合:', currentTurn.index);
        } else {
          console.warn('[VotingPage] ⚠️ 回合数据无效');
        }


        console.info('[VotingPage] ✅ 页面加载完成');
        setIsInitializing(false);
      } catch (error) {
        console.error('[VotingPage] ❌ 页面加载失败:', error);
        setInitError(error.message);
        setIsInitializing(false);
      }
    };
    
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      loadPage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameIdParam]);
  
  // 2. 启动轮询（只在用户提交选择后）
  useEffect(() => {
    if (!isInitializing && !initError && hasSubmitted) {
      console.info('[VotingPage] 🔄 启动轮询机制...');
      startPollingForVote();
      return () => {
        console.info('[VotingPage] ⏹️ 停止轮询机制...');
        stopPolling();
      };
    }
  }, [isInitializing, initError, hasSubmitted, startPollingForVote, stopPolling]);

  // 3. 检测turn_index变化，重置组件状态以进入新回合
  useEffect(() => {
    const currentTurnIndex = turn?.index;
    
    // 如果turn_index有效且与之前记录的不同
    if (typeof currentTurnIndex === 'number' && 
        currentTurnIndexRef.current !== null && 
        currentTurnIndex !== currentTurnIndexRef.current) {
      
      console.info('[VotingPage] 🔄 检测到turn_index变化:', 
        currentTurnIndexRef.current, '→', currentTurnIndex);
      
      // 如果用户已经提交过选择，则重置组件状态进入新回合
      if (hasSubmitted) {
        console.info('[VotingPage] 🔄 用户已提交，重置组件状态进入新回合...');
        
        // 重置本地状态
        setHasSubmitted(false);
        setSelectedId(null);
        setSubmitOk(false);
        
        // 停止轮询（将在用户下次提交后重新启动）
        stopPolling();
      }
      
      // 更新记录的turn_index
      currentTurnIndexRef.current = currentTurnIndex;
    }
  }, [turn?.index, hasSubmitted, stopPolling]);

  // 5. 用户选择和提交逻辑
  const submitChoice = async (chosen) => {
    setSelectedId(chosen);
    try {
      const authToken = localStorage.getItem('authToken');
      const { submitPlayerChoice } = useGameStoreMobile.getState();
      const success = await submitPlayerChoice(chosen, authToken);
      if (success) {
        setHasSubmitted(true);
        setSubmitOk(true);
        setTimeout(() => setSubmitOk(false), 1500);
      } else {
        console.error('[VotingPage] ❌ 选项提交失败');
        setSelectedId(null); // 重置选择
      }
    } catch (error) {
      console.error('[VotingPage] ❌ 提交过程出错:', error);
      setSelectedId(null); // 重置选择
    }
  };

  // 6. 获取显示数据
  const question = turn?.questionText || 'Memories is:';
  const votingOptions = turn?.options || [
    { id: 1, text: 'a right', display_number: 1 },
    { id: 2, text: 'a resource', display_number: 2 },
    { id: 3, text: 'a responsibility', display_number: 3 },
    { id: 4, text: 'a trade', display_number: 4 }
  ];

  // 7. 监听游戏状态变化：finished 时跳转到 summary
  useEffect(() => {
    if (isGameFinished) {
      console.info('[VotingPage] 🏁 游戏结束，跳转到总结页面');
      const currentGameId = gameMetaId || gameIdParam || 'demo-game';
      navigate(`/game/${currentGameId}/summary`);
    }
  }, [isGameFinished, gameMetaId, gameIdParam, navigate]);


  // 8. 渲染逻辑
  // 加载中状态
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-cyan-400 text-xl">正在加载游戏...</div>
      </div>
    );
  }

  // 错误状态
  if (initError) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-xl mb-4">加载失败</div>
          <div className="text-red-200 text-sm mb-4">{initError}</div>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-cyan-600 text-white rounded hover:bg-cyan-700"
          >
            重新加载
          </button>
        </div>
      </div>
    );
  }

  // 游戏已归档状态
  if (isGameArchived) {
    const goToPersonalSummary = () => {
      const currentGameId = gameMetaId || gameIdParam || 'demo-game';
      navigate(`/game/${currentGameId}/summary`);
    };

    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-cyan-400 text-2xl mb-6">游戏结束</div>
          <button
            onClick={goToPersonalSummary}
            className="px-6 py-3 bg-cyan-400 text-black rounded-lg text-lg font-semibold hover:bg-cyan-300 transition-colors duration-200"
          >
            查看个人总结
          </button>
        </div>
      </div>
    );
  }

  // 8. 主渲染 - 投票界面
  return (
    <div className="min-h-screen bg-black flex flex-col justify-center px-6 py-8">
      {/* 游戏状态显示 */}
      {(gameMetaId != null) && (
        <div className="text-center mb-4">
          <div className="text-cyan-400 text-sm">
            游戏 #{gameMetaId} | 状态: {gameState === 'ongoing' ? '进行中' : '等待中'} | 回合: {(turn.index)}
          </div>
        </div>
      )}
      
      {/* 投票标题 */}
      <Question question={question} />
      
      {/* 提交状态显示 */}
      <div className="text-center mb-8">
        {submitOk && (
          <div className="text-green-400 text-lg mb-4">提交成功</div>
        )}
        {hasSubmitted && !submitOk && (
          <div className="text-yellow-400 text-lg mb-4">等待下一回合...</div>
        )}
      </div>

      {/* 投票选项 */}
      <div className="max-w-sm mx-auto w-full space-y-4">
        {votingOptions.map((option, index) => (
          <VotingOption
            key={option.id || index}
            option={option}
            isSelected={selectedId === option.id}
            onClick={() => {
              if (!hasSubmitted) {
                const chosen = option.id;
                console.info('[VotingPage] 点击选择 optionId=', chosen);
                submitChoice(chosen);
              }
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default VotingPage;