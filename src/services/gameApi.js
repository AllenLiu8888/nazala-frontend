// Game API layer - one function per endpoint
import { http } from './http.js';

export const gameApi = {
  // Get current game
  async getCurrentGame() {
    return await http.get('/api/game/current');
  },

  // Get game detail
  async getGameDetail(gameId) {
    return await http.get(`/api/game/${gameId}/detail/`);
  },

  // Start game (optional payload e.g., { max_turns, show_values })
  async startGame(gameId, token, payload = null) {
    return await http.post(`/api/game/${gameId}/start`, payload, token);
  },

  // Archive game
  async archiveGame(gameId, token) {
    return await http.post(`/api/game/${gameId}/archive`, null, token);
  },

  // Finish game (set status to finished)
  async finishGame(gameId, token) {
    return await http.post(`/api/game/${gameId}/finish`, null, token);
  },

  // Get current turn
  async getCurrentTurn(gameId, token) {
    return await http.get(`/api/game/${gameId}/turn/current`, token);
  },

  // Initialize turn
  async initTurn(gameId, token) {
    return await http.post(`/api/game/${gameId}/turn/init`, null, token);
  },

  // Submit turn
  async submitTurn(gameId, token) {
    return await http.post(`/api/game/${gameId}/turn/submit`, null, token);
  },

  
  // Get my profile
  async getMyProfile(token) {
    return await http.get('/api/game/my_profile', token);
  },

  // Join game
  async joinGame(gameId, authToken = null) {
    return await http.post(`/api/game/${gameId}/player/init`, null, authToken);
  },

  // Submit choice
  async submitChoice(gameId, optionId, token) {
    return await http.post(`/api/game/${gameId}/player/submit`, { option_id: optionId }, token);
  },

  // Get game timeline
  async getGameTimeline(gameId, token) {
    return await http.get(`/api/game/${gameId}/player/history`, token);
  },

  // Get game personal summary
  async getGamePersonalSummary(gameId, token) {
    return await http.get(`/api/game/${gameId}/player/summary`, token);
  },

  // Get player's final result and profile
  async getPlayerResult(gameId, token) {
    return await http.get(`/api/game/${gameId}/player/result`, token);
  },

  async getGameEnding(gameId, token) {
    return await http.get(`/api/game/${gameId}/ending`, token);
  },
};
