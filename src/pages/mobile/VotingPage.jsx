import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Question from '../../components/mobile/Queston'; 
import VotingOption from '../../components/mobile/VotingOption';
import useGameStore from '../../store';

const VotingPage = () => {
  const { gameId: gameIdParam } = useParams();
  const navigate = useNavigate();
  // 所有 hooks 必须在任何条件返回之前调用
  const gameState = useGameStore(s => s.gameMeta.state);
  const gameMetaId = useGameStore(s => s.gameMeta.id);
  const turn = useGameStore(s => s.turn);
  const timeLeft = useGameStore(s => s.turn.timeLeft);
  const uiError = useGameStore(s => s.ui.error);
  const startPolling = useGameStore(s => s.startPolling);
  const stopPolling = useGameStore(s => s.stopPolling);
  const updateCountdown = useGameStore(s => s.updateCountdown);
  const isGameArchived = useGameStore(s => s.gameMeta.state === 'archived');

  // 本地提交反馈与选中状态
  const [selectedId, setSelectedId] = useState(null);
  const [submitOk, setSubmitOk] = useState(false);

  // 初始化状态
  const [isInitializing, setIsInitializing] = useState(true);
  const [initError, setInitError] = useState(null);

  useEffect(() => {
    const initializeGame = async () => {
      try {
        console.info('[VotingPage] 🚀 开始完整游戏初始化流程...');
        setIsInitializing(true);
        setInitError(null);

        const {
          fetchGameDetail,
          fetchCurrentTurn,
          startGame,
          initCurrentTurn,
          joinGame,
          gameMeta: { id },
        } = useGameStore.getState();

        // 优先使用路由参数中的 gameId，其次使用 store 中的 id
        const paramId = Number(gameIdParam);
        const gameId = Number.isFinite(paramId) ? paramId : id;
        if (Number.isFinite(paramId) && id !== paramId) {
          useGameStore.getState().setGameMeta({ id: paramId });
        }
        console.info('[VotingPage] 📋 使用的游戏ID:', gameId, '（route param:', gameIdParam, ' store id:', id, '）');

        // 1) 确保玩家已加入
        let token = localStorage.getItem('authToken');
        if (!token) {
          console.info('[VotingPage] 🎮 玩家未加入，开始加入游戏...');
          await joinGame(gameId, null);
          token = localStorage.getItem('authToken');
          if (!token) {
            throw new Error('加入游戏失败，未获取到 token');
          }
          console.info('[VotingPage] ✅ 玩家加入完成');
        } else {
          console.info('[VotingPage] ✅ 玩家已加入');
        }

        // 2) 获取游戏详情
        console.info('[VotingPage] 🔄 获取游戏详情...');
        const game = await fetchGameDetail(gameId);
        if (!game) {
          throw new Error('获取游戏详情失败');
        }
        
        const state = game?.state ?? (game?.status === 0 ? 'waiting' : game?.status === 1 ? 'ongoing' : 'archived');
        console.info('[VotingPage] 📊 当前后端状态:', state);

        // 3) 根据游戏状态处理
        if (state === 'waiting') {
          console.info('[VotingPage] 🚀 游戏状态为 waiting，启动游戏...');
          const okStart = await startGame();
          if (!okStart) {
            throw new Error('启动游戏失败');
          }
          console.info('[VotingPage] ✅ 游戏启动成功');
        }

        // 4) 确保有当前回合
        console.info('[VotingPage] 🔍 检查当前回合...');
        let turn = null;
        
        // 先尝试获取回合
        turn = await fetchCurrentTurn(gameId, token);
        console.info('[VotingPage] 📊 fetchCurrentTurn 返回结果:', {
          hasTurn: !!turn,
          turnIndex: turn?.index,
          questionText: turn?.question_text,
          optionsCount: turn?.options?.length
        });
        
        // 如果回合存在且有效，直接使用
        if (turn && typeof turn.index === 'number') {
          console.info('[VotingPage] ✅ 当前回合已存在且有效');
        } else {
          // 回合不存在或无效，尝试创建
          console.warn('[VotingPage] ⚠️ 回合不存在或无效，尝试创建...');
          console.info('[VotingPage] 🔑 使用 token 创建回合:', !!token);
          console.info('[VotingPage] 🎮 游戏状态:', game?.state);
          console.info('[VotingPage] 🎮 游戏状态码:', game?.status);
          
          const okInit = await initCurrentTurn(token);
          console.info('[VotingPage] 📋 initCurrentTurn 返回结果:', okInit);
          
          if (!okInit) {
            // 获取 store 中的错误信息
            const storeError = useGameStore.getState().ui.error;
            throw new Error(`创建回合失败: ${storeError || '未知错误'}`);
          }
          
          // 重新获取回合
          console.info('[VotingPage] 🔄 重新获取回合数据...');
          turn = await fetchCurrentTurn(gameId, token);
          if (!turn || typeof turn.index !== 'number') {
            throw new Error('创建回合后获取失败或数据无效');
          }
          console.info('[VotingPage] ✅ 回合创建成功');
        }

        // 5) 验证回合数据
        console.info('[VotingPage] 🔍 验证回合数据:', {
          hasTurn: !!turn,
          hasQuestionText: !!turn?.question_text,
          hasOptions: !!turn?.options,
          optionsLength: turn?.options?.length || 0,
          turnData: turn
        });

        console.info('[VotingPage] ✅ 游戏初始化完成！');
        setIsInitializing(false);
      } catch (error) {
        console.error('[VotingPage] ❌ 初始化失败:', error);
        setInitError(error.message);
        setIsInitializing(false);
      }
    };

    initializeGame();
  }, []);
  
  // 启动/停止轮询（只在初始化完成后）
  useEffect(() => {
    if (!isInitializing && !initError) {
      console.info('[VotingPage] 🔄 启动轮询机制...');
      startPolling();
      return () => {
        console.info('[VotingPage] ⏹️ 停止轮询机制...');
        stopPolling();
      };
    }
  }, [isInitializing, initError, startPolling, stopPolling]);

  // 判断回合索引：第 0 或第 9 轮，其他情况打印索引
  useEffect(() => {
    const idx = typeof turn?.index === 'number' ? turn.index : null;
    if (idx == null) return;
    
    if (idx === 0 || idx === 9) {
      if (idx === 0) {
        console.info('[VotingPage] 反思问题1', idx);
      } else if (idx === 9) {
        console.info('[VotingPage] 反思问题2', idx);
      }
    } else {
      console.info('[VotingPage] 当前回合 index:', idx);
    }
  }, [turn?.index]);

  // 提交选择（直接使用 store 的方法）
  const submitChoice = async (chosen) => {
    console.info('[VotingPage] 🗳️ 用户点击选择选项:', chosen);
    const authToken = localStorage.getItem('authToken');
    const { submitPlayerChoice } = useGameStore.getState();
    const success = await submitPlayerChoice(chosen, authToken);
    if (success) {
      console.info('[VotingPage] ✅ 选项提交成功');
      setSelectedId(chosen);
      setSubmitOk(true);
      setTimeout(() => setSubmitOk(false), 1500);
    } else {
      console.error('[VotingPage] ❌ 选项提交失败');
    }
  };

  // 获取显示数据
  const question = turn?.questionText || 'Memories is:';
  const votingOptions = turn?.options || [
    { id: 1, text: 'a right', display_number: 1 },
    { id: 2, text: 'a resource', display_number: 2 },
    { id: 3, text: 'a responsibility', display_number: 3 },
    { id: 4, text: 'a trade', display_number: 4 }
  ];

  // 启动倒计时更新（基于服务端时间）
  useEffect(() => {
    console.info('[VotingPage] ⏱️ 启动倒计时更新器...');
    const timer = setInterval(() => {
      updateCountdown();
    }, 1000);

    return () => {
      console.info('[VotingPage] ⏹️ 停止倒计时更新器');
      clearInterval(timer);
    };
  }, [updateCountdown]);

  // 倒计时结束处理（现在由 store 的 updateCountdown 自动处理）
  // 这个 useEffect 可以删除，因为倒计时逻辑已经移到 store 中

  // 统一的状态显示
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-cyan-400 text-xl">正在初始化游戏...</div>
      </div>
    );
  }

  if (initError || uiError) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-xl mb-4">错误</div>
          <div className="text-red-200 text-sm mb-4">{initError || uiError}</div>
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

  return (
    <>
      <div className="min-h-screen bg-black flex flex-col justify-center px-6 py-8">
        {/* 游戏状态显示 */}
        {(gameMetaId != null) && (
          <div className="text-center mb-4">
            <div className="text-cyan-400 text-sm">
              游戏 #{gameMetaId} | 状态: {gameState === 'ongoing' ? '进行中' : '等待中'} | 回合: {(turn?.index ?? -1) + 1}
            </div>
          </div>
        )}
        
        {/* 投票标题 */}
        <Question question={question} />
        {/* 倒计时显示 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full border-4 border-cyan-400 mb-4">
            <span className="text-3xl text-2xl font-bold text-cyan-200">
              {timeLeft || 0}
            </span>
          </div>
          {submitOk && (
            <div className="text-green-400 text-sm">提交成功</div>
          )}
        </div>


        {/* 投票选项 */}
        <div className="max-w-sm mx-auto w-full space-y-4">
          {votingOptions.map((option, index) => (
            <VotingOption
              key={option.id || index}
              option={option}
              isSelected={selectedId === option.id}
              onClick={() => { const chosen = option.id; console.info('[VotingPage] 点击选择 optionId=', chosen); submitChoice(chosen); }}
            />
          ))}
        </div>

        {/* 末尾无额外跳转按钮 */}
      </div>

      {/* 开发辅助按钮已移除：新游戏由后端在 archived -> GET /current 时自动创建 */}
    </>
  );
};

export default VotingPage;