// 游戏 API 调用层 - 每个端点一个函数
import { http } from './http.js';

export const gameApi = {
  // 获取当前游戏
  async getCurrentGame() {
    return await http.get('/api/game/current');
  },

  // 获取游戏详情
  async getGameDetail(gameId) {
    return await http.get(`/api/game/${gameId}/detail`);
  },

  // 开始游戏
  async startGame(gameId, token) {
    return await http.post(`/api/game/${gameId}/start`, null, token);
  },

  // 归档游戏
  async archiveGame(gameId, token) {
    return await http.post(`/api/game/${gameId}/archive`, null, token);
  },

  // 结束游戏（将状态设为 finished）
  async finishGame(gameId, token) {
    return await http.post(`/api/game/${gameId}/finish`, null, token);
  },

  // 获取当前回合
  async getCurrentTurn(gameId, token) {
    return await http.get(`/api/game/${gameId}/turn/current`, token);
  },

  // 初始化回合
  async initTurn(gameId, token) {
    return await http.post(`/api/game/${gameId}/turn/init`, null, token);
  },

  // 提交回合
  async submitTurn(gameId, token) {
    return await http.post(`/api/game/${gameId}/turn/submit`, null, token);
  },

  
  // 获取我的资料
  async getMyProfile(token) {
    return await http.get('/api/game/my_profile', token);
  },

  // 加入游戏
  async joinGame(gameId, authToken = null) {
    return await http.post(`/api/game/${gameId}/player/init`, null, authToken);
  },

  // 提交选择
  async submitChoice(gameId, optionId, token) {
    return await http.post(`/api/game/${gameId}/player/submit`, { option_id: optionId }, token);
  },

  // 获取游戏timeline
  async getGameTimeline(gameId, token) {
    return await http.get(`/api/game/${gameId}/player/history`, token);
  },

  // 获取游戏个人总结
  async getGamePersonalSummary(gameId, token) {
    return await http.get(`/api/game/${gameId}/player/summary`, token);
  },

  // 获取玩家最终结果和角色档案
  async getPlayerResult(gameId, token) {
    return await http.get(`/api/game/${gameId}/player/result`, token);
  },

  async getGameEnding(gameId, token) {
    return await http.get(`/api/game/${gameId}/ending`, token);
  },
};
