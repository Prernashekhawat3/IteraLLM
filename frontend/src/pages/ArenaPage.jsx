import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Zap, DollarSign, Hash, Loader2, Trophy } from 'lucide-react'
import { compareModels, listModels } from '../api'

const AVAILABLE_MODELS = [
  { id: 'gpt-4o-mini',            label: 'GPT-4o-mini',    color: '#00ff9d' },
  { id: 'claude-haiku-4-5-20251001', label: 'Claude Haiku',   color: '#bc8cff' },
  { id: 'groq',                   label: 'Groq',         color: '#ffb347' },
  { id: 'gpt-4o',                    label: 'GPT-4o',         color: '#00d4ff' },
]

export default function ArenaPage() {
  const [prompt, setPrompt]           = useState('')
  const [selected, setSelected]       = useState(['gpt-4o-mini', 'claude-haiku-4-5-20251001'])
  const [systemPrompt, setSystemPrompt] = useState('You are a helpful assistant.')
  const [results, setResults]         = useState(null)
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState(null)

  const toggleModel = (id) => {
    setSelected(s => s.includes(id)
      ? s.filter(m => m !== id)
      : [...s, id]
    )
  }

  const handleCompare = async () => {
    if (!prompt.trim() || selected.length < 2 || loading) return
    setLoading(true)
    setError(null)
    setResults(null)
    try {
      const data = await compareModels(prompt, selected, systemPrompt, 512)
      setResults(data)
    } catch (e) {
      setError('Comparison failed. Check your API keys and server.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-[calc(100vh-57px)] overflow-y-auto px-6 py-6 max-w-6xl mx-auto">

      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold mb-1">Model Arena</h1>
        <p className="text-[#5a7a99] text-sm">Send the same prompt to multiple models simultaneously. Compare latency, tokens, and cost.</p>
      </div>

      {/* Config Panel */}
      <div className="bg-[#080d14] border border-[#162030] rounded-2xl p-5 mb-5">

        {/* Model Selector */}
        <div className="mb-4">
          <label className="font-mono text-[10px] font-bold tracking-widest text-[#2a3d52] uppercase block mb-2">Models</label>
          <div className="flex gap-2 flex-wrap">
            {AVAILABLE_MODELS.map(({ id, label, color }) => (
              <button
                key={id}
                onClick={() => toggleModel(id)}
                style={selected.includes(id) ? { borderColor: color + '44', color, background: color + '10' } : {}}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium border transition-all ${
                  selected.includes(id)
                    ? ''
                    : 'border-[#162030] text-[#5a7a99] hover:border-[#1c2d40] hover:text-[#dce8f5]'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* System Prompt */}
        <div className="mb-4">
          <label className="font-mono text-[10px] font-bold tracking-widest text-[#2a3d52] uppercase block mb-2">System Prompt</label>
          <input
            value={systemPrompt}
            onChange={e => setSystemPrompt(e.target.value)}
            className="w-full bg-[#0d1520] border border-[#162030] rounded-xl px-4 py-2.5 text-sm text-[#dce8f5] placeholder-[#2a3d52] outline-none focus:border-[#ffb34744] transition-colors font-mono"
          />
        </div>

        {/* Prompt Input */}
        <div className="mb-4">
          <label className="font-mono text-[10px] font-bold tracking-widest text-[#2a3d52] uppercase block mb-2">Prompt</label>
          <textarea
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            rows={3}
            placeholder="e.g. Explain Redis in one paragraph..."
            className="w-full bg-[#0d1520] border border-[#162030] rounded-xl px-4 py-3 text-sm text-[#dce8f5] placeholder-[#2a3d52] outline-none focus:border-[#ffb34744] transition-colors resize-none"
          />
        </div>

        <button
          onClick={handleCompare}
          disabled={loading || !prompt.trim() || selected.length < 2}
          className="w-full bg-[#ffb34714] border border-[#ffb34733] text-[#ffb347] rounded-xl py-3 text-sm font-medium hover:bg-[#ffb34722] disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
        >
          {loading ? <><Loader2 size={15} className="animate-spin" /> Comparing...</>
                   : <><Zap size={15} /> Compare {selected.length} Models</>}
        </button>
      </div>

      {error && <div className="bg-red-900/20 border border-red-500/20 text-red-300 rounded-xl px-4 py-3 text-sm mb-5">{error}</div>}

      {/* Results */}
      {results && (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <span className="font-mono text-[10px] font-bold tracking-widest text-[#2a3d52] uppercase">Results</span>
            <span className="font-mono text-[10px] text-[#5a7a99]">total {results.total_duration_ms}ms</span>
            {results.fastest_model && <span className="font-mono text-[10px] bg-[#00ff9d10] text-[#00ff9d] border border-[#00ff9d22] px-2 py-0.5 rounded">⚡ fastest: {results.fastest_model}</span>}
            {results.cheapest_model && <span className="font-mono text-[10px] bg-[#00d4ff10] text-[#00d4ff] border border-[#00d4ff22] px-2 py-0.5 rounded">💰 cheapest: {results.cheapest_model}</span>}
          </div>

          <div className={`grid gap-4 ${results.results.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
            {results.results.map((r, i) => {
              const modelInfo = AVAILABLE_MODELS.find(m => m.id === r.model)
              const color = modelInfo?.color || '#5a7a99'
              const isFastest  = r.model === results.fastest_model
              const isCheapest = r.model === results.cheapest_model
              return (
                <div key={i} style={{ borderColor: color + '22' }}
                  className="bg-[#080d14] border rounded-2xl p-5 flex flex-col gap-4">

                  <div className="flex items-center justify-between">
                    <span style={{ color }} className="font-mono text-xs font-bold">{r.model}</span>
                    <span className="font-mono text-[10px] text-[#2a3d52]">{r.provider}</span>
                  </div>

                  {r.status === 'error'
                    ? <div className="text-red-400 text-xs font-mono">Error: {r.error}</div>
                    : <>
                        <p className="text-sm text-[#dce8f5] leading-relaxed flex-1 border-t border-[#162030] pt-3">{r.content}</p>
                        <div className="grid grid-cols-2 gap-2 border-t border-[#162030] pt-3">
                          {[
                            { icon: <Zap size={10}/>, label: 'latency', val: `${r.latency_ms}ms`, best: isFastest },
                            { icon: <Hash size={10}/>, label: 'tokens',  val: r.completion_tokens, best: false },
                            { icon: <DollarSign size={10}/>, label: 'cost', val: `$${r.cost_usd?.toFixed(6)}`, best: isCheapest },
                            { icon: null, label: 'status', val: r.status, best: false },
                          ].map(({ icon, label, val, best }) => (
                            <div key={label} className="bg-[#0d1520] rounded-lg p-2">
                              <div className="font-mono text-[9px] text-[#2a3d52] uppercase tracking-wider mb-1">{label}</div>
                              <div className={`font-mono text-xs font-bold ${best ? 'text-[#00ff9d]' : 'text-[#5a7a99]'}`}>{val}</div>
                            </div>
                          ))}
                        </div>
                      </>
                  }
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
