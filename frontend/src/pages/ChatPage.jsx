import { useState, useRef, useEffect } from 'react'
import { Send, ThumbsUp, ThumbsDown, Loader2, Bot, User } from 'lucide-react'
import { sendMessage, submitFeedback } from '../api'

const USER_ID = 'demo_user'   // hardcoded for demo

export default function ChatPage() {
  const [messages, setMessages]         = useState([])
  const [input, setInput]               = useState('')
  const [loading, setLoading]           = useState(false)
  const [conversationId, setConversationId] = useState(null)
  const [feedback, setFeedback]         = useState({})  // {messageId: rating}
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || loading) return
    const userText = input.trim()
    setInput('')
    setLoading(true)

    setMessages(m => [...m, { role: 'user', content: userText }])

    try {
      const res = await sendMessage(USER_ID, userText, conversationId)
      if (!conversationId) setConversationId(res.conversation_id)
      setMessages(m => [...m, {
        role: 'assistant',
        content: res.content,
        id: res.message_id,
        model: res.model,
        variant: res.variant,
        latency: res.latency_ms,
      }])
    } catch (e) {
      setMessages(m => [...m, { role: 'error', content: 'Request failed. Is the API running?' }])
    } finally {
      setLoading(false)
    }
  }

  const handleFeedback = async (messageId, rating) => {
    if (feedback[messageId]) return  // already rated
    setFeedback(f => ({ ...f, [messageId]: rating }))
    await submitFeedback(messageId, USER_ID, rating)
  }

  return (
    <div className="flex flex-col h-[calc(100vh-57px)]">

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 max-w-3xl mx-auto w-full">

        {messages.length === 0 && (
          <div className="text-center py-24">
            <div className="text-5xl mb-4">⚡</div>
            <div className="font-display text-2xl font-bold text-[#dce8f5] mb-2">
              IteraLLM Chat
            </div>
            <div className="text-[#5a7a99] text-sm">
              Start a conversation. Responses are tracked by experiment variant.
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>

            {msg.role !== 'user' && (
              <div className="w-8 h-8 rounded-lg bg-[#0d1520] border border-[#162030] flex items-center justify-center flex-shrink-0 mt-1">
                <Bot size={14} className="text-[#00d4ff]" />
              </div>
            )}

            <div className={`max-w-[75%] ${msg.role === 'user' ? 'order-first' : ''}`}>
              <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-[#00d4ff14] border border-[#00d4ff22] text-[#dce8f5] rounded-tr-sm ml-auto'
                  : msg.role === 'error'
                  ? 'bg-red-900/20 border border-red-500/20 text-red-300'
                  : 'bg-[#0d1520] border border-[#162030] text-[#dce8f5] rounded-tl-sm'
              }`}>
                {msg.content}
              </div>

              {/* Metadata + Feedback for assistant messages */}
              {msg.role === 'assistant' && (
                <div className="flex items-center gap-3 mt-2 px-1">
                  <span className="font-mono text-[10px] text-[#2a3d52]">{msg.model}</span>
                  {msg.variant && (
                    <span className="font-mono text-[10px] bg-[#bc8cff14] text-[#bc8cff] border border-[#bc8cff22] px-2 py-0.5 rounded">
                      {msg.variant}
                    </span>
                  )}
                  {msg.latency && (
                    <span className="font-mono text-[10px] text-[#2a3d52]">{msg.latency}ms</span>
                  )}
                  <div className="ml-auto flex gap-1">
                    {['thumbs_up', 'thumbs_down'].map(rating => (
                      <button
                        key={rating}
                        onClick={() => handleFeedback(msg.id, rating)}
                        className={`p-1 rounded transition-all ${
                          feedback[msg.id] === rating
                            ? rating === 'thumbs_up'
                              ? 'text-[#00ff9d]'
                              : 'text-red-400'
                            : 'text-[#2a3d52] hover:text-[#5a7a99]'
                        } ${feedback[msg.id] && feedback[msg.id] !== rating ? 'opacity-30' : ''}`}
                      >
                        {rating === 'thumbs_up'
                          ? <ThumbsUp size={12} />
                          : <ThumbsDown size={12} />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-lg bg-[#00d4ff14] border border-[#00d4ff22] flex items-center justify-center flex-shrink-0 mt-1">
                <User size={14} className="text-[#00d4ff]" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-lg bg-[#0d1520] border border-[#162030] flex items-center justify-center">
              <Bot size={14} className="text-[#00d4ff]" />
            </div>
            <div className="bg-[#0d1520] border border-[#162030] rounded-2xl rounded-tl-sm px-4 py-3">
              <Loader2 size={14} className="text-[#5a7a99] animate-spin" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input Bar */}
      <div className="border-t border-[#162030] bg-[#080d14] px-4 py-4">
        <div className="max-w-3xl mx-auto flex gap-3">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Send a message..."
            className="flex-1 bg-[#0d1520] border border-[#162030] rounded-xl px-4 py-3 text-sm text-[#dce8f5] placeholder-[#2a3d52] outline-none focus:border-[#00d4ff44] transition-colors"
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="bg-[#00d4ff14] border border-[#00d4ff33] text-[#00d4ff] rounded-xl px-4 py-3 hover:bg-[#00d4ff22] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <Send size={16} />
          </button>
          {conversationId && (
            <button
              onClick={() => { setMessages([]); setConversationId(null) }}
              className="text-[#2a3d52] hover:text-[#5a7a99] text-xs font-mono px-2 transition-colors"
            >new
            </button>
          )}
        </div>
      </div>
    </div>
  )
}