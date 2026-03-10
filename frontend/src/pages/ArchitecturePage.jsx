import React from 'react';

export default function ArchitecturePage({ onNavigate }) {
    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 min-h-screen">
            {/* Note: Make sure Tailwind classes like text-primary work */}
            
{/* Top Navigation */}
<header className="border-b border-primary/10 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md sticky top-0 z-50">
<div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
<div className="flex items-center gap-8">
<div className="flex items-center gap-2 text-primary">
<span className="material-symbols-outlined text-3xl">hub</span>
<h2 className="text-xl font-bold tracking-tight">IteraLLM</h2>
</div>
<nav className="hidden md:flex items-center gap-6">
<a className="text-sm font-medium hover:text-primary transition-colors" href="#">Docs</a>
<a className="text-sm font-medium text-primary border-b-2 border-primary" href="#">Architecture</a>
<a className="text-sm font-medium hover:text-primary transition-colors" href="#">Benchmark</a>
<a className="text-sm font-medium hover:text-primary transition-colors" href="#">Pricing</a>
</nav>
</div>
<div className="flex items-center gap-4">
<div className="relative hidden sm:block">
<span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
<input className="bg-primary/5 border border-primary/20 rounded-lg pl-10 pr-4 py-1.5 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none w-64" placeholder="Search architecture..." type="text"/>
</div>
<button className="bg-primary hover:bg-primary/90 text-background-dark px-4 py-2 rounded-lg text-sm font-bold transition-all">
                    Get Started
                </button>
</div>
</div>
</header>
<main className="max-w-7xl mx-auto px-6 py-12">
{/* Hero Section */}
<section className="text-center mb-20">
<h1 className="text-5xl md:text-6xl font-black mb-6 tracking-tight text-slate-900 dark:text-white">
                System <span className="text-primary">Architecture</span>
</h1>
<p className="max-w-2xl mx-auto text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                A deep-dive into IteraLLM's modular, high-throughput engine designed for scale and intelligent steering. Built with performance-first principles.
            </p>
</section>
{/* Interactive Diagram Placeholder */}
<section className="mb-24 relative">
<div className="w-full aspect-[21/9] rounded-2xl bg-slate-glass border border-primary/20 p-8 flex items-center justify-center relative overflow-hidden shadow-2xl shadow-primary/5">
{/* Abstract Diagram Visualization */}
<div className="flex items-center justify-between w-full max-w-4xl relative z-10">
{/* API Node */}
<div className="flex flex-col items-center gap-4">
<div className="w-24 h-24 rounded-xl bg-primary/10 border-2 border-primary flex items-center justify-center shadow-[0_0_30px_-5px_rgba(64,186,247,0.4)]">
<span className="material-symbols-outlined text-4xl text-primary">api</span>
</div>
<span className="font-mono text-sm font-bold text-primary">api</span>
</div>
{/* Flow Line 1 */}
<div className="flex-1 h-1 bg-gradient-to-r from-primary to-accent-purple relative">
<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full blur-[2px] animate-pulse"></div>
</div>
{/* Router Node */}
<div className="flex flex-col items-center gap-4">
<div className="w-24 h-24 rounded-xl bg-accent-purple/10 border-2 border-accent-purple flex items-center justify-center shadow-[0_0_30px_-5px_rgba(138,43,226,0.4)]">
<span className="material-symbols-outlined text-4xl text-accent-purple">alt_route</span>
</div>
<span className="font-mono text-sm font-bold text-accent-purple">router_rs</span>
</div>
{/* Flow Line 2 */}
<div className="flex-1 h-1 bg-gradient-to-r from-accent-purple to-primary relative">
<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full blur-[2px] animate-pulse"></div>
</div>
{/* Pipeline Node */}
<div className="flex flex-col items-center gap-4">
<div className="w-24 h-24 rounded-xl bg-primary/10 border-2 border-primary flex items-center justify-center shadow-[0_0_30px_-5px_rgba(64,186,247,0.4)]">
<span className="material-symbols-outlined text-4xl text-primary">account_tree</span>
</div>
<span className="font-mono text-sm font-bold text-primary">pipeline</span>
</div>
</div>
{/* Foundation Line */}
<div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-4/5 border-t-2 border-dashed border-primary/20 flex flex-col items-center pt-8">
<div className="px-8 py-3 rounded-lg bg-primary/5 border border-primary/30 flex items-center gap-3">
<span className="material-symbols-outlined text-primary">dns</span>
<span className="font-mono font-bold text-primary tracking-widest">infra foundation layer</span>
</div>
</div>
{/* Background Grid Decor */}
<div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: "radial-gradient(#40baf7 1px, transparent 1px)", backgroundSize: "30px 30px" }}></div>
</div>
</section>
{/* Detailed Component Cards */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
{/* API Card */}
<div className="bg-slate-glass border border-primary/20 rounded-xl p-6 hover:border-primary/50 transition-all group">
<div className="flex items-center gap-3 mb-4">
<span className="material-symbols-outlined text-primary group-hover:scale-110 transition-transform">input</span>
<h3 className="font-mono text-lg font-bold text-white">api</h3>
</div>
<p className="text-sm font-semibold text-primary mb-2">Entry points</p>
<p className="text-slate-400 text-sm leading-relaxed mb-6">
                    REST, gRPC, and WebSocket interfaces designed for low-overhead request ingestion and authentication.
                </p>
<div className="flex flex-wrap gap-2">
<span className="px-2 py-1 rounded bg-primary/10 text-[10px] font-mono text-primary border border-primary/20 uppercase">Auth v2</span>
<span className="px-2 py-1 rounded bg-primary/10 text-[10px] font-mono text-primary border border-primary/20 uppercase">gRPC Ready</span>
</div>
</div>
{/* Router Card */}
<div className="bg-slate-glass border border-accent-purple/20 rounded-xl p-6 hover:border-accent-purple/50 transition-all group">
<div className="flex items-center gap-3 mb-4">
<span className="material-symbols-outlined text-accent-purple group-hover:scale-110 transition-transform">bolt</span>
<h3 className="font-mono text-lg font-bold text-white">router_rs</h3>
</div>
<p className="text-sm font-semibold text-accent-purple mb-2">Intelligent steering</p>
<p className="text-slate-400 text-sm leading-relaxed mb-6">
                    Rust-based routing engine with sub-2ms latency. Performs dynamic load balancing and priority queuing.
                </p>
<div className="flex flex-wrap gap-2">
<span className="px-2 py-1 rounded bg-accent-purple/10 text-[10px] font-mono text-accent-purple border border-accent-purple/20 uppercase">Rust Engine</span>
<span className="px-2 py-1 rounded bg-accent-purple/10 text-[10px] font-mono text-accent-purple border border-accent-purple/20 uppercase">&lt;2ms Latency</span>
</div>
</div>
{/* Pipeline Card */}
<div className="bg-slate-glass border border-primary/20 rounded-xl p-6 hover:border-primary/50 transition-all group">
<div className="flex items-center gap-3 mb-4">
<span className="material-symbols-outlined text-primary group-hover:scale-110 transition-transform">settings_input_component</span>
<h3 className="font-mono text-lg font-bold text-white">pipeline</h3>
</div>
<p className="text-sm font-semibold text-primary mb-2">Workflow execution</p>
<p className="text-slate-400 text-sm leading-relaxed mb-6">
                    Orchestrates model calls, memory retrieval, and post-processing steps in parallelized execution flows.
                </p>
<div className="flex flex-wrap gap-2">
<span className="px-2 py-1 rounded bg-primary/10 text-[10px] font-mono text-primary border border-primary/20 uppercase">Async IO</span>
<span className="px-2 py-1 rounded bg-primary/10 text-[10px] font-mono text-primary border border-primary/20 uppercase">DAG-Based</span>
</div>
</div>
{/* Infra Card */}
<div className="bg-slate-glass border border-primary/20 rounded-xl p-6 hover:border-primary/50 transition-all group">
<div className="flex items-center gap-3 mb-4">
<span className="material-symbols-outlined text-primary group-hover:scale-110 transition-transform">layers</span>
<h3 className="font-mono text-lg font-bold text-white">infra</h3>
</div>
<p className="text-sm font-semibold text-primary mb-2">Scalability layer</p>
<p className="text-slate-400 text-sm leading-relaxed mb-6">
                    Multi-cloud Kubernetes abstraction that handles auto-scaling, health monitoring, and GPU allocation.
                </p>
<div className="flex flex-wrap gap-2">
<span className="px-2 py-1 rounded bg-primary/10 text-[10px] font-mono text-primary border border-primary/20 uppercase">K8s Native</span>
<span className="px-2 py-1 rounded bg-primary/10 text-[10px] font-mono text-primary border border-primary/20 uppercase">Auto-Scale</span>
</div>
</div>
</div>
{/* Technical Stats Bar */}
<section className="mt-20 flex flex-wrap gap-4">
<div className="flex-1 min-w-[200px] bg-primary/5 border border-primary/20 rounded-lg p-6">
<p className="text-slate-400 text-sm font-medium mb-1">Peak Throughput</p>
<p className="text-3xl font-black text-primary">1.2M <span className="text-sm font-normal text-slate-500">req/hr</span></p>
</div>
<div className="flex-1 min-w-[200px] bg-primary/5 border border-primary/20 rounded-lg p-6">
<p className="text-slate-400 text-sm font-medium mb-1">Avg. Latency</p>
<p className="text-3xl font-black text-primary">145 <span className="text-sm font-normal text-slate-500">ms</span></p>
</div>
<div className="flex-1 min-w-[200px] bg-primary/5 border border-primary/20 rounded-lg p-6">
<p className="text-slate-400 text-sm font-medium mb-1">Global Nodes</p>
<p className="text-3xl font-black text-primary">24 <span className="text-sm font-normal text-slate-500">regions</span></p>
</div>
<div className="flex-1 min-w-[200px] bg-primary/5 border border-primary/20 rounded-lg p-6">
<p className="text-slate-400 text-sm font-medium mb-1">System Uptime</p>
<p className="text-3xl font-black text-primary">99.99<span className="text-sm font-normal text-slate-500">%</span></p>
</div>
</section>
</main>
{/* Footer */}
<footer className="border-t border-primary/10 py-12 mt-24">
<div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
<div className="flex items-center gap-2 text-primary/60">
<span className="material-symbols-outlined text-2xl">hub</span>
<span className="font-bold">IteraLLM © 2024</span>
</div>
<div className="flex gap-8">
<a className="text-sm text-slate-500 hover:text-primary transition-colors" href="#">Documentation</a>
<a className="text-sm text-slate-500 hover:text-primary transition-colors" href="#">Changelog</a>
<a className="text-sm text-slate-500 hover:text-primary transition-colors" href="#">Support</a>
<a className="text-sm text-slate-500 hover:text-primary transition-colors" href="#">Privacy</a>
</div>
<div className="flex gap-4">
<a className="w-10 h-10 rounded-full bg-primary/5 border border-primary/20 flex items-center justify-center text-primary hover:bg-primary/10 transition-all" href="#">
<span className="material-symbols-outlined text-xl">share</span>
</a>
<a className="w-10 h-10 rounded-full bg-primary/5 border border-primary/20 flex items-center justify-center text-primary hover:bg-primary/10 transition-all" href="#">
<span className="material-symbols-outlined text-xl">terminal</span>
</a>
</div>
</div>
</footer>

        </div>
    );
}
