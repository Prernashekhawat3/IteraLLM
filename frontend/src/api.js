import axios from 'axios'

const api = axios.create({ baseURL: '/', timeout: 30000 })

// ── Chat ──────────────────────────────────────────────────
export const sendMessage = (userId, message, conversationId = null) =>
  api.post('/chat/send', { user_id: userId, message, conversation_id: conversationId })
    .then(r => r.data)

export const getHistory = (conversationId) =>
  api.get(`/chat/${conversationId}/history`).then(r => r.data)

// ── Arena ─────────────────────────────────────────────────
export const compareModels = (prompt, models, systemPrompt, maxTokens, configs = null) =>
  api.post('/arena/compare', {
    prompt, models,
    system_prompt: systemPrompt,
    max_tokens: maxTokens,
    configs
  }).then(r => r.data)

export const validateConfig = (provider, model, apiKey) =>
  api.post('/arena/validate', { provider, model, api_key: apiKey }).then(r => r.data)

export const listModels = () =>
  api.get('/arena/models').then(r => r.data)

// ── Feedback ──────────────────────────────────────────────
export const submitFeedback = (messageId, userId, rating, comment = '') =>
  api.post('/feedback/submit', {
    message_id: messageId, user_id: userId, rating, comment
  }).then(r => r.data)

export const getFeedbackStats = () =>
  api.get('/feedback/stats').then(r => r.data)

// ── Health ────────────────────────────────────────────────
export const getHealth = () =>
  api.get('/health').then(r => r.data)