import { useState, useEffect } from 'react';
import { gameApi } from '../../services/gameApi';

function AdminDashboard() {
  const [currentGame, setCurrentGame] = useState(null);
  const [currentTurn, setCurrentTurn] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [apiResults, setApiResults] = useState({});
  const [testPlayer, setTestPlayer] = useState(null);

  // API结构文档
  const apiDocumentation = [
    {
      title: "游戏管理 API",
      apis: [
        {
          name: "获取当前游戏",
          method: "GET",
          endpoint: "/api/game/current/",
          auth: "不需要",
          description: "获取最新游戏详情，如果最新游戏已归档则创建新游戏",
          responseStructure: {
            status: "boolean",
            data: {
              game: {
                id: "number",
                status: "number (0=等待中, 1=进行中, 10=已结束, 20=已归档)",
                max_turns: "number",
                join_token: "string",
                started_at: "string (ISO)",
                ended_at: "string (ISO) | null",
                players_count: "number",
                turns_count: "number"
              }
            }
          }
        },
        {
          name: "获取游戏详情",
          method: "GET",
          endpoint: "/api/game/{game_id}/detail/",
          auth: "不需要",
          description: "获取指定游戏的详情",
          responseStructure: "同获取当前游戏"
        },
        {
          name: "开始游戏",
          method: "POST",
          endpoint: "/api/game/{game_id}/start/",
          auth: "不需要",
          description: "将游戏状态从等待中改为进行中",
          responseStructure: "同获取当前游戏"
        },
        {
          name: "归档游戏",
          method: "POST",
          endpoint: "/api/game/{game_id}/archive/",
          auth: "不需要",
          description: "将游戏状态从已结束改为已归档",
          responseStructure: "同获取当前游戏"
        }
      ]
    },
    {
      title: "回合管理 API",
      apis: [
        {
          name: "获取当前回合",
          method: "GET",
          endpoint: "/api/game/{game_id}/turn/current",
          auth: "不需要",
          description: "获取当前回合详情和选项",
          responseStructure: {
            status: "boolean",
            data: {
              turn: {
                id: "number",
                game: "Game对象",
                index: "number",
                status: "number",
                question_text: "string",
                options: ["Option对象数组"],
                created_at: "string (ISO)",
                updated_at: "string (ISO)",
                total_players: "number",
                total_choices: "number"
              }
            }
          }
        },
        {
          name: "初始化回合",
          method: "POST",
          endpoint: "/api/game/{game_id}/turn/init",
          auth: "不需要",
          description: "生成第一个回合（如果不存在）",
          responseStructure: "同获取当前回合"
        },
        {
          name: "提交回合",
          method: "POST",
          endpoint: "/api/game/{game_id}/turn/submit",
          auth: "不需要",
          description: "提交当前回合的所有选择到LLM并生成下一回合",
          responseStructure: {
            status: "boolean",
            data: {
              next_turn: "Turn对象"
            }
          }
        }
      ]
    },
    {
      title: "玩家管理 API",
      apis: [
        {
          name: "获取我的资料",
          method: "GET",
          endpoint: "/api/game/my_profile/",
          auth: "需要Token",
          description: "获取当前认证玩家的资料",
          responseStructure: {
            status: "boolean",
            data: {
              player: {
                id: "number",
                game: "Game对象",
                auth_token: "string",
                token_expires_at: "string (ISO)"
              }
            }
          }
        },
        {
          name: "加入游戏",
          method: "POST",
          endpoint: "/api/game/{game_id}/player/init/",
          auth: "可选",
          description: "创建新玩家加入游戏",
          requestBody: {
            display_name: "string (可选)"
          },
          responseStructure: "同获取我的资料"
        },
        {
          name: "提交选择",
          method: "POST",
          endpoint: "/api/game/{game_id}/player/submit/",
          auth: "需要Token",
          description: "玩家为当前回合提交选择",
          requestBody: {
            option_id: "number"
          },
          responseStructure: {
            status: "boolean",
            data: {
              option: "Option对象",
              turn: "Turn对象",
              game: "Game对象"
            }
          }
        }
      ]
    }
  ];

  useEffect(() => {
    loadGameData();
    const interval = setInterval(loadGameData, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadGameData = async () => {
    try {
      // 只在初始加载时显示loading，避免自动刷新时一直显示loading状态
      const isInitialLoad = !currentGame;
      if (isInitialLoad) {
        setLoading(true);
      }

      const gameData = await gameApi.getCurrentGame();
      console.log('🔄 加载游戏数据原始返回:', gameData);
      const game = gameData.game; // 提取game对象
      console.log('🔄 提取后的游戏对象:', game);
      setCurrentGame(game);

      if (game && game.id && game.status === 1) {
        try {
          const turnData = await gameApi.getCurrentTurn(game.id);
          console.log('🔄 加载回合数据:', turnData);
          const turn = turnData.turn; // 提取turn对象
          setCurrentTurn(turn);
        } catch {
          setCurrentTurn(null);
        }
      } else {
        setCurrentTurn(null);
      }
    } catch (err) {
      console.error('❌ 加载游戏数据失败:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const testApi = async (apiName, apiFunction, showResult = true) => {
    try {
      console.log(`🚀 开始测试 ${apiName} API...`);
      setApiResults(prev => ({ ...prev, [apiName]: { loading: true } }));
      const result = await apiFunction();
      setApiResults(prev => ({
        ...prev,
        [apiName]: {
          loading: false,
          success: true,
          data: result,
          timestamp: new Date().toLocaleTimeString()
        }
      }));
      if (showResult) {
        console.log(`✅ ${apiName} API 测试成功:`, result);
      }
      return result;
    } catch (err) {
      console.error(`❌ ${apiName} API 测试失败:`, err);
      console.error('错误详情:', {
        message: err.message,
        stack: err.stack,
        name: err.name
      });
      setApiResults(prev => ({
        ...prev,
        [apiName]: {
          loading: false,
          success: false,
          error: err.message,
          timestamp: new Date().toLocaleTimeString()
        }
      }));
      throw err;
    }
  };

  const handleStartGame = async () => {
    try {
      const result = await testApi('开始游戏', async () => {
        const gameData = await gameApi.startGame(currentGame.id);
        return gameData.game; // 提取game对象
      }, false);
      await loadGameData();
      return result;
    } catch (error) {
      console.error('开始游戏失败:', error);
      throw error;
    }
  };

  const handleArchiveGame = async () => {
    try {
      const result = await testApi('归档游戏', async () => {
        const gameData = await gameApi.archiveGame(currentGame.id);
        return gameData.game; // 提取game对象
      }, false);
      await loadGameData();
      return result;
    } catch (error) {
      console.error('归档游戏失败:', error);
      throw error;
    }
  };

  const handleInitTurn = async () => {
    try {
      const result = await testApi('初始化回合', async () => {
        const turnData = await gameApi.initTurn(currentGame.id);
        return turnData.turn; // 提取turn对象
      }, false);
      await loadGameData();
      return result;
    } catch (error) {
      console.error('初始化回合失败:', error);
      throw error;
    }
  };

  const handleSubmitTurn = async () => {
    try {
      const result = await testApi('提交回合', async () => {
        const turnData = await gameApi.submitTurn(currentGame.id);
        return turnData.next_turn; // 提取next_turn对象
      }, false);
      await loadGameData();
      return result;
    } catch (error) {
      console.error('提交回合失败:', error);
      throw error;
    }
  };

  const createTestPlayer = async () => {
    try {
      const playerData = await testApi('加入游戏', () => gameApi.joinGame(currentGame.id, "测试玩家_" + Math.random().toString(36).slice(2, 7)));
      const player = playerData.player; // 提取player对象
      setTestPlayer(player);
      await loadGameData();
      return player;
    } catch (error) {
      console.error('创建测试玩家失败:', error);
      throw error;
    }
  };

  const submitTestChoice = async () => {
    if (!testPlayer || !currentTurn || !currentTurn.options.length) {
      throw new Error('无法提交选择：缺少必要数据');
    }
    try {
      const randomOption = currentTurn.options[Math.floor(Math.random() * currentTurn.options.length)];
      const result = await testApi('提交选择', () => gameApi.submitChoice(currentGame.id, randomOption.id, testPlayer.auth_token));
      await loadGameData();
      return result;
    } catch (error) {
      console.error('提交选择失败:', error);
      throw error;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 0: return '等待中';
      case 1: return '进行中';
      case 10: return '已结束';
      case 20: return '已归档';
      default: return '未知';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 0: return 'text-yellow-400';
      case 1: return 'text-green-400';
      case 10: return 'text-blue-400';
      case 20: return 'text-gray-400';
      default: return 'text-white';
    }
  };

  const ApiTestButton = ({ apiName, onClick, disabled = false, className = "" }) => {
    const result = apiResults[apiName];
    // 只使用API特定的loading状态，不使用全局loading
    const isApiLoading = result?.loading === true;
    const isDisabled = disabled || isApiLoading;

    const buttonClass = result?.success === true ? 'bg-green-600 hover:bg-green-700' :
                       result?.success === false ? 'bg-red-600 hover:bg-red-700' :
                       'bg-cyan-600 hover:bg-cyan-700';

    const handleClick = () => {
      if (!isDisabled && onClick) {
        console.log(`🔘 开始点击按钮: ${apiName}`);
        onClick().catch(err => {
          console.error(`🔘 按钮点击处理失败: ${apiName}`, err);
        });
      } else {
        console.log(`🔘 按钮被禁用或正在加载: ${apiName}`, { isDisabled, isApiLoading, disabled });
      }
    };

    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={isDisabled}
        className={`${buttonClass} disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded text-sm transition duration-200 ${className}`}
      >
        {isApiLoading ? '测试中...' : apiName}
        {result?.timestamp && (
          <div className="text-xs opacity-75 mt-1">
            {result.timestamp}
          </div>
        )}
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">游戏管理后台 - API 测试中心</h1>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded mb-6">
            错误: {error}
            <button
              onClick={() => setError(null)}
              className="ml-4 text-red-200 hover:text-white"
            >
              ✕
            </button>
          </div>
        )}

        {loading && (
          <div className="text-center mb-6">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            <span className="ml-2">加载中...</span>
          </div>
        )}

        {/* API 文档和测试 */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
          {/* API 文档 */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-6">API 文档</h2>
            <div className="space-y-6 max-h-96 overflow-y-auto">
              {apiDocumentation.map((section, sectionIndex) => (
                <div key={sectionIndex} className="border-b border-gray-700 pb-4">
                  <h3 className="text-lg font-semibold text-blue-400 mb-3">{section.title}</h3>
                  <div className="space-y-3">
                    {section.apis.map((api, apiIndex) => (
                      <div key={apiIndex} className="bg-gray-700 p-3 rounded text-sm">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-1 rounded text-xs font-mono ${
                            api.method === 'GET' ? 'bg-green-600' : 'bg-blue-600'
                          }`}>
                            {api.method}
                          </span>
                          <span className="font-mono text-yellow-300">{api.endpoint}</span>
                          <span className="text-xs text-gray-400">({api.auth})</span>
                        </div>
                        <p className="text-gray-300 mb-2">{api.description}</p>
                        <details className="text-xs">
                          <summary className="cursor-pointer text-blue-400 hover:text-blue-300">
                            查看数据结构
                          </summary>
                          <pre className="mt-2 bg-gray-900 p-2 rounded overflow-x-auto">
                            {JSON.stringify(api.responseStructure, null, 2)}
                          </pre>
                        </details>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 快速测试面板 */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-6">快速测试面板</h2>
            <div className="space-y-4">

              {/* 基础游戏API测试 */}
              <div className="border border-gray-600 rounded p-4">
                <h3 className="text-lg font-semibold mb-3 text-green-400">游戏管理 API</h3>
                <div className="grid grid-cols-2 gap-2">
                  <ApiTestButton
                    apiName="获取当前游戏"
                    onClick={async () => await testApi('获取当前游戏', async () => {
                      const gameData = await gameApi.getCurrentGame();
                      return gameData.game; // 提取game对象
                    })}
                  />
                  <ApiTestButton
                    apiName="获取游戏详情"
                    onClick={async () => {
                      console.log('🔍 当前游戏ID:', currentGame?.id);
                      return await testApi('获取游戏详情', async () => {
                        const gameData = await gameApi.getGameDetail(currentGame.id);
                        return gameData.game; // 提取game对象
                      });
                    }}
                    disabled={!currentGame || !currentGame.id}
                  />
                  {currentGame?.status === 0 && (
                    <ApiTestButton
                      apiName="开始游戏"
                      onClick={handleStartGame}
                      className="col-span-2"
                    />
                  )}
                  {currentGame?.status === 10 && (
                    <ApiTestButton
                      apiName="归档游戏"
                      onClick={handleArchiveGame}
                      className="col-span-2"
                    />
                  )}
                </div>
              </div>

              {/* 回合管理API测试 */}
              <div className="border border-gray-600 rounded p-4">
                <h3 className="text-lg font-semibold mb-3 text-blue-400">回合管理 API</h3>
                <div className="grid grid-cols-2 gap-2">
                  <ApiTestButton
                    apiName="获取当前回合"
                    onClick={async () => await testApi('获取当前回合', async () => {
                      const turnData = await gameApi.getCurrentTurn(currentGame.id);
                      return turnData.turn; // 提取turn对象
                    })}
                    disabled={!currentGame || !currentGame.id || currentGame.status !== 1}
                  />
                  {currentGame?.status === 1 && !currentTurn && (
                    <ApiTestButton
                      apiName="初始化回合"
                      onClick={handleInitTurn}
                    />
                  )}
                  {currentGame?.status === 1 && currentTurn && currentTurn.total_choices >= currentTurn.total_players && (
                    <ApiTestButton
                      apiName="提交回合"
                      onClick={handleSubmitTurn}
                      className="col-span-2"
                    />
                  )}
                </div>
              </div>

              {/* 玩家API测试 */}
              <div className="border border-gray-600 rounded p-4">
                <h3 className="text-lg font-semibold mb-3 text-purple-400">玩家管理 API</h3>
                <div className="grid grid-cols-2 gap-2">
                  <ApiTestButton
                    apiName="加入游戏"
                    onClick={createTestPlayer}
                    disabled={!currentGame || !currentGame.id}
                  />
                  {testPlayer && (
                    <ApiTestButton
                      apiName="获取我的资料"
                      onClick={async () => await testApi('获取我的资料', async () => {
                        const playerData = await gameApi.getMyProfile(testPlayer.auth_token);
                        return playerData.player; // 提取player对象
                      })}
                    />
                  )}
                  {testPlayer && currentTurn && currentTurn.options?.length > 0 && (
                    <ApiTestButton
                      apiName="提交选择"
                      onClick={submitTestChoice}
                      className="col-span-2"
                    />
                  )}
                </div>
                {testPlayer && (
                  <div className="mt-3 p-2 bg-gray-700 rounded text-xs">
                    <strong>测试玩家:</strong> ID {testPlayer.id}, Token: {testPlayer.auth_token?.slice(0, 20)}...
                  </div>
                )}
              </div>

              {/* 调试测试 */}
              <div className="border border-gray-600 rounded p-4">
                <h3 className="text-lg font-semibold mb-3 text-orange-400">调试测试</h3>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      console.log('🔍 当前游戏状态:', currentGame);
                      console.log('🔍 API Base URL:', import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8001');
                    }}
                    className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded text-sm transition duration-200"
                  >
                    调试状态
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        console.log('🔍 直接fetch测试...');
                        const response = await fetch('http://127.0.0.1:8001/api/game/current/');
                        const data = await response.json();
                        console.log('🔍 直接fetch结果:', data);
                      } catch (err) {
                        console.error('🔍 直接fetch失败:', err);
                      }
                    }}
                    className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded text-sm transition duration-200"
                  >
                    直接Fetch测试
                  </button>
                </div>
              </div>

              {/* 测试结果显示 */}
              <div className="border border-gray-600 rounded p-4">
                <h3 className="text-lg font-semibold mb-3 text-yellow-400">最近测试结果</h3>
                <div className="max-h-40 overflow-y-auto space-y-2 text-sm">
                  {Object.entries(apiResults).slice(-5).map(([apiName, result]) => (
                    <div key={apiName} className={`p-2 rounded ${
                      result.success ? 'bg-green-900/30 border border-green-500/30' :
                      result.success === false ? 'bg-red-900/30 border border-red-500/30' :
                      'bg-gray-700'
                    }`}>
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{apiName}</span>
                        <span className="text-xs">{result.timestamp}</span>
                      </div>
                      {result.error && (
                        <div className="text-red-300 text-xs mt-1">{result.error}</div>
                      )}
                      {result.success && (
                        <div className="text-green-300 text-xs mt-1">
                          ✓ 成功 - 数据已输出到控制台
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 当前游戏状态 */}
        {currentGame && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 游戏信息卡片 */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">当前游戏信息</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">游戏ID:</span>
                  <span>{currentGame.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">状态:</span>
                  <span className={getStatusColor(currentGame.status)}>
                    {getStatusText(currentGame.status)} ({currentGame.status})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">最大回合数:</span>
                  <span>{currentGame.max_turns}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">当前回合数:</span>
                  <span>{currentGame.turns_count}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">玩家数量:</span>
                  <span>{currentGame.players_count}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">加入码:</span>
                  <span className="font-mono bg-gray-700 px-2 py-1 rounded text-sm">
                    {currentGame.join_token}
                  </span>
                </div>
                {currentGame.started_at && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">开始时间:</span>
                    <span>{new Date(currentGame.started_at).toLocaleString()}</span>
                  </div>
                )}
                {currentGame.ended_at && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">结束时间:</span>
                    <span>{new Date(currentGame.ended_at).toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>

            {/* 当前回合信息 */}
            {currentTurn ? (
              <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">当前回合信息</h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">回合ID:</span>
                    <span>{currentTurn.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">回合索引:</span>
                    <span>{currentTurn.index}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">状态:</span>
                    <span>{currentTurn.status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">投票进度:</span>
                    <span>{currentTurn.total_choices}/{currentTurn.total_players}</span>
                  </div>
                  <div>
                    <div className="text-gray-400 mb-2">问题:</div>
                    <div className="bg-gray-700 p-3 rounded text-sm">
                      {currentTurn.question_text}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-400 mb-2">选项数量:</div>
                    <span>{currentTurn.options?.length || 0} 个选项</span>
                  </div>
                </div>
              </div>
            ) : currentGame.status === 1 ? (
              <div className="bg-gray-800 rounded-lg p-6 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-gray-400 mb-2">当前回合</div>
                  <div className="text-yellow-400">未初始化</div>
                  <div className="text-sm text-gray-500 mt-2">需要初始化第一个回合</div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-800 rounded-lg p-6 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-gray-400 mb-2">当前回合</div>
                  <div className="text-gray-500">游戏未开始</div>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mt-8 text-center text-gray-400 text-sm">
          <p>💡 提示: API 测试结果会显示在浏览器控制台中，按 F12 打开开发者工具查看详细信息</p>
          <p className="mt-2">🔄 页面每5秒自动刷新游戏数据</p>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;