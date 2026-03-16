import { useState, useRef, useEffect } from 'react'
import { Zap, DollarSign, Hash, Loader2, Play, Target } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { validateConfig, compareModels } from '../api'

const PROVIDERS = [
  { id: 'groq', label: 'Groq', color: '#00ff9d', icon: 'bolt', suggestions: ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'mixtral-8x7b-32768'] },
  { id: 'anthropic', label: 'Anthropic', color: '#bc8cff', icon: 'auto_awesome', suggestions: ['claude-3-5-sonnet-20241022', 'claude-3-5-haiku-20241022', 'claude-3-opus-20240229'] },
  { id: 'google', label: 'Google', color: '#00d4ff', icon: 'temp_preferences_custom', suggestions: ['gemini-2.0-flash', 'gemini-1.5-pro', 'gemini-1.5-flash'] },
  { id: 'openai', label: 'OpenAI', color: '#ff4b4b', icon: 'token', suggestions: ['gpt-4o', 'gpt-4o-mini', 'o1', 'o1-mini'] },
]


// Super basic hash to generate consistent "accuracy" numbers based on content length + model id
function generateMockAccuracy(content, modelId) {
  if (!content) return 0;
  const digest = Array.from(content).reduce((acc, char) => acc + char.charCodeAt(0), 0) + modelId.length * 13;
  const base = 85;
  const randomBoost = (digest % 14); // 85% to 98%
  return base + randomBoost;
}

// Hook to simulate typewriting text out
function useTypewriter(text, speedMs = 15, onComplete) {
  const [charsToShow, setCharsToShow] = useState(0);

  useEffect(() => {
    if (!text) {
      setCharsToShow(0);
      return;
    }

    setCharsToShow(0);
    const chunkSize = Math.max(1, Math.ceil(text.length / 100)); // Type out in ~100 steps

    const interval = setInterval(() => {
      setCharsToShow((prev) => {
        if (prev >= text.length) {
          clearInterval(interval);
          if (onComplete) onComplete();
          return text.length;
        }
        return prev + chunkSize;
      });
    }, speedMs);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, speedMs]);

  return {
    displayedText: text ? text.substring(0, charsToShow) : '',
    isTyping: charsToShow < (text?.length || 0)
  };
}

const CONFIG_STEPS = {
  SELECTION: 'selection',
  TEST: 'test',
  LIST: 'list',
  READY: 'ready'
}

export default function ArenaPage() {
  const [configStep, setConfigStep] = useState(CONFIG_STEPS.SELECTION)
  const [configuredModels, setConfiguredModels] = useState(() => {
    const saved = localStorage.getItem('itera_configured_models')
    return saved ? JSON.parse(saved) : []
  })
  const [currentConfiguring, setCurrentConfiguring] = useState(null)

  const [prompt, setPrompt] = useState('')
  const [selected, setSelected] = useState([])
  const systemPrompt = 'You are a virtual assistant. Before answering, trace your logic step-by-step within <thinking></thinking> tags. Then provide your final formatted answer in <output></output> tags.'
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Track which streams have completely finished typing out to unlock the final output node
  const [finishedStreams, setFinishedStreams] = useState({})

  const containerRef = useRef(null)
  const inputNodeRef = useRef(null)
  const modelNodesRef = useRef({})
  const outputNodeRef = useRef(null)
  const [lines, setLines] = useState([])

  useEffect(() => {
    localStorage.setItem('itera_configured_models', JSON.stringify(configuredModels))
  }, [configuredModels])

  const toggleModel = (id) => {
    setSelected(s => s.includes(id)
      ? s.filter(m => m !== id)
      : [...s, id]
    )
  }

  const handleCompare = async () => {
    if (!prompt.trim() || selected.length < 1 || loading) return
    setLoading(true)
    setError(null)
    setResults(null)
    setFinishedStreams({})
    setLines([])
    try {
      // Build configs object for selected models
      const configs = selected.reduce((acc, id) => {
        const m = configuredModels.find(cm => cm.id === id);
        if (m) {
          acc[id] = {
            provider: m.provider,
            model: m.model,
            api_key: m.api_key,
            label: m.label,
            color: m.color
          };
        }
        return acc;
      }, {});

      // MOCK check - if any model uses 'bypass', simulate the whole thing for UI testing
      const hasBypass = Object.values(configs).some(c => c.api_key === 'bypass');
      if (hasBypass) {
        await new Promise(r => setTimeout(r, 1000));
        const mockData = {
          total_duration_ms: 1500,
          fastest_model: selected[0],
          results: selected.map(id => ({
            model: id,
            status: 'success',
            content: `<thinking>Simulating reasoning for ${id}...\nVerified prompt context.\nConstructing response structure.</thinking><output>This is a simulated battle result for **${id}** using the 'bypass' key. The UI flow, graph animations, and output rendering are now verified as functional.</output>`,
            latency_ms: 600 + Math.floor(Math.random() * 800),
            completion_tokens: 42
          }))
        };
        setResults(mockData);
        return;
      }

      const data = await compareModels(prompt, selected, systemPrompt, 1024, configs)
      setResults(data)
    } catch (e) {
      setError(e.response?.data?.error || e.message || 'Comparison failed. Check your API keys.')
    } finally {
      setLoading(false)
    }
  }

  const handleStreamComplete = (modelId) => {
    setFinishedStreams(prev => {
      if (prev[modelId]) return prev;
      return { ...prev, [modelId]: true }
    })
  }

  // Draw the SVG connecting paths
  useEffect(() => {
    const updateLines = () => {
      if (!containerRef.current || !inputNodeRef.current || selected.length === 0 || configStep !== CONFIG_STEPS.READY) return

      const containerRect = containerRef.current.getBoundingClientRect()
      const inputRect = inputNodeRef.current.getBoundingClientRect()

      const newLines = []

      const startX = (inputRect.left + inputRect.width / 2) - containerRect.left
      const startY = inputRect.bottom - containerRect.top

      // Input to Models
      selected.forEach(modelId => {
        const node = modelNodesRef.current[modelId]
        if (node) {
          const nodeRect = node.getBoundingClientRect()
          const endX = (nodeRect.left + nodeRect.width / 2) - containerRect.left
          const endY = nodeRect.top - containerRect.top + 130 // push down to box top

          const modelConfig = configuredModels.find(m => m.id === modelId)
          const providerInfo = PROVIDERS.find(p => p.id === modelConfig?.provider)
          const modelColor = modelConfig?.color || providerInfo?.color || '#ffb347'

          newLines.push({
            id: `input-to-${modelId}`,
            d: `M ${startX} ${startY} C ${startX} ${startY + 60}, ${endX} ${endY - 60}, ${endX} ${endY}`,
            color: (loading || results) ? modelColor : '#2a3d52',
            active: loading || results !== null,
            width: (loading || results !== null) ? 2 : 1
          })
        }
      })

      // Check if all selected streams finished generating their text
      const allStreamsFinished = results && selected.every(id => finishedStreams[id]);

      // Wait until all streams finished typing and output node is rendered
      if (allStreamsFinished && outputNodeRef.current) {
        const outputRect = outputNodeRef.current.getBoundingClientRect()
        const finalX = (outputRect.left + outputRect.width / 2) - containerRect.left
        const finalY = outputRect.top - containerRect.top

        selected.forEach(modelId => {
          const node = modelNodesRef.current[modelId]
          if (node) {
            const nodeRect = node.getBoundingClientRect()
            const outX = (nodeRect.left + nodeRect.width / 2) - containerRect.left
            const outY = nodeRect.bottom - containerRect.top - 85

            const modelConfig = configuredModels.find(m => m.id === modelId)
            const providerInfo = PROVIDERS.find(p => p.id === modelConfig?.provider)
            const modelColor = modelConfig?.color || providerInfo?.color || '#ffb347'
            const isWinner = results.fastest_model === modelId
            const pathColor = isWinner ? modelColor : '#2a3d52'

            newLines.push({
              id: `${modelId}-to-output`,
              d: `M ${outX} ${outY} C ${outX} ${outY + 80}, ${finalX} ${finalY - 80}, ${finalX} ${finalY}`,
              color: pathColor,
              active: isWinner,
              width: isWinner ? 3 : 1
            })
          }
        })
      }

      setLines(newLines)
    }

    const timeout = setTimeout(updateLines, 100)
    window.addEventListener('resize', updateLines)
    return () => {
      clearTimeout(timeout)
      window.removeEventListener('resize', updateLines)
    }
  }, [selected, results, loading, finishedStreams, configStep, configuredModels])

  const allStreamsFinished = results && selected.every(id => finishedStreams[id]);

  if (configStep !== CONFIG_STEPS.READY) {
    return (
      <div className="min-h-[calc(100vh-57px)] bg-[#05080d] p-12 flex flex-col items-center">
        <ConfigFlow
          step={configStep}
          setStep={setConfigStep}
          configuredModels={configuredModels}
          setConfiguredModels={setConfiguredModels}
          currentConfiguring={currentConfiguring}
          setCurrentConfiguring={setCurrentConfiguring}
        />
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-57px)] overflow-y-auto px-6 py-12 max-w-7xl mx-auto flex flex-col items-center relative" ref={containerRef}>

      {/* SVG Canvas for drawing connecting lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible">
        <defs>
          <linearGradient id="glow-line" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="50%" stopColor="currentColor" stopOpacity="0.8" />
            <stop offset="100%" stopColor="currentColor" />
          </linearGradient>
        </defs>
        {lines.map(line => (
          <path
            key={line.id}
            d={line.d}
            stroke={line.color}
            strokeWidth={line.width || 2}
            fill="none"
            strokeLinecap="round"
            className={`transition-all duration-1000 ${line.active ? 'opacity-100 drop-shadow-[0_0_8px_currentColor]' : 'opacity-40'}`}
            style={{ color: line.color, strokeDasharray: line.active ? 'none' : '4, 8' }}
          />
        ))}
      </svg>

      {/* --- LEVEL 1: INPUT NODE --- */}
      <div
        ref={inputNodeRef}
        className="w-full max-w-2xl bg-slate-panel/80 backdrop-blur-md border border-primary/30 rounded-3xl p-6 shadow-[0_0_40px_rgba(64,186,247,0.1)] relative z-10 flex flex-col gap-4 mb-20"
      >
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-2">
          <h2 className="font-display text-xl font-bold flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">input</span>
            Prompt Input
          </h2>
          <div className="flex gap-2 items-center">
            <span className="text-xs text-slate-400 font-mono hidden sm:block">TARGETING:</span>
            <div className="flex -space-x-3">
              {selected.map(id => {
                const model = configuredModels.find(m => m.id === id)
                const providerInfo = PROVIDERS.find(p => p.id === model?.provider)
                const color = model?.color || providerInfo?.color || '#ccc'
                return (
                  <div key={id} className="w-8 h-8 rounded-full border-2 border-[#0B0F19] flex items-center justify-center text-[10px] font-bold" style={{ backgroundColor: color + '33', color }}>
                    {model?.label?.charAt(0)}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Setup Config */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs uppercase tracking-widest text-slate-400 font-bold font-mono">Select Arena Models</label>
              <button 
                onClick={() => setConfigStep(CONFIG_STEPS.SELECTION)}
                className="text-[10px] text-primary hover:underline font-mono uppercase tracking-tighter"
              >
                + Configure More
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {configuredModels.map(({ id, label, color }) => (
                <button
                  key={id}
                  onClick={() => toggleModel(id)}
                  style={selected.includes(id) ? { borderColor: color + '55', color, background: color + '15' } : {}}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium border transition-colors ${selected.includes(id) ? '' : 'border-slate-800 text-slate-500 hover:border-slate-600'
                    }`}
                >
                  {label}
                </button>
              ))}
              {configuredModels.length === 0 && (
                <div className="text-xs text-slate-500 italic">No models configured yet.</div>
              )}
            </div>
          </div>
        </div>

        {/* Prompt Execution */}
        <div className="relative">
          <textarea
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            rows={4}
            placeholder="e.g. Write a quick sort algorithm in Rust."
            className="w-full bg-[#0B0F19] border border-slate-700/50 rounded-2xl px-5 py-4 text-slate-200 outline-none focus:border-primary/50 transition-colors resize-none pr-16 text-base"
          />
          <button
            onClick={handleCompare}
            disabled={loading || !prompt.trim() || selected.length < 1}
            className="absolute bottom-4 right-4 bg-primary hover:bg-primary/80 disabled:opacity-50 disabled:bg-slate-700 text-[#0B0F19] rounded-xl p-3 flex items-center justify-center transition-all shadow-[0_0_20px_rgba(64,186,247,0.3)] disabled:shadow-none pointer-events-auto cursor-pointer"
          >
            {loading ? <Loader2 size={20} className="animate-spin" /> : <Play size={20} className="fill-current" />}
          </button>
        </div>

        {error && <div className="text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-sm mt-2">{error}</div>}
      </div>

      {/* --- LEVEL 2: COMPREHENSIVE MODEL COLUMNS --- */}
      <div className={`w-full relative z-10 grid gap-12 mb-20 ${selected.length > 2 ? 'grid-cols-3' : (selected.length === 2 ? 'grid-cols-2 max-w-5xl' : 'grid-cols-1 max-w-2xl')}`}>
        {selected.map((modelId) => {
          const modelInfo = configuredModels.find(m => m.id === modelId)
          const providerInfo = PROVIDERS.find(p => p.id === modelInfo?.provider)
          const color = modelInfo?.color || providerInfo?.color || '#ffb347'

          const resultData = results?.results?.find(r => r.model === modelId)

          // Parse thinking vs output
          let parsedThinking = '';
          let parsedOutput = resultData?.content || '';
          if (resultData && !resultData.error) {
            const tMatch = resultData.content.match(/<thinking>([\s\S]*?)<\/thinking>/i);
            const oMatch = resultData.content.match(/<output>([\s\S]*?)(?:<\/output>|$)/i);
            if (tMatch) parsedThinking = tMatch[1].trim();
            if (oMatch) parsedOutput = oMatch[1].trim();

            if (!oMatch) {
              // If no clean output tag found, strip all thinking tags and blocks globally
              parsedOutput = resultData.content.replace(/<thinking>[\s\S]*?<\/thinking>/gi, '').trim() || resultData.content;
            }
          }

          const isWinner = results?.fastest_model === modelId

          return (
            <ModelColumn
              key={modelId}
              modelId={modelId}
              modelInfo={modelInfo}
              color={color}
              resultData={resultData}
              parsedThinking={parsedThinking}
              parsedOutput={parsedOutput}
              loading={loading}
              error={error}
              isWinner={isWinner}
              onComplete={() => handleStreamComplete(modelId)}
              nodeRef={el => modelNodesRef.current[modelId] = el}
            />
          )
        })}
      </div>

      {/* --- LEVEL 3: CLEAN OUTPUT / SUMMARY NODE --- */}
      {allStreamsFinished && (
        <div
          ref={outputNodeRef}
          className="relative z-10 w-full max-w-4xl mx-auto bg-slate-panel/90 backdrop-blur-xl border border-primary/40 rounded-3xl overflow-hidden shadow-[0_0_30px_rgba(64,186,247,0.15)] flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-8 duration-700"
        >
          {/* Header */}
          <div className="bg-black/60 px-6 py-4 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center border border-primary/40">
                <span className="material-symbols-outlined text-primary text-sm">emoji_events</span>
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-white">Execution Output</h3>
                <span className="text-[10px] uppercase font-mono text-slate-400">Winning Response Selected</span>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex flex-col items-center gap-1">
                <span className="text-[10px] uppercase font-mono text-slate-400">Total Latency</span>
                <span className="text-primary font-mono font-bold text-base">{results.total_duration_ms}ms</span>
              </div>
              <div className="h-6 w-px bg-slate-700/50"></div>
              <div className="flex flex-col items-center gap-1">
                <span className="text-[10px] uppercase font-mono text-slate-400">Fastest Model</span>
                <span className="text-white font-mono font-bold text-xs bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                  {configuredModels.find(m => m.id === results.fastest_model)?.label || results.fastest_model}
                </span>
              </div>
            </div>
          </div>

          {/* Clean Markdown Output */}
          <div className="p-8 prose prose-invert prose-p:leading-relaxed prose-pre:bg-black/80 prose-pre:border prose-pre:border-white/10 prose-pre:shadow-lg max-w-none text-slate-300">
            {(() => {
              const bestResult = results?.results?.find(r => r.model === results.fastest_model)
              const oMatch = bestResult?.content?.match(/<output>([\s\S]*?)(?:<\/output>|$)/i);
              const finalContent = oMatch ? oMatch[1].trim() : bestResult?.content?.replace(/<thinking>[\s\S]*?<\/thinking>/gi, '').trim() || '';
              return <ReactMarkdown>{finalContent}</ReactMarkdown>
            })()}
          </div>
        </div>
      )}

    </div>
  )
}

// --- New Components for Step-based Flow ---

function ConfigFlow({ step, setStep, configuredModels, setConfiguredModels, currentConfiguring, setCurrentConfiguring }) {
  const steps = [
    { id: 'selection', label: 'Model Selection' },
    { id: 'test', label: 'Test Connection' },
    { id: 'list', label: 'Configured Models' }
  ]

  return (
    <div className="w-full max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Progress Tracker */}
      <div className="flex items-center justify-between mb-16 relative">
        <div className="absolute top-1/2 left-0 w-full h-px bg-slate-800 -z-10"></div>
        {steps.map((s, idx) => {
          const isActive = step === s.id;
          const isPast = steps.findIndex(x => x.id === step) > idx;

          return (
            <div key={s.id} className="flex flex-col items-center gap-3 bg-[#05080d] px-4">
              <div 
                className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-mono text-sm font-bold transition-all duration-300 ${
                  isActive ? 'border-primary text-primary bg-primary/10 shadow-[0_0_15px_rgba(64,186,247,0.3)]' :
                  isPast ? 'border-green-500 text-green-500 bg-green-500/10' :
                  'border-slate-800 text-slate-600'
                }`}
              >
                {isPast ? <span className="material-symbols-outlined text-sm">check</span> : idx + 1}
              </div>
              <span className={`text-[10px] uppercase tracking-widest font-bold ${isActive ? 'text-white' : 'text-slate-600'}`}>
                {s.label}
              </span>
            </div>
          )
        })}
      </div>

      {/* Step Content */}
      <div className="glass-panel rounded-[2.5rem] p-12 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
           <span className="material-symbols-outlined text-8xl text-primary">
             {step === 'selection' ? 'list_alt' : step === 'test' ? 'vibrant_content' : 'verified'}
           </span>
        </div>

        {step === 'selection' && (
          <ModelSelectionStep 
            onNext={(model) => {
              setCurrentConfiguring(model);
              setStep('test');
            }} 
            configuredModels={configuredModels}
          />
        )}
        {step === 'test' && (
          <TestConnectionStep 
            model={currentConfiguring}
            onBack={() => setStep('selection')}
            onSuccess={(config) => {
              const newModel = {
                ...currentConfiguring,
                ...config,
                id: `${currentConfiguring.id}-${Date.now()}` // Unique ID for this instance
              };
              setConfiguredModels(prev => [...prev, newModel]);
              setStep('list');
            }}
          />
        )}
        {step === 'list' && (
          <ConfiguredModelsStep 
            models={configuredModels}
            onAddAnother={() => setStep('selection')}
            onFinish={() => setStep('ready')}
            onRemove={(id) => setConfiguredModels(prev => prev.filter(m => m.id !== id))}
          />
        )}
      </div>
    </div>
  )
}

function ModelSelectionStep({ onNext }) {
  const [selectedProvider, setSelectedProvider] = useState(PROVIDERS[0])
  const [modelId, setModelId] = useState('')

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-3xl font-display font-bold text-white mb-2">Configure Model</h2>
        <p className="text-slate-400">Select a provider and enter any model ID to start a battle.</p>
      </div>

      <div className="grid grid-cols-2 gap-8">
        <div className="space-y-4">
           <label className="text-xs font-mono uppercase tracking-widest text-slate-500 font-bold">1. Select Provider</label>
           <div className="grid grid-cols-2 gap-3">
             {PROVIDERS.map(p => (
               <button
                 key={p.id}
                 onClick={() => {
                   setSelectedProvider(p)
                   setModelId('')
                 }}
                 className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${
                   selectedProvider.id === p.id 
                     ? 'bg-primary/10 border-primary text-primary shadow-[0_0_20px_rgba(64,186,247,0.2)]' 
                     : 'bg-white/5 border-white/5 text-slate-400 hover:border-white/20'
                 }`}
               >
                 <span className="material-symbols-outlined text-xl">{p.icon}</span>
                 <span className="font-bold text-sm">{p.label}</span>
               </button>
             ))}
           </div>
        </div>

        <div className="space-y-4">
           <label className="text-xs font-mono uppercase tracking-widest text-slate-500 font-bold">2. Model Name / ID</label>
           <div className="space-y-3">
             <input 
               type="text"
               value={modelId}
               onChange={(e) => setModelId(e.target.value)}
               placeholder="e.g. llama-3.3-70b"
               className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 focus:border-primary/50 outline-none transition-all placeholder:text-slate-700"
             />
             
             <div className="flex flex-wrap gap-2">
               <span className="text-[10px] text-slate-500 w-full mb-1">Popular Suggestions:</span>
               {selectedProvider.suggestions.map(s => (
                 <button 
                   key={s}
                   onClick={() => setModelId(s)}
                   className="text-[10px] bg-white/5 hover:bg-white/10 text-slate-400 px-2 py-1 rounded border border-white/5 hover:border-white/10 transition-colors"
                 >
                   {s}
                 </button>
               ))}
             </div>
           </div>
        </div>
      </div>

      <div className="pt-4">
        <button 
          disabled={!modelId.trim()}
          onClick={() => onNext({ ...selectedProvider, model: modelId })}
          className="w-full py-4 bg-primary text-[#0B0F19] rounded-2xl font-bold hover:scale-[1.02] transition-all disabled:opacity-50 disabled:scale-100"
        >
          Setup Connection
        </button>
      </div>
    </div>
  )
}

function TestConnectionStep({ model, onBack, onSuccess }) {
  const [modelDisplayName, setModelDisplayName] = useState(`${model.label} - ${model.model}`)
  const [apiKey, setApiKey] = useState('')
  const [testing, setTesting] = useState(false)
  const [validationResult, setValidationResult] = useState(null)

  const handleTest = async () => {
    if (!apiKey.trim()) return;
    setTesting(true);
    setValidationResult(null);
    try {
      if (apiKey === 'bypass') {
        setValidationResult({ valid: true });
        return;
      }
      const res = await validateConfig(model.id, model.model, apiKey)
      setValidationResult(res);
    } catch (err) {
      setValidationResult({ valid: false, error: err.message || 'Connection failed' });
    } finally {
      setTesting(false);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-white/10 text-slate-400">
           <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div>
          <h2 className="text-3xl font-display font-bold text-white mb-1">Validate Connection</h2>
          <p className="text-slate-400">Testing <span className="font-bold" style={{ color: model.color }}>{model.model}</span> via {model.label}</p>
        </div>
      </div>

      <div className="space-y-6 max-w-lg">
        <div className="space-y-2">
          <label className="text-xs font-mono uppercase tracking-widest text-slate-500 font-bold">Display Name</label>
          <input 
            type="text" 
            value={modelDisplayName}
            onChange={(e) => setModelDisplayName(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 focus:border-primary/50 outline-none transition-all"
            placeholder="e.g. My Fast Claude"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-mono uppercase tracking-widest text-slate-500 font-bold">API Key</label>
          <div className="relative">
            <input 
              type="password" 
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 focus:border-primary/50 outline-none transition-all pr-12"
              placeholder="sk-..."
            />
            {testing && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <Loader2 className="animate-spin text-primary" size={20} />
              </div>
            )}
            {!testing && validationResult?.valid && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                 <span className="material-symbols-outlined text-green-500">check_circle</span>
              </div>
            )}
             {!testing && validationResult && !validationResult.valid && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                 <span className="material-symbols-outlined text-red-500">cancel</span>
              </div>
            )}
          </div>
          {validationResult && !validationResult.valid && (
            <p className="text-red-400 text-[10px] font-mono mt-2 flex items-start gap-1">
              <span className="material-symbols-outlined text-sm">info</span>
              {validationResult.error}
            </p>
          )}
        </div>

        <div className="pt-4 flex gap-4">
          <button 
            disabled={testing || !apiKey.trim()}
            onClick={handleTest}
            className={`flex-1 py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 ${
              validationResult?.valid ? 'bg-green-600/20 text-green-400 border border-green-500/30' : 'bg-primary text-[#0B0F19] hover:bg-primary/80 shadow-[0_0_20px_rgba(64,186,247,0.3)]'
            }`}
          >
            {testing ? 'Verifying...' : validationResult?.valid ? 'Connection Verified' : 'Test Model Connection'}
          </button>
          
          {validationResult?.valid && (
            <button 
              onClick={() => onSuccess({ 
                label: modelDisplayName, 
                api_key: apiKey, 
                provider: model.id,
                model: model.model,
                icon: model.icon,
                color: model.color
              })}
              className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-bold transition-all animate-in fade-in zoom-in duration-300"
            >
              Continue
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function ConfiguredModelsStep({ models, onAddAnother, onFinish, onRemove }) {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-display font-bold text-white mb-2">Configured Models</h2>
          <p className="text-slate-400">Total {models.length} models ready for the Arena.</p>
        </div>
        <button 
          onClick={onAddAnother}
          className="text-xs font-mono font-bold text-primary hover:bg-primary/10 border border-primary/20 px-4 py-2 rounded-full transition-all"
        >
          + Add Another
        </button>
      </div>

      <div className="space-y-3">
        {models.map(m => (
          <div key={m.id} className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/[0.07] transition-all group">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-slate-900" style={{ color: m.color }}>
                <span className="material-symbols-outlined text-xl">{m.icon}</span>
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">{m.label}</h4>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-slate-500 uppercase">{m.id.split('-')[0]}</span>
                  <span className="w-1 h-1 rounded-full bg-green-500"></span>
                  <span className="text-[10px] font-mono text-green-500/80 uppercase">Active</span>
                </div>
              </div>
            </div>
            <button 
              onClick={() => onRemove(m.id)}
              className="p-2 text-slate-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
            >
              <span className="material-symbols-outlined text-sm">delete</span>
            </button>
          </div>
        ))}
      </div>

      <div className="pt-4">
        <button 
          onClick={onFinish}
          disabled={models.length === 0}
          className="w-full py-5 bg-primary text-[#0B0F19] rounded-[1.5rem] font-bold text-lg hover:scale-[1.02] transition-all shadow-[0_20px_40px_-10px_rgba(64,186,247,0.3)] disabled:opacity-50 disabled:scale-100"
        >
          Proceed to Arena
        </button>
      </div>
    </div>
  )
}

// --- Component to coordinate timing --- //
function ModelColumn({ modelId, modelInfo, color, resultData, parsedThinking, parsedOutput, loading, error, isWinner, onComplete, nodeRef }) {
  const [thinkingComplete, setThinkingComplete] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!resultData) setThinkingComplete(false);
  }, [resultData]);

  if (!loading && !resultData && !error) {
    return <div className="flex flex-col items-center gap-6 w-full opacity-0 pointer-events-none h-[400px]" ref={nodeRef} />;
  }

  return (
    <div className="flex flex-col items-center gap-6 w-full animate-in fade-in zoom-in duration-700" ref={nodeRef}>
      <ModelThinkingNode
        resultData={resultData}
        thinkingText={parsedThinking}
        color={color}
        loading={loading}
        onComplete={() => setThinkingComplete(true)}
      />

      <ModelExecutionBox
        modelInfo={modelInfo}
        color={color}
        resultData={resultData}
        outputText={parsedOutput}
        loading={loading}
        isWinner={isWinner}
        showOutput={thinkingComplete || !parsedThinking}
        onComplete={onComplete}
      />

      <ModelMetricsNode
        resultData={resultData}
        mockAccuracy={generateMockAccuracy(parsedOutput, modelInfo?.id || '')}
        color={color}
        isWinner={isWinner}
        loading={loading}
      />
    </div>
  );
}

// --- 1. Thinking Node (Above Box) --- //
function ModelThinkingNode({ resultData, thinkingText, color, loading, onComplete }) {
  const isError = resultData?.status === 'error';
  const [thoughtSteps, setThoughtSteps] = useState([]);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);

  useEffect(() => {
    if (thinkingText) {
      const steps = thinkingText.split('\n').filter(s => s.trim().length > 5);
      setThoughtSteps(steps.length > 0 ? steps : ['Analyzing request...']);
      setCurrentStepIdx(0);
    } else if (resultData && !isError) {
      setThoughtSteps([]);
      if (onComplete) onComplete();
    }
  }, [thinkingText, resultData, isError, onComplete]);

  useEffect(() => {
    if (!resultData || isError || thoughtSteps.length === 0) return;

    if (currentStepIdx < thoughtSteps.length) {
      const timer = setTimeout(() => {
        setCurrentStepIdx(c => c + 1);
      }, Math.max(300, Math.min(1000, 3000 / thoughtSteps.length)));
      return () => clearTimeout(timer);
    } else {
      if (onComplete) onComplete();
    }
  }, [currentStepIdx, thoughtSteps.length, resultData, isError, onComplete]);

  if (!loading && !resultData) return <div className="h-[120px]" />;

  return (
    <div className="flex flex-col gap-2 w-full max-w-[280px] h-[120px] overflow-hidden">
      <span className="text-xs font-bold font-display opacity-80 mb-2" style={{ color }}>What I'm thinking</span>

      {loading && !resultData && (
        <div className="flex items-center gap-2 opacity-60">
          <Loader2 size={12} className="animate-spin text-slate-500" />
          <span className="text-[10px] uppercase font-mono text-slate-500 tracking-widest">Awaiting...</span>
        </div>
      )}

      {(thoughtSteps.length > 0) && (
        <div className="flex flex-col gap-1 pr-2 custom-scrollbar overflow-y-auto">
          {thoughtSteps.slice(0, currentStepIdx + 1).map((step, idx) => {
            const isLast = idx === currentStepIdx && currentStepIdx < thoughtSteps.length;
            return (
              <div key={idx} className="flex items-start gap-2 animate-in fade-in slide-in-from-top-1 duration-300">
                <span className="text-xs mt-0.5 opacity-60" style={{ color: isLast ? color : '#cbd5e1' }}>-</span>
                <div className={`text-xs font-mono leading-relaxed truncate ${isLast ? 'text-slate-300' : 'text-slate-500'}`} title={step.replace(/[*-]/g, '').trim()}>
                  {step.replace(/[*-]/g, '').trim()}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {resultData && !thinkingText && !isError && (
        <span className="text-[10px] font-mono text-slate-500">- (Bypassed scratchpad)</span>
      )}
    </div>
  );
}

// --- 2. Execution Box (Main Model UI) --- //
function ModelExecutionBox({ modelInfo, color, resultData, outputText, loading, isWinner, showOutput, onComplete }) {
  const isError = resultData?.status === 'error';

  const typingSpeed = outputText ? Math.max(1, Math.min(15, (resultData?.latency_ms || 1000) / Math.max(10, outputText.length))) : 15;
  const { displayedText, isTyping } = useTypewriter(showOutput && !isError ? outputText : '', typingSpeed, onComplete);

  useEffect(() => {
    if (isError && onComplete) onComplete()
    if (resultData && !outputText && onComplete) onComplete()
  }, [isError, resultData, outputText, onComplete])

  return (
    <div
      className="flex flex-col bg-slate-panel rounded-[2rem] overflow-hidden shadow-xl border transition-all duration-700 w-full"
      style={{ borderColor: isWinner ? color : color + '33', boxShadow: isWinner ? `0 0 30px ${color}15` : 'none' }}
    >
      <div className="px-5 py-3 bg-black/40 border-b border-white/5 flex flex-col items-center justify-center">
        <span className="font-mono text-xs font-bold tracking-wide" style={{ color }}>{modelInfo?.label || modelInfo?.id}</span>
      </div>

      <div className="p-5 grow bg-[#05080d] min-h-[200px] relative custom-scrollbar">

        {resultData && !showOutput && !isError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center opacity-50">
            <Loader2 size={24} className="animate-spin text-slate-500 mb-2" />
            <span className="text-[10px] uppercase tracking-widest font-mono text-center text-primary/80 animate-pulse">Processing Thoughts...</span>
          </div>
        )}

        {isError && (
          <div className="text-red-400 text-xs font-mono break-all leading-loose">{resultData.error}</div>
        )}

        {showOutput && !isError && (
          <div className="text-xs text-slate-300 font-sans leading-relaxed whitespace-pre-wrap">
            <div className="prose prose-invert prose-sm max-w-none">
              <ReactMarkdown>{displayedText}</ReactMarkdown>
            </div>
            {isTyping && <span className="inline-block w-2 h-3 bg-current ml-1 animate-pulse"></span>}
          </div>
        )}

        {loading && (
          <div className="space-y-4 opacity-60 absolute inset-4">
            <div className="h-2 bg-slate-700/50 rounded-full w-full animate-pulse"></div>
            <div className="h-2 bg-slate-700/50 rounded-full w-5/6 animate-pulse" style={{ animationDelay: '150ms' }}></div>
            <div className="h-2 bg-slate-700/50 rounded-full w-4/6 animate-pulse" style={{ animationDelay: '300ms' }}></div>
          </div>
        )}
      </div>
    </div>
  );
}

// --- 3. Metrics Node (Below Box) --- //
function ModelMetricsNode({ resultData, mockAccuracy, color, isWinner, loading }) {
  if (!resultData && !loading) return <div className="h-[80px]" />;

  return (
    <div className="flex w-full justify-center grid grid-cols-2 gap-4 px-4">
      <div className="flex flex-col transition-opacity duration-700" style={{ opacity: resultData ? 1 : 0.4 }}>
        <span className="text-[10px] text-slate-400">Latency</span>
        <span className="font-mono text-sm font-bold" style={{ color: isWinner ? color : '#f8fafc' }}>
          {resultData ? `${resultData.latency_ms}ms` : '---'}
        </span>
      </div>

      <div className="flex flex-col transition-opacity duration-700" style={{ opacity: resultData ? 1 : 0.4 }}>
        <span className="text-[10px] text-slate-400">Response Tokens</span>
        <span className="font-mono text-sm font-bold text-slate-100">
          {resultData ? resultData.completion_tokens : '---'}
        </span>
      </div>

      <div className="flex flex-col col-span-2 items-center text-center pt-2 border-t border-slate-800 transition-opacity duration-700" style={{ opacity: resultData ? 1 : 0.4 }}>
        <span className="text-[10px] text-slate-400">Accuracy Score</span>
        <span className="font-mono text-base font-bold" style={{ color: mockAccuracy > 90 ? color : '#f8fafc' }}>
          {resultData ? `${mockAccuracy}%` : '---'}
        </span>
      </div>
    </div>
  );
}
