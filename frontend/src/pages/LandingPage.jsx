import React from 'react';

export default function LandingPage({ onNavigate }) {
    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display transition-colors duration-300">
            <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden">
{/* Navigation */}
<header className="sticky top-0 z-50 w-full border-b border-primary/10 bg-background-dark/80 backdrop-blur-md px-6 md:px-20 py-4">
<div className="max-w-7xl mx-auto flex items-center justify-between">
<div className="flex items-center gap-2 text-primary">
<span className="material-symbols-outlined text-3xl">deployed_code</span>
<h2 className="text-xl font-bold tracking-tight">IteraLLM</h2>
</div>
<nav className="hidden md:flex items-center gap-8">
<a className="text-slate-400 hover:text-primary text-sm font-medium transition-colors" href="#architecture">Architecture</a>
<a className="text-slate-400 hover:text-primary text-sm font-medium transition-colors" href="#features">Features</a>
<a className="text-slate-400 hover:text-primary text-sm font-medium transition-colors" href="#stack">Tech Stack</a>
<a className="text-slate-400 hover:text-primary text-sm font-medium transition-colors" href="#quickstart">Quick Start</a>
</nav>
<div className="flex gap-3">
<button className="bg-primary text-background-dark px-5 py-2 rounded-lg text-sm font-bold hover:opacity-90 transition-all" onClick={() => onNavigate('chat')}>
                    View Demo
                </button>
<button className="border border-primary/30 text-primary px-5 py-2 rounded-lg text-sm font-bold hover:bg-primary/10 transition-all">
                    GitHub
                </button>
</div>
</div>
</header>
<main className="flex-1">
{/* Hero Section */}
<section className="max-w-7xl mx-auto px-6 py-20 md:py-32 flex flex-col items-center text-center">
<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold mb-6">
<span className="relative flex h-2 w-2">
<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
<span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
</span>
                v2.4.0 RELEASED - BLAZING FAST ITERATION
            </div>
<h1 className="text-white text-5xl md:text-7xl font-black leading-tight tracking-tight mb-6">
                Build LLM Workflows at <br/><span className="text-primary">Neon Speed.</span>
</h1>
<p className="max-w-2xl text-slate-400 text-lg md:text-xl mb-10">
                The high-performance framework for iterative LLM workflows. Build, test, and observe with an industrial-grade backend.
            </p>
<div className="flex flex-wrap justify-center gap-4">
<button className="bg-primary text-background-dark h-14 px-8 rounded-xl text-lg font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-transform" onClick={() => onNavigate('chat')}>
                    View Demo
                </button>
<button className="border border-slate-700 text-white h-14 px-8 rounded-xl text-lg font-bold hover:bg-slate-800 transition-colors">
                    GitHub Repo
                </button>
</div>
<div className="mt-20 w-full max-w-5xl rounded-2xl overflow-hidden border border-primary/20 bg-slate-900/50 p-2">
<div className="rounded-xl overflow-hidden aspect-video bg-cover bg-center" data-alt="A futuristic dark-themed developer dashboard with glowing charts and metrics." style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuD7LRlcEaeHGLiDFM0lw0ANurj3Ati7Y4mFqEsZrJD3Ze9zkoy3lcfdzlx6sJZ3XsvPI_cPWGXpPHb-NrdPRXGTVKQm9iQCPYUtXffhp4uQWSNas_Ke_E9u4PebRqZu3YD-2UNuattLMU5UFh6ygD-q5qSvhYyeMih5o_KJN3VLQCQSqvZIBunQVwo6RMZFEm-ne3G-jvqaKE5dfDaTjTCkRoP-fZI2waZl4TELGoDgJJTq2WiSMV94LWF10KlcJIUTg1fO881AYPPd")'}}></div>
</div>
</section>
{/* Architecture Section */}
<section className="bg-slate-900/30 py-24 border-y border-primary/5" id="architecture">
<div className="max-w-7xl mx-auto px-6">
<div className="text-center mb-16">
<h2 className="text-primary font-bold tracking-widest uppercase text-sm mb-3">System Architecture</h2>
<h3 className="text-white text-3xl md:text-4xl font-bold">Distributed Performance by Design</h3>
</div>
<div className="relative p-8 rounded-3xl bg-slate-card/50 border border-primary/10 flex flex-col md:flex-row items-center justify-around gap-8">
<div className="flex flex-col items-center gap-3">
<div className="w-16 h-16 rounded-xl bg-slate-800 flex items-center justify-center border border-primary/30">
<span className="material-symbols-outlined text-primary text-3xl">person</span>
</div>
<span className="text-xs font-bold text-slate-400">User</span>
</div>
<div className="h-0.5 w-12 bg-gradient-to-r from-primary to-primary/20 neon-line hidden md:block"></div>
<div className="flex flex-col items-center gap-3">
<div className="w-16 h-16 rounded-xl bg-slate-800 flex items-center justify-center border border-primary/30">
<span className="material-symbols-outlined text-primary text-3xl">api</span>
</div>
<span className="text-xs font-bold text-slate-400">FastAPI</span>
</div>
<div className="h-0.5 w-12 bg-gradient-to-r from-primary/20 to-primary neon-line hidden md:block"></div>
<div className="flex flex-col items-center gap-3">
<div className="w-16 h-16 rounded-xl bg-slate-800 flex items-center justify-center border border-primary/30">
<span className="material-symbols-outlined text-primary text-3xl">database</span>
</div>
<span className="text-xs font-bold text-slate-400">Redis</span>
</div>
<div className="h-0.5 w-12 bg-gradient-to-r from-primary to-primary/20 neon-line hidden md:block"></div>
<div className="flex flex-col items-center gap-3">
<div className="w-20 h-20 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/40">
<span className="material-symbols-outlined text-background-dark text-4xl">psychology</span>
</div>
<span className="text-xs font-bold text-primary">LLM Core</span>
</div>
<div className="h-0.5 w-12 bg-gradient-to-r from-primary/20 to-primary neon-line hidden md:block"></div>
<div className="flex flex-col items-center gap-3">
<div className="w-16 h-16 rounded-xl bg-slate-800 flex items-center justify-center border border-primary/30">
<span className="material-symbols-outlined text-primary text-3xl">rebase_edit</span>
</div>
<span className="text-xs font-bold text-slate-400">Kafka</span>
</div>
<div className="h-0.5 w-12 bg-gradient-to-r from-primary to-primary/20 neon-line hidden md:block"></div>
<div className="flex flex-col items-center gap-3">
<div className="w-16 h-16 rounded-xl bg-slate-800 flex items-center justify-center border border-primary/30">
<span className="material-symbols-outlined text-primary text-3xl">monitoring</span>
</div>
<span className="text-xs font-bold text-slate-400">Prometheus</span>
</div>
</div>
</div>
</section>
{/* Features Section */}
<section className="max-w-7xl mx-auto px-6 py-24" id="features">
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
{/* Card 1 */}
<div className="glass-card p-8 rounded-2xl hover:bg-slate-card/80 transition-all border border-slate-700/50 group">
<div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
<span className="material-symbols-outlined">forum</span>
</div>
<h4 className="text-white text-xl font-bold mb-3">Live Chat</h4>
<p className="text-slate-400 text-sm leading-relaxed">
                        Real-time conversational interface with streaming support and context window management.
                    </p>
</div>
{/* Card 2 */}
<div className="glass-card p-8 rounded-2xl hover:bg-slate-card/80 transition-all border border-slate-700/50 group">
<div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
<span className="material-symbols-outlined">swords</span>
</div>
<h4 className="text-white text-xl font-bold mb-3">Arena</h4>
<p className="text-slate-400 text-sm leading-relaxed">
                        Side-by-side comparison of multiple models with automated Elo-based scoring systems.
                    </p>
</div>
{/* Card 3 */}
<div className="glass-card p-8 rounded-2xl hover:bg-slate-card/80 transition-all border border-slate-700/50 group">
<div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
<span className="material-symbols-outlined">biotech</span>
</div>
<h4 className="text-white text-xl font-bold mb-3">Experimentation</h4>
<p className="text-slate-400 text-sm leading-relaxed">
                        Rapidly iterate on prompts and hyperparameters with full versioning and history.
                    </p>
</div>
{/* Card 4 */}
<div className="glass-card p-8 rounded-2xl hover:bg-slate-card/80 transition-all border border-slate-700/50 group">
<div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
<span className="material-symbols-outlined">visibility</span>
</div>
<h4 className="text-white text-xl font-bold mb-3">Observability</h4>
<p className="text-slate-400 text-sm leading-relaxed">
                        Deep tracing, latency metrics, and token cost analysis out of the box with Prometheus.
                    </p>
</div>
</div>
</section>
{/* Tech Stack */}
<section className="py-12 border-t border-primary/5" id="stack">
<div className="max-w-7xl mx-auto px-6">
<p className="text-center text-slate-500 text-sm font-medium mb-10">POWERING THE NEXT GENERATION OF AI APPS</p>
<div className="flex flex-wrap justify-center items-center gap-12 grayscale opacity-50 hover:grayscale-0 transition-all">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined">terminal</span>
<span className="font-bold text-xl">Rust</span>
</div>
<div className="flex items-center gap-2">
<span className="material-symbols-outlined">bolt</span>
<span className="font-bold text-xl">FastAPI</span>
</div>
<div className="flex items-center gap-2">
<span className="material-symbols-outlined">storage</span>
<span className="font-bold text-xl">Redis</span>
</div>
<div className="flex items-center gap-2">
<span className="material-symbols-outlined">layers</span>
<span className="font-bold text-xl">Kafka</span>
</div>
<div className="flex items-center gap-2">
<span className="material-symbols-outlined">query_stats</span>
<span className="font-bold text-xl">Prometheus</span>
</div>
</div>
</div>
</section>
{/* Quick Start Section */}
<section className="max-w-4xl mx-auto px-6 py-24" id="quickstart">
<div className="text-center mb-12">
<h3 className="text-white text-3xl font-bold mb-4">Ready in Seconds</h3>
<p className="text-slate-400">Install the CLI and start iterating on your first LLM project.</p>
</div>
<div className="bg-black/40 rounded-xl border border-slate-700 overflow-hidden shadow-2xl">
<div className="bg-slate-800 px-4 py-2 flex items-center gap-2 border-b border-slate-700">
<div className="flex gap-1.5">
<div className="w-3 h-3 rounded-full bg-red-500/50"></div>
<div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
<div className="w-3 h-3 rounded-full bg-green-500/50"></div>
</div>
<span className="text-xs text-slate-400 font-mono ml-4">terminal — iterallm</span>
</div>
<div className="p-6 font-mono text-sm sm:text-base leading-relaxed overflow-x-auto">
<div className="flex gap-4 mb-2">
<span className="text-slate-600 select-none">$</span>
<span className="text-primary">pip install iterallm</span>
</div>
<div className="flex gap-4 mb-6">
<span className="text-slate-600 select-none">$</span>
<span className="text-primary">iterallm init project-name</span>
</div>
<div className="text-slate-400 italic mb-4"># main.py</div>
<div className="text-slate-300">
<span className="text-purple-400">from</span> iterallm <span className="text-purple-400">import</span> Engine<br/><br/>
                        engine = Engine(model=<span className="text-green-400">"gpt-4-turbo"</span>)<br/><br/>
<span className="text-purple-400">@engine.route</span>(<span className="text-green-400">"/chat"</span>)<br/>
<span className="text-purple-400">async def</span> <span className="text-blue-400">handle_chat</span>(ctx):<br/>
                            response = <span className="text-purple-400">await</span> ctx.generate()<br/>
                            <span className="text-purple-400">return</span> response<br/><br/>
                        engine.run(port=<span className="text-orange-400">8000</span>)
                    </div>
</div>
</div>
</section>
</main>
{/* Footer */}
<footer className="bg-slate-900 py-12 border-t border-slate-800">
<div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
<div className="flex items-center gap-2 text-primary">
<span className="material-symbols-outlined">deployed_code</span>
<span className="font-bold text-lg">IteraLLM</span>
</div>
<div className="flex gap-8 text-slate-500 text-sm">
<a className="hover:text-primary transition-colors" href="#">Documentation</a>
<a className="hover:text-primary transition-colors" href="#">Discord</a>
<a className="hover:text-primary transition-colors" href="#">Twitter</a>
<a className="hover:text-primary transition-colors" href="#">Terms</a>
</div>
<p className="text-slate-600 text-sm">© 2024 IteraLLM Framework. MIT Licensed.</p>
</div>
</footer>
</div>
        </div>
    );
}
