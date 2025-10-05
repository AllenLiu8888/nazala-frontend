import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useGameStore from '../../store';
import { gameApi } from '../../services/gameApi';

function AdminDashboard() {
  const navigate = useNavigate();
  
  // 从 store 读取数据
  const gameId = useGameStore(s => s.gameMeta.id);
  const gameState = useGameStore(s => s.gameMeta.state);
  const statusCode = useGameStore(s => s.gameMeta.statusCode);
  const maxRounds = useGameStore(s => s.gameMeta.maxRounds);
  const turnsCount = useGameStore(s => s.gameMeta.turnsCount);
  const playersCount = useGameStore(s => s.gameMeta.playersCount);
  const joinToken = useGameStore(s => s.gameMeta.joinToken);
  const startedAt = useGameStore(s => s.gameMeta.startedAt);
  const endedAt = useGameStore(s => s.gameMeta.endedAt);
  
  const turnId = useGameStore(s => s.turn.id);
  const turnIndex = useGameStore(s => s.turn.index);
  const turnStatus = useGameStore(s => s.turn.status);
  const turnPhase = useGameStore(s => s.turn.phase);
  const questionText = useGameStore(s => s.turn.questionText);
  const options = useGameStore(s => s.turn.options);
  
  const playersTotal = useGameStore(s => s.players.total);
  const playersVoted = useGameStore(s => s.players.voted);
  
  const worldCategories = useGameStore(s => s.world.categories);
  const radarData = useGameStore(s => s.world.radarData);
  
  const uiLoading = useGameStore(s => s.ui.loading);
  const uiError = useGameStore(s => s.ui.error);

  // 本地状态
  const [testPlayer, setTestPlayer] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [actionResult, setActionResult] = useState(null);
  const [editingWorld, setEditingWorld] = useState(false);
  const [worldValues, setWorldValues] = useState([0, 0, 0, 0]);

  // 启动轮询
  useEffect(() => {
    if (gameId) {
      useGameStore.getState().startPolling(gameId);
    } else {
      // 如果没有 gameId，获取当前游戏
      useGameStore.getState().fetchCurrentGame();
    }
    
    return () => {
      useGameStore.getState().stopPolling();
    };
  }, [gameId]);

  // 同步 radarData 到本地编辑状态
  useEffect(() => {
    if (radarData && radarData.length > 0) {
      setWorldValues(radarData);
    }
  }, [radarData]);

  // 执行操作的通用函数
  const executeAction = async (actionName, actionFn) => {
    setActionLoading(actionName);
    setActionResult(null);
    try {
      const result = await actionFn();
      setActionResult({ success: true, message: `${actionName} 成功`, data: result });
      console.log(`✅ ${actionName} 成功:`, result);
      return result;
    } catch (error) {
      setActionResult({ success: false, message: `${actionName} 失败: ${error.message}` });
      console.error(`❌ ${actionName} 失败:`, error);
      throw error;
    } finally {
      setActionLoading(null);
      // 3秒后清除结果提示
      setTimeout(() => setActionResult(null), 3000);
    }
  };

  // 游戏管理操作
  const handleGetCurrentGame = async () => {
    await executeAction('获取当前游戏', () => useGameStore.getState().fetchCurrentGame());
  };

  const handleStartGame = async () => {
    await executeAction('开始游戏', () => useGameStore.getState().startGame(gameId));
  };

  const handleArchiveGame = async () => {
    await executeAction('归档游戏', () => useGameStore.getState().archiveGame(gameId));
  };

  // 回合管理操作
  const handleInitTurn = async () => {
    await executeAction('初始化回合', async () => {
      const result = await gameApi.initTurn(gameId);
      // 立即刷新数据
      await useGameStore.getState().fetchCurrentTurn(gameId);
      return result;
    });
  };

  const handleSubmitTurn = async () => {
    await executeAction('提交回合', async () => {
      const result = await gameApi.submitTurn(gameId);
      // 立即刷新数据
      await useGameStore.getState().fetchCurrentTurn(gameId);
      return result;
    });
  };

  // 玩家管理操作
  const handleCreateTestPlayer = async () => {
    await executeAction('创建测试玩家', async () => {
      const playerData = await gameApi.joinGame(gameId, `测试玩家_${Math.random().toString(36).slice(2, 7)}`);
      const player = playerData.player;
      setTestPlayer(player);
      // 立即刷新数据
      await useGameStore.getState().fetchGameDetail(gameId);
      return player;
    });
  };

  const handleSubmitTestChoice = async () => {
    if (!testPlayer || !options || options.length === 0) {
      alert('无法提交选择：缺少测试玩家或选项');
      return;
    }
    
    await executeAction('提交测试选择', async () => {
      const randomOption = options[Math.floor(Math.random() * options.length)];
      const result = await gameApi.submitChoice(gameId, randomOption.id, testPlayer.auth_token);
      // 立即刷新数据
      await useGameStore.getState().fetchCurrentTurn(gameId);
      return result;
    });
  };

  // 导航操作
  const handleGoToLobby = () => {
    navigate(`/game/${gameId}/lobby`);
  };

  const handleGoToDashboard = () => {
    navigate(`/game/${gameId}/game`);
  };

  const handleGoToIntro = () => {
    navigate(`/game/${gameId}/intro`);
  };

  const handleGoToGameOver = () => {
    navigate(`/game/${gameId}/gameover`);
  };

  // 修改世界状态
  const handleSaveWorldValues = () => {
    setEditingWorld(false);
    // 直接更新 store 中的世界数据
    useGameStore.getState().setWorld({ radarData: worldValues });
    setActionResult({ success: true, message: '世界状态已更新（仅前端）' });
    setTimeout(() => setActionResult(null), 3000);
  };

  const handleCancelEdit = () => {
    setEditingWorld(false);
    // 恢复原始值
    setWorldValues(radarData);
  };

  // 手动结束游戏
  const handleFinishGame = async () => {
    if (!window.confirm('确定要手动结束游戏吗？这将把游戏状态改为 FINISHED。')) {
      return;
    }
    
    await executeAction('手动结束游戏', async () => {
      // 直接更新 store 状态
      useGameStore.getState().setGameMeta({
        state: 'finished',
        statusCode: 10,
        endedAt: new Date().toISOString(),
      });
      return { success: true };
    });
  };

  // 状态文本和颜色
  const getStatusText = (code) => {
    switch (code) {
      case 0: return '等待中';
      case 1: return '进行中';
      case 10: return '已结束';
      case 20: return '已归档';
      default: return '未知';
    }
  };

  const getStatusColor = (code) => {
    switch (code) {
      case 0: return 'text-yellow-400';
      case 1: return 'text-green-400';
      case 10: return 'text-blue-400';
      case 20: return 'text-gray-400';
      default: return 'text-white';
    }
  };

  // 按钮组件
  const ActionButton = ({ onClick, disabled, children, variant = 'primary', loading = false }) => {
    const baseClass = "px-4 py-2 rounded font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
    const variantClass = {
      primary: "bg-cyan-600 hover:bg-cyan-700 text-white",
      success: "bg-green-600 hover:bg-green-700 text-white",
      danger: "bg-red-600 hover:bg-red-700 text-white",
      warning: "bg-yellow-600 hover:bg-yellow-700 text-white",
      secondary: "bg-gray-600 hover:bg-gray-700 text-white",
    }[variant];

    return (
      <button
        onClick={onClick}
        disabled={disabled || loading}
        className={`${baseClass} ${variantClass}`}
      >
        {loading ? '处理中...' : children}
      </button>
    );
  };

  return (
    <div className="h-full w-full bg-gray-900 text-white overflow-hidden">
      <div className="h-full w-full overflow-y-auto p-6">
        <div className="max-w-7xl mx-auto pb-12">
        {/* 标题 */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">游戏管理后台</h1>
          <div className="flex gap-2">
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded"
            >
              返回首页
            </button>
          </div>
        </div>

        {/* 全局加载状态 */}
        {uiLoading && (
          <div className="bg-blue-500/20 border border-blue-500 text-blue-300 px-4 py-3 rounded mb-4">
            <div className="flex items-center">
              <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              <span>加载中...</span>
            </div>
          </div>
        )}

        {/* 全局错误提示 */}
        {uiError && (
          <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded mb-4">
            <div className="flex justify-between items-center">
              <span>错误: {uiError}</span>
              <button
                onClick={() => useGameStore.getState().clearError()}
                className="text-red-200 hover:text-white"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* 操作结果提示 */}
        {actionResult && (
          <div className={`px-4 py-3 rounded mb-4 ${
            actionResult.success
              ? 'bg-green-500/20 border border-green-500 text-green-300'
              : 'bg-red-500/20 border border-red-500 text-red-300'
          }`}>
            {actionResult.message}
          </div>
        )}

        {/* 主要内容区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧：游戏信息 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 游戏基本信息 */}
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">游戏信息</h2>
                <ActionButton
                  onClick={handleGetCurrentGame}
                  variant="secondary"
                  loading={actionLoading === '获取当前游戏'}
                >
                  刷新
                </ActionButton>
              </div>
              
              {gameId ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-gray-400">游戏ID:</span>
                      <span className="ml-2 font-mono">{gameId}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">状态:</span>
                      <span className={`ml-2 ${getStatusColor(statusCode)}`}>
                        {getStatusText(statusCode)} ({gameState})
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">最大回合数:</span>
                      <span className="ml-2">{maxRounds}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">当前回合数:</span>
                      <span className="ml-2">{turnsCount}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">玩家数量:</span>
                      <span className="ml-2">{playersCount}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">加入码:</span>
                      <span className="ml-2 font-mono text-sm bg-gray-700 px-2 py-1 rounded">
                        {joinToken || 'N/A'}
                      </span>
                    </div>
                  </div>
                  
                  {startedAt && (
                    <div>
                      <span className="text-gray-400">开始时间:</span>
                      <span className="ml-2">{new Date(startedAt).toLocaleString()}</span>
                    </div>
                  )}
                  
                  {endedAt && (
                    <div>
                      <span className="text-gray-400">结束时间:</span>
                      <span className="ml-2">{new Date(endedAt).toLocaleString()}</span>
                    </div>
                  )}

                  {/* 导航按钮 */}
                  <div className="pt-4 border-t border-gray-700">
                    <h3 className="text-sm text-gray-400 mb-2">快速导航</h3>
                    <div className="flex flex-wrap gap-2">
                      <ActionButton onClick={handleGoToLobby} variant="secondary">
                        前往 Lobby
                      </ActionButton>
                      <ActionButton onClick={handleGoToIntro} variant="secondary">
                        前往 Intro
                      </ActionButton>
                      <ActionButton onClick={handleGoToDashboard} variant="secondary">
                        前往 Dashboard
                      </ActionButton>
                      <ActionButton onClick={handleGoToGameOver} variant="secondary">
                        前往 GameOver
                      </ActionButton>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <p>未找到游戏数据</p>
                  <ActionButton
                    onClick={handleGetCurrentGame}
                    variant="primary"
                    loading={actionLoading === '获取当前游戏'}
                    className="mt-4"
                  >
                    获取当前游戏
                  </ActionButton>
                </div>
              )}
            </div>

            {/* 回合信息 */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">回合信息</h2>
              
              {turnId ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-gray-400">回合ID:</span>
                      <span className="ml-2 font-mono">{turnId}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">回合索引:</span>
                      <span className="ml-2">{turnIndex}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">状态码:</span>
                      <span className="ml-2">{turnStatus}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">阶段:</span>
                      <span className="ml-2">{turnPhase}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-gray-400">投票进度:</span>
                      <span className="ml-2">{playersVoted} / {playersTotal}</span>
                      <div className="mt-2 w-full bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-cyan-500 h-2 rounded-full transition-all"
                          style={{ width: `${playersTotal > 0 ? (playersVoted / playersTotal) * 100 : 0}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  
                  {questionText && (
                    <div>
                      <div className="text-gray-400 mb-2">问题:</div>
                      <div className="bg-gray-700 p-3 rounded text-sm">
                        {questionText}
                      </div>
                    </div>
                  )}
                  
                  {options && options.length > 0 && (
                    <div>
                      <div className="text-gray-400 mb-2">选项 ({options.length}):</div>
                      <div className="space-y-2">
                        {options.map((option, index) => (
                          <div key={option.id} className="bg-gray-700 p-2 rounded text-sm">
                            <div className="font-bold">选项 {option.display_number || index + 1}</div>
                            <div className="text-gray-300">{option.text}</div>
                            {option.attrs && option.attrs.length > 0 && (
                              <div className="mt-1 text-xs text-gray-400">
                                属性: {option.attrs.map(a => `${a.name}: ${a.value > 0 ? '+' : ''}${a.value}`).join(', ')}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <p>{gameState === 'ongoing' ? '回合未初始化' : '游戏未开始'}</p>
                </div>
              )}
            </div>

            {/* 世界状态 */}
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">世界状态（四维属性）</h2>
                {!editingWorld ? (
                  <button
                    onClick={() => setEditingWorld(true)}
                    className="px-3 py-1 bg-cyan-600 hover:bg-cyan-700 rounded text-sm"
                  >
                    编辑
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveWorldValues}
                      className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-sm"
                    >
                      保存
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="px-3 py-1 bg-gray-600 hover:bg-gray-700 rounded text-sm"
                    >
                      取消
                    </button>
                  </div>
                )}
              </div>
              
              {radarData && radarData.length > 0 ? (
                <div className="space-y-3">
                  {worldCategories.map((category, index) => (
                    <div key={category}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-gray-400">{category}:</span>
                        <span className="text-cyan-300 font-mono text-sm">
                          {editingWorld ? worldValues[index]?.toFixed(1) : (radarData[index] || 0).toFixed(1)}
                        </span>
                      </div>
                      {editingWorld ? (
                        <input
                          type="range"
                          min="-100"
                          max="100"
                          step="0.1"
                          value={worldValues[index] || 0}
                          onChange={(e) => {
                            const newValues = [...worldValues];
                            newValues[index] = parseFloat(e.target.value);
                            setWorldValues(newValues);
                          }}
                          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                        />
                      ) : (
                        <div className="w-full bg-gray-700 rounded-full h-6 relative">
                          <div
                            className="bg-cyan-500 h-6 rounded-full transition-all flex items-center justify-center text-xs font-bold"
                            style={{ width: `${Math.abs(radarData[index] || 0)}%` }}
                          >
                            {(radarData[index] || 0).toFixed(1)}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <p>暂无数据</p>
                </div>
              )}
              
              {editingWorld && (
                <div className="mt-3 text-xs text-yellow-400">
                  ⚠️ 注意：修改仅影响前端显示，不会同步到后端
                </div>
              )}
            </div>
          </div>

          {/* 右侧：操作面板 */}
          <div className="space-y-6">
            {/* 游戏操作 */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4 text-green-400">游戏操作</h3>
              <div className="space-y-2">
                <ActionButton
                  onClick={handleStartGame}
                  variant="success"
                  disabled={!gameId || statusCode !== 0}
                  loading={actionLoading === '开始游戏'}
                  className="w-full"
                >
                  开始游戏
                </ActionButton>
                <ActionButton
                  onClick={handleFinishGame}
                  variant="danger"
                  disabled={!gameId || statusCode !== 1}
                  loading={actionLoading === '手动结束游戏'}
                  className="w-full"
                >
                  手动结束游戏
                </ActionButton>
                <ActionButton
                  onClick={handleArchiveGame}
                  variant="warning"
                  disabled={!gameId || statusCode !== 10}
                  loading={actionLoading === '归档游戏'}
                  className="w-full"
                >
                  归档游戏
                </ActionButton>
              </div>
              <div className="mt-3 text-xs text-gray-400">
                <p>• 开始游戏: 需要游戏状态为"等待中"</p>
                <p>• 手动结束: 将游戏状态改为"已结束"（仅前端）</p>
                <p>• 归档游戏: 需要游戏状态为"已结束"</p>
              </div>
            </div>

            {/* 回合操作 */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4 text-blue-400">回合操作</h3>
              <div className="space-y-2">
                <ActionButton
                  onClick={handleInitTurn}
                  variant="primary"
                  disabled={!gameId || statusCode !== 1 || !!turnId}
                  loading={actionLoading === '初始化回合'}
                  className="w-full"
                >
                  初始化回合
                </ActionButton>
                <ActionButton
                  onClick={handleSubmitTurn}
                  variant="success"
                  disabled={!gameId || !turnId || playersVoted < playersTotal}
                  loading={actionLoading === '提交回合'}
                  className="w-full"
                >
                  提交回合
                </ActionButton>
              </div>
              <div className="mt-3 text-xs text-gray-400">
                <p>• 初始化回合: 游戏进行中且无当前回合</p>
                <p>• 提交回合: 所有玩家完成投票</p>
              </div>
            </div>

            {/* 测试玩家操作 */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4 text-purple-400">测试玩家</h3>
              <div className="space-y-2">
                <ActionButton
                  onClick={handleCreateTestPlayer}
                  variant="primary"
                  disabled={!gameId}
                  loading={actionLoading === '创建测试玩家'}
                  className="w-full"
                >
                  创建测试玩家
                </ActionButton>
                {testPlayer && (
                  <>
                    <ActionButton
                      onClick={handleSubmitTestChoice}
                      variant="success"
                      disabled={!testPlayer || !options || options.length === 0}
                      loading={actionLoading === '提交测试选择'}
                      className="w-full"
                    >
                      随机投票
                    </ActionButton>
                    <div className="mt-3 p-2 bg-gray-700 rounded text-xs">
                      <div className="font-bold mb-1">当前测试玩家:</div>
                      <div>ID: {testPlayer.id}</div>
                      <div className="truncate">Token: {testPlayer.auth_token?.slice(0, 30)}...</div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Store 信息 */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4 text-orange-400">Store 状态</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">轮询状态:</span>
                  <span className="text-green-400">运行中</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">加载状态:</span>
                  <span>{uiLoading ? '加载中' : '空闲'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">错误:</span>
                  <span>{uiError || '无'}</span>
                </div>
              </div>
              <div className="mt-3">
                <button
                  onClick={() => {
                    console.log('📊 当前 Store 状态:', useGameStore.getState());
                  }}
                  className="w-full px-3 py-2 bg-orange-600 hover:bg-orange-700 rounded text-sm"
                >
                  输出 Store 到控制台
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 底部提示 */}
        <div className="mt-8 text-center text-gray-400 text-sm">
          <p>💡 所有数据来自 Zustand Store，每2秒自动轮询更新</p>
          <p className="mt-1">🔧 操作结果会自动同步到 Store 并更新所有组件</p>
        </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
