import { useState, useEffect } from 'react';
import useGameStore from '../../store';

const DevControlPanel = () => {
  const [gameId, setGameId] = useState('');
  const [token, setToken] = useState('');
  const [logs, setLogs] = useState([]);
  
  // 从 store 获取状态
  const gameMeta = useGameStore(s => s.gameMeta);
  const turn = useGameStore(s => s.turn);
  const players = useGameStore(s => s.players);
  const ui = useGameStore(s => s.ui);
  
  // 获取 store 方法
  const {
    fetchCurrentGame,
    fetchGameDetail,
    fetchCurrentTurn,
    fetchGameTimeline,
    startGame,
    startGameWithPlayerCheck,
    createNewGame,
    initCurrentTurn,
    submitCurrentTurn,
    joinGame,
    submitPlayerChoice,
    handleCountdownEnd: storeHandleCountdownEnd,
    updateCountdown,
    startPolling,
    stopPolling,
    setGameMeta,
    setTurn,
    clearError
  } = useGameStore();

  // 添加日志
  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { timestamp, message, type }]);
    console.log(`[DevPanel] ${message}`);
  };

  // 清空日志
  const clearLogs = () => setLogs([]);

  // 初始化 token
  useEffect(() => {
    const savedToken = localStorage.getItem('authToken');
    if (savedToken) {
      setToken(savedToken);
    }
  }, []);

  // 操作函数
  const handleFetchCurrentGame = async () => {
    try {
      addLog('🔄 获取当前游戏...');
      const result = await fetchCurrentGame();
      addLog(`✅ 获取成功: ${JSON.stringify(result)}`, 'success');
    } catch (error) {
      addLog(`❌ 获取失败: ${error.message}`, 'error');
    }
  };

  const handleFetchGameDetail = async () => {
    if (!gameId) {
      addLog('❌ 请输入游戏ID', 'error');
      return;
    }
    try {
      addLog(`🔄 获取游戏详情 (ID: ${gameId})...`);
      const result = await fetchGameDetail(Number(gameId));
      addLog(`✅ 获取成功: ${JSON.stringify(result)}`, 'success');
    } catch (error) {
      addLog(`❌ 获取失败: ${error.message}`, 'error');
    }
  };

  const handleFetchCurrentTurn = async () => {
    if (!gameId) {
      addLog('❌ 请输入游戏ID', 'error');
      return;
    }
    try {
      addLog(`🔄 获取当前回合 (ID: ${gameId})...`);
      const result = await fetchCurrentTurn(Number(gameId), token || null);
      addLog(`✅ 获取成功: ${JSON.stringify(result)}`, 'success');
    } catch (error) {
      addLog(`❌ 获取失败: ${error.message}`, 'error');
    }
  };

  const handleStartGame = async () => {
    try {
      addLog('🔄 启动游戏...');
      const result = await startGame(token || null);
      addLog(`✅ 启动结果: ${result}`, 'success');
    } catch (error) {
      addLog(`❌ 启动失败: ${error.message}`, 'error');
    }
  };

  const handleStartGameWithPlayerCheck = async () => {
    try {
      addLog('🔄 检查玩家数量后启动游戏...');
      const result = await startGameWithPlayerCheck(token || null, 1);
      addLog(`✅ 启动结果: ${result}`, 'success');
    } catch (error) {
      addLog(`❌ 启动失败: ${error.message}`, 'error');
    }
  };

  const handleInitTurn = async () => {
    try {
      addLog('🔄 初始化回合...');
      const result = await initCurrentTurn(token || null);
      addLog(`✅ 初始化结果: ${result}`, 'success');
    } catch (error) {
      addLog(`❌ 初始化失败: ${error.message}`, 'error');
    }
  };

  const handleSubmitTurn = async () => {
    try {
      addLog('🔄 提交回合...');
      const result = await submitCurrentTurn(token || null);
      addLog(`✅ 提交结果: ${result}`, 'success');
    } catch (error) {
      addLog(`❌ 提交失败: ${error.message}`, 'error');
    }
  };

  const handleJoinGame = async () => {
    if (!gameId) {
      addLog('❌ 请输入游戏ID', 'error');
      return;
    }
    try {
      addLog(`🔄 加入游戏 (ID: ${gameId})...`);
      const result = await joinGame(Number(gameId), token || null);
      addLog(`✅ 加入成功: ${JSON.stringify(result)}`, 'success');
      // 更新 token
      const newToken = localStorage.getItem('authToken');
      if (newToken) setToken(newToken);
    } catch (error) {
      addLog(`❌ 加入失败: ${error.message}`, 'error');
    }
  };

  const handleSubmitChoice = async () => {
    if (!gameId) {
      addLog('❌ 请输入游戏ID', 'error');
      return;
    }
    try {
      addLog('🔄 提交选择 (选项1)...');
      const result = await submitPlayerChoice(1, token || null);
      addLog(`✅ 提交结果: ${result}`, 'success');
    } catch (error) {
      addLog(`❌ 提交失败: ${error.message}`, 'error');
    }
  };

  const handleCreateNewGame = async () => {
    try {
      addLog('🔄 创建新游戏...');
      const result = await createNewGame(token || null);
      addLog(`✅ 创建结果: ${result}`, 'success');
    } catch (error) {
      addLog(`❌ 创建失败: ${error.message}`, 'error');
    }
  };

  const handleCountdownEnd = async () => {
    try {
      addLog('🔄 处理倒计时结束...');
      const result = await storeHandleCountdownEnd(token || null);
      addLog(`✅ 处理结果: ${result}`, 'success');
    } catch (error) {
      addLog(`❌ 处理失败: ${error.message}`, 'error');
    }
  };

  const handleUpdateCountdown = () => {
    addLog('🔄 更新倒计时...');
    const result = updateCountdown();
    addLog(`✅ 倒计时: ${result}秒`, 'success');
  };

  const handleStartPolling = () => {
    addLog('🔄 启动轮询...');
    startPolling();
    addLog('✅ 轮询已启动', 'success');
  };

  const handleStopPolling = () => {
    addLog('🔄 停止轮询...');
    stopPolling();
    addLog('✅ 轮询已停止', 'success');
  };

  const handleSetGameId = () => {
    if (gameId) {
      setGameMeta({ id: Number(gameId) });
      addLog(`✅ 设置游戏ID: ${gameId}`, 'success');
    }
  };

  const handleAutoSetGameId = async () => {
    try {
      addLog('🔄 自动获取游戏ID...', 'info');
      const currentGame = await fetchCurrentGame();
      if (currentGame?.id) {
        setGameId(currentGame.id.toString());
        addLog(`✅ 自动设置游戏ID: ${currentGame.id}`, 'success');
      } else {
        addLog('❌ 未找到当前游戏', 'error');
      }
    } catch (error) {
      addLog(`❌ 自动获取游戏ID失败: ${error.message}`, 'error');
    }
  };

  const handleClearError = () => {
    clearError();
    addLog('✅ 清除错误', 'success');
  };

  const handleListGames = async () => {
    try {
      addLog('🔄 获取游戏列表...');
      // 这里可以添加获取游戏列表的API调用
      // 目前先显示当前游戏信息
      const currentGame = await fetchCurrentGame();
      if (currentGame) {
        addLog(`✅ 当前游戏: ID=${currentGame.id}, 状态=${currentGame.state || currentGame.status}`, 'success');
        addLog(`📊 游戏详情: 总回合=${currentGame.max_turns || currentGame.turns_count || 0}, 玩家数=${currentGame.players_count || 0}`, 'info');
      } else {
        addLog('ℹ️ 没有找到当前游戏', 'info');
      }
    } catch (error) {
      addLog(`❌ 获取游戏列表失败: ${error.message}`, 'error');
    }
  };

  const handleCheckGameStatus = async () => {
    try {
      addLog('🔄 检查游戏状态...');
      const currentGame = await fetchCurrentGame();
      if (currentGame) {
        const status = currentGame.state || currentGame.status;
        addLog(`📊 游戏状态检查:`, 'info');
        addLog(`   ID: ${currentGame.id}`, 'info');
        addLog(`   状态: ${status}`, 'info');
        addLog(`   状态码: ${currentGame.status}`, 'info');
        addLog(`   总回合: ${currentGame.max_turns || currentGame.turns_count || 0}`, 'info');
        addLog(`   已进行: ${currentGame.turns_count || 0}`, 'info');
        addLog(`   玩家数: ${currentGame.players_count || 0}`, 'info');
        
        // 检查是否可以归档
        if (status === 'archived' || currentGame.status === 2) {
          addLog('✅ 游戏已归档，可以创建新游戏', 'success');
        } else if (status === 'ongoing' || currentGame.status === 1) {
          addLog('⚠️ 游戏进行中，需要先完成游戏才能归档', 'error');
        } else if (status === 'waiting' || currentGame.status === 0) {
          addLog('ℹ️ 游戏等待中，可以直接使用或重新启动', 'info');
        } else {
          addLog(`❓ 未知状态: ${status} (${currentGame.status})`, 'error');
        }
      } else {
        addLog('ℹ️ 没有找到当前游戏', 'info');
      }
    } catch (error) {
      addLog(`❌ 检查游戏状态失败: ${error.message}`, 'error');
    }
  };

  const handleFetchTimeline = async () => {
    if (!gameId) {
      addLog('❌ 请输入游戏ID', 'error');
      return;
    }
    try {
      addLog(`🔄 获取游戏时间轴 (ID: ${gameId})...`);
      const result = await fetchGameTimeline(Number(gameId), token || null);
      addLog(`✅ 获取成功: 找到 ${result?.length || 0} 个历史事件`, 'success');
      if (result && result.length > 0) {
        addLog(`📜 时间轴预览:`, 'info');
        result.slice(0, 3).forEach((event, index) => {
          addLog(`   ${index + 1}. ${event.title || event.question_text || '历史事件'}`, 'info');
        });
        if (result.length > 3) {
          addLog(`   ... 还有 ${result.length - 3} 个事件`, 'info');
        }
      }
    } catch (error) {
      addLog(`❌ 获取失败: ${error.message}`, 'error');
    }
  };

  const handleTestAllAPIs = async () => {
    try {
      addLog('🚀 开始测试所有API...', 'info');
      
      // 1. 获取当前游戏
      addLog('1️⃣ 测试获取当前游戏...', 'info');
      await handleFetchCurrentGame();
      
      // 2. 获取游戏详情
      if (gameId) {
        addLog('2️⃣ 测试获取游戏详情...', 'info');
        await handleFetchGameDetail();
      }
      
      // 3. 获取当前回合
      if (gameId) {
        addLog('3️⃣ 测试获取当前回合...', 'info');
        await handleFetchCurrentTurn();
      }
      
      // 4. 获取时间轴
      if (gameId) {
        addLog('4️⃣ 测试获取时间轴...', 'info');
        await handleFetchTimeline();
      }
      
      addLog('✅ 所有API测试完成', 'success');
    } catch (error) {
      addLog(`❌ API测试失败: ${error.message}`, 'error');
    }
  };

  const handleClearAllData = () => {
    try {
      addLog('🧹 清除所有数据...', 'info');
      
      // 清除localStorage
      localStorage.removeItem('authToken');
      localStorage.removeItem('playerId');
      
      // 重置状态
      setToken('');
      setGameId('');
      clearLogs();
      
      addLog('✅ 所有数据已清除', 'success');
    } catch (error) {
      addLog(`❌ 清除数据失败: ${error.message}`, 'error');
    }
  };

  return (
    <div className="h-screen bg-gray-900 text-white p-4 overflow-y-auto">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-cyan-400">🎮 游戏开发控制面板</h1>
        
        {/* 状态显示 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2 text-cyan-300">游戏状态</h3>
            <p>ID: {gameMeta.id || 'N/A'}</p>
            <p>状态: {gameMeta.state}</p>
            <p>状态码: {gameMeta.statusCode}</p>
            <p>总回合: {gameMeta.totalRounds}</p>
            <p>已进行: {gameMeta.turnsCount}</p>
            <p>玩家数: {gameMeta.playersCount}</p>
          </div>
          
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2 text-cyan-300">回合信息</h3>
            <p>索引: {turn.index}</p>
            <p>阶段: {turn.phase}</p>
            <p>剩余时间: {turn.timeLeft}秒</p>
            <p>结束时间: {turn.turnEndsAt ? new Date(turn.turnEndsAt).toLocaleTimeString() : 'N/A'}</p>
          </div>
          
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2 text-cyan-300">玩家信息</h3>
            <p>总数: {players.total}</p>
            <p>已加入: {players.joined}</p>
            <p>已投票: {players.voted}</p>
          </div>
          
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2 text-cyan-300">UI状态</h3>
            <p>加载中: {ui.loading ? '是' : '否'}</p>
            <p>错误: {ui.error || '无'}</p>
            <p>Token: {token ? '已设置' : '未设置'}</p>
          </div>
        </div>

        {/* 输入控制 */}
        <div className="bg-gray-800 p-4 rounded-lg mb-6">
          <h3 className="text-lg font-semibold mb-4 text-cyan-300">输入控制</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">游戏ID</label>
              <input
                type="number"
                value={gameId}
                onChange={(e) => setGameId(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                placeholder="输入游戏ID"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Token</label>
              <input
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                placeholder="输入或自动获取"
              />
            </div>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="bg-gray-800 p-4 rounded-lg mb-6">
          <h3 className="text-lg font-semibold mb-4 text-cyan-300">操作控制</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            <button
              onClick={handleFetchCurrentGame}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm"
            >
              获取当前游戏
            </button>
            <button
              onClick={handleFetchGameDetail}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm"
            >
              获取游戏详情
            </button>
            <button
              onClick={handleFetchCurrentTurn}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm"
            >
              获取当前回合
            </button>
            <button
              onClick={handleStartGame}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded text-sm"
            >
              启动游戏
            </button>
            <button
              onClick={handleStartGameWithPlayerCheck}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded text-sm"
            >
              检查玩家后启动
            </button>
            <button
              onClick={handleInitTurn}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded text-sm"
            >
              初始化回合
            </button>
            <button
              onClick={handleSubmitTurn}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded text-sm"
            >
              提交回合
            </button>
            <button
              onClick={handleJoinGame}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded text-sm"
            >
              加入游戏
            </button>
            <button
              onClick={handleSubmitChoice}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded text-sm"
            >
              提交选择
            </button>
            <button
              onClick={handleCreateNewGame}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded text-sm"
            >
              创建新游戏
            </button>
            <button
              onClick={handleCountdownEnd}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded text-sm"
            >
              处理倒计时结束
            </button>
            <button
              onClick={handleUpdateCountdown}
              className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded text-sm"
            >
              更新倒计时
            </button>
            <button
              onClick={handleStartPolling}
              className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded text-sm"
            >
              启动轮询
            </button>
            <button
              onClick={handleStopPolling}
              className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded text-sm"
            >
              停止轮询
            </button>
            <button
              onClick={handleSetGameId}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded text-sm"
            >
              设置游戏ID
            </button>
            <button
              onClick={handleAutoSetGameId}
              className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 rounded text-sm"
            >
              自动获取游戏ID
            </button>
            <button
              onClick={handleClearError}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded text-sm"
            >
              清除错误
            </button>
            <button
              onClick={handleListGames}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 rounded text-sm"
            >
              查看游戏列表
            </button>
            <button
              onClick={handleCheckGameStatus}
              className="px-4 py-2 bg-pink-600 hover:bg-pink-700 rounded text-sm"
            >
              检查游戏状态
            </button>
            <button
              onClick={handleFetchTimeline}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded text-sm"
            >
              获取时间轴
            </button>
            <button
              onClick={handleTestAllAPIs}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded text-sm"
            >
              测试所有API
            </button>
            <button
              onClick={handleClearAllData}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-sm"
            >
              清除所有数据
            </button>
          </div>
        </div>

        {/* 日志显示 */}
        <div className="bg-gray-800 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-cyan-300">操作日志</h3>
            <button
              onClick={clearLogs}
              className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm"
            >
              清空日志
            </button>
          </div>
          <div className="bg-black p-4 rounded h-64 overflow-y-auto font-mono text-sm">
            {logs.length === 0 ? (
              <p className="text-gray-500">暂无日志</p>
            ) : (
              logs.map((log, index) => (
                <div key={index} className={`mb-1 ${
                  log.type === 'error' ? 'text-red-400' :
                  log.type === 'success' ? 'text-green-400' :
                  'text-gray-300'
                }`}>
                  <span className="text-gray-500">[{log.timestamp}]</span> {log.message}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DevControlPanel;
