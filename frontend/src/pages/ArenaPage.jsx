import { useState, useRef, useEffect } from 'react'
import { Zap, DollarSign, Hash, Loader2, Play, Target } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { compareModels } from '../api'

const AVAILABLE_MODELS = [
  { id: 'claude-haiku-4-5-20251001', label: 'Claude Haiku', color: '#bc8cff' },
  { id: 'groq/llama-3.3-70b-versatile', label: 'Groq LLaMA 70B', color: '#00ff9d' },
  { id: 'groq/llama-3.1-8b-instant', label: 'Groq LLaMA 8B', color: '#ffb347' },
  { id: 'gemini-2.0-flash', label: 'Gemini 2.0', color: '#00d4ff' },
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

export default function ArenaPage() {
  const [prompt, setPrompt] = useState('')
  const [selected, setSelected] = useState(['groq/llama-3.3-70b-versatile', 'claude-haiku-4-5-20251001', 'gemini-2.0-flash'])
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
    setFinishedStreams({})
    setLines([])
    try {
      const data = await compareModels(prompt, selected, systemPrompt, 512)
      setResults(data)
    } catch (e) {
      setError('Comparison failed. Check your API keys and server.')
    } finally {
      setLoading(false)
    }
  }

  const handleStreamComplete = (modelId) => {
    setFinishedStreams(prev => ({ ...prev, [modelId]: true }))
  }

  // Draw the SVG connecting paths
  useEffect(() => {
    const updateLines = () => {
      if (!containerRef.current || !inputNodeRef.current || selected.length === 0) return

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

          const modelColor = AVAILABLE_MODELS.find(m => m.id === modelId)?.color || '#ffb347'

          newLines.push({
            id: `input-to-${modelId}`,
            d: `M ${startX} ${startY} C ${startX} ${startY + 60}, ${endX} ${endY - 60}, ${endX} ${endY}`,
            color: loading ? '#5a7a99' : (results ? modelColor : '#2a3d52'),
            active: results !== null,
            width: results !== null ? 2 : 1
          })
        }
      })

      // Check if all selected streams finished generating their text
      const allStreamsFinished = results && selected.every(id => finishedStreams[id]);

      // Wait until all streams finished typing and output node is rendered
      if (allStreamsFinished && outputNodeRef.current) {
        const outputRect = outputNodeRef.current.getBoundingClientRect()
        const finalX = (outputRect.left + outputRect.width / 2) - containerRect.left
        // Final output node starts further down now
        const finalY = outputRect.top - containerRect.top

        selected.forEach(modelId => {
          const node = modelNodesRef.current[modelId]
          if (node) {
            const nodeRect = node.getBoundingClientRect()
            const outX = (nodeRect.left + nodeRect.width / 2) - containerRect.left
            // Move outY higher to account for metrics padding
            const outY = nodeRect.bottom - containerRect.top - 85

            const modelColor = AVAILABLE_MODELS.find(m => m.id === modelId)?.color || '#ffb347'
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

    const timeout = setTimeout(updateLines, 50)
    window.addEventListener('resize', updateLines)
    return () => {
      clearTimeout(timeout)
      window.removeEventListener('resize', updateLines)
    }
  }, [selected, results, loading, finishedStreams])

  const allStreamsFinished = results && selected.every(id => finishedStreams[id]);

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
                const model = AVAILABLE_MODELS.find(m => m.id === id)
                return (
                  <div key={id} className="w-8 h-8 rounded-full border-2 border-[#0B0F19] flex items-center justify-center text-[10px] font-bold" style={{ backgroundColor: Object.assign({}, model).color + '33', color: Object.assign({}, model).color }}>
                    {Object.assign({}, model).label?.charAt(0)}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Setup Config */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase tracking-widest text-slate-400 font-bold font-mono">Select Arena Models</label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_MODELS.map(({ id, label, color }) => (
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
            disabled={loading || !prompt.trim() || selected.length < 2}
            className="absolute bottom-4 right-4 bg-primary hover:bg-primary/80 disabled:opacity-50 disabled:bg-slate-700 text-[#0B0F19] rounded-xl p-3 flex items-center justify-center transition-all shadow-[0_0_20px_rgba(64,186,247,0.3)] disabled:shadow-none pointer-events-auto cursor-pointer"
          >
            {loading ? <Loader2 size={20} className="animate-spin" /> : <Play size={20} className="fill-current" />}
          </button>
        </div>

        {error && <div className="text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-sm mt-2">{error}</div>}
      </div>

      {/* --- LEVEL 2: COMPREHENSIVE MODEL COLUMNS --- */}
      <div className={`w-full relative z-10 grid gap-12 mb-20 ${selected.length > 2 ? 'grid-cols-3' : 'grid-cols-2 max-w-5xl'}`}>
        {selected.map((modelId) => {
          const modelInfo = AVAILABLE_MODELS.find(m => m.id === modelId)
          const color = modelInfo?.color || '#ffb347'

          const resultData = results?.results?.find(r => r.model === modelId)

          // Parse thinking vs output
          let parsedThinking = '';
          let parsedOutput = resultData?.content || '';
          if (resultData && !resultData.error) {
            const tMatch = resultData.content.match(/<thinking>([\s\S]*?)<\/thinking>/i);
            const oMatch = resultData.content.match(/<output>([\s\S]*?)(?:<\/output>|$)/i);
            if (tMatch) parsedThinking = tMatch[1].trim();
            if (oMatch) parsedOutput = oMatch[1].trim();
            if (tMatch && !oMatch) {
              // if gave thinking but forgot output tag, treat rest as output
              parsedOutput = resultData.content.replace(/<thinking>[\s\S]*?<\/thinking>/i, '').trim() || resultData.content;
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
                  {AVAILABLE_MODELS.find(m => m.id === results.fastest_model)?.label || results.fastest_model}
                </span>
              </div>
            </div>
          </div>

          {/* Clean Markdown Output */}
          <div className="p-8 prose prose-invert prose-p:leading-relaxed prose-pre:bg-black/80 prose-pre:border prose-pre:border-white/10 prose-pre:shadow-lg max-w-none text-slate-300">
            {(() => {
              const bestResult = results?.results?.find(r => r.model === results.fastest_model)
              const oMatch = bestResult?.content?.match(/<output>([\s\S]*?)(?:<\/output>|$)/i);
              const finalContent = oMatch ? oMatch[1].trim() : bestResult?.content?.replace(/<thinking>[\s\S]*?<\/thinking>/i, '') || '';
              return <ReactMarkdown>{finalContent}</ReactMarkdown>
            })()}
          </div>
        </div>
      )}

    </div>
  )
}

// --- Component to coordinate timing --- //
function ModelColumn({ modelInfo, color, resultData, parsedThinking, parsedOutput, loading, isWinner, onComplete, nodeRef }) {
  const [thinkingComplete, setThinkingComplete] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!resultData) setThinkingComplete(false);
  }, [resultData]);

  return (
    <div className="flex flex-col items-center gap-6" ref={nodeRef}>
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [thinkingText, resultData, isError]);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStepIdx, thoughtSteps.length, resultData, isError]);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isError, resultData, outputText])

  return (
    <div
      className="flex flex-col bg-slate-panel rounded-[2rem] overflow-hidden shadow-xl border transition-all duration-700 w-full"
      style={{ borderColor: isWinner ? color : color + '33', boxShadow: isWinner ? `0 0 30px ${color}15` : 'none' }}
    >
      <div className="px-5 py-3 bg-black/40 border-b border-white/5 flex flex-col items-center justify-center">
        <span className="font-mono text-xs font-bold tracking-wide" style={{ color }}>{modelInfo?.label || modelInfo?.id}</span>
      </div>

      <div className="p-5 grow bg-[#05080d] min-h-[200px] relative custom-scrollbar">
        {!resultData && !loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center opacity-30">
            <span className="material-symbols-outlined text-4xl mb-2">smart_toy</span>
            <span className="text-[10px] uppercase tracking-widest text-center">Idle</span>
          </div>
        )}

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
        <span className="text-[10px] text-slate-400">Tokens</span>
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
