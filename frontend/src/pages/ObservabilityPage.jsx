import React from 'react';

export default function ObservabilityPage({ onNavigate }) {
    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 min-h-screen">
            {/* Note: Make sure Tailwind classes like text-primary work */}
            
{/* Sidebar Navigation */}
<aside className="w-64 border-r border-primary/20 bg-background-dark/50 flex flex-col h-screen shrink-0">
<div className="p-6 flex items-center gap-3">
<div className="size-10 bg-primary/20 rounded-lg flex items-center justify-center border border-primary/40">
<span className="material-symbols-outlined text-primary">hub</span>
</div>
<div>
<h1 className="text-lg font-bold tracking-tight">IteraLLM</h1>
<p className="text-xs text-primary/60 font-medium">Native Observability</p>
</div>
</div>
<nav className="flex-1 px-4 space-y-1 mt-4">
<a className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-primary/10 text-primary border border-primary/20" href="#">
<span className="material-symbols-outlined">dashboard</span>
<span className="text-sm font-medium">Observability</span>
</a>
<a className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-all" href="#">
<span className="material-symbols-outlined">analytics</span>
<span className="text-sm font-medium">Analytics</span>
</a>
<a className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-all" href="#">
<span className="material-symbols-outlined">science</span>
<span className="text-sm font-medium">Experiments</span>
</a>
<a className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-all" href="#">
<span className="material-symbols-outlined">terminal</span>
<span className="text-sm font-medium">Pipeline Logs</span>
</a>
<a className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-all" href="#">
<span className="material-symbols-outlined">settings</span>
<span className="text-sm font-medium">Configuration</span>
</a>
</nav>
<div className="p-4 mt-auto">
<div className="p-4 rounded-xl glass-panel border border-primary/10">
<p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2">Resource Usage</p>
<div className="w-full bg-slate-800 h-1 rounded-full mb-1">
<div className="bg-primary h-full rounded-full" style={{ width: "42%" }}></div>
</div>
<div className="flex justify-between text-[10px] text-slate-400 font-mono">
<span>42% GPU Load</span>
<span>12.4 GB</span>
</div>
</div>
</div>
</aside>
{/* Main Content Area */}
<main className="flex-1 flex flex-col overflow-y-auto">
{/* Minimal Header */}
<header className="h-14 border-b border-primary/10 flex items-center justify-between px-8 bg-background-dark/30 shrink-0">
<div className="flex items-center gap-4">
<span className="text-slate-500 text-sm">System Status:</span>
<div className="flex items-center gap-2 px-2 py-1 rounded bg-success-green/10 border border-success-green/20">
<div className="size-1.5 rounded-full bg-success-green animate-pulse"></div>
<span className="text-[10px] font-bold text-success-green tracking-wide">OPERATIONAL</span>
</div>
</div>
<div className="flex items-center gap-6">
<div className="flex items-center gap-2 text-slate-400 hover:text-white cursor-pointer transition-colors">
<span className="material-symbols-outlined text-sm">help</span>
<span className="text-xs font-medium">Docs</span>
</div>
<div className="flex items-center gap-2 text-slate-400 hover:text-white cursor-pointer transition-colors">
<span className="material-symbols-outlined text-sm">notifications</span>
<span className="text-xs font-medium">Alerts</span>
</div>
<div className="h-8 w-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden">
<img alt="User" data-alt="User profile avatar" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAU7xzaH0wNk2AhNFwx5KBeQpE0-2IqABo-2W1bE7RTFxApf0Wyiyr9wwdJEFBE-OIEcXaRoe1qXrQ0x_dOfUu7Wji3NEoEmxky0HtRdGdlEPb4UCO4ukcQzsZYdwALWAMKO7F9Ec16k2SpRVri6UmfSOeVo_9hmGRzNeVmkSttBSjSeXkG-RoyhVtDcr8q6OGqORrsQGlS0xKVc6Ru51JjvCVbcibliha5zR7kGNdpqUPFIuAYhB53B85YCT_ecG-pBg42_84-DtgT"/>
</div>
</div>
</header>
{/* Dashboard Content */}
<div className="p-8 space-y-6">
{/* Stat Cards */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
<div className="glass-panel rounded-xl p-5 border-l-4 border-l-primary neon-border">
<div className="flex justify-between items-start mb-2">
<p className="text-xs font-medium text-slate-400">Requests/sec</p>
<span className="material-symbols-outlined text-primary text-sm">bolt</span>
</div>
<p className="text-2xl font-mono font-bold text-primary">1,248.4</p>
<p className="text-[10px] text-success-green font-bold mt-1 tracking-tight">+12.4% vs last hour</p>
</div>
<div className="glass-panel rounded-xl p-5 border-l-4 border-l-accent-purple neon-border">
<div className="flex justify-between items-start mb-2">
<p className="text-xs font-medium text-slate-400">P99 Latency</p>
<span className="material-symbols-outlined text-accent-purple text-sm">timer</span>
</div>
<p className="text-2xl font-mono font-bold text-accent-purple">142ms</p>
<p className="text-[10px] text-slate-400 font-bold mt-1 tracking-tight">Median: 84ms</p>
</div>
<div className="glass-panel rounded-xl p-5 border-l-4 border-l-red-500 neon-border">
<div className="flex justify-between items-start mb-2">
<p className="text-xs font-medium text-slate-400">Errors</p>
<span className="material-symbols-outlined text-red-500 text-sm">error</span>
</div>
<p className="text-2xl font-mono font-bold text-slate-100">0.02%</p>
<p className="text-[10px] text-slate-400 font-bold mt-1 tracking-tight">3 retries in last 5m</p>
</div>
<div className="glass-panel rounded-xl p-5 border-l-4 border-l-amber-500 neon-border">
<div className="flex justify-between items-start mb-2">
<p className="text-xs font-medium text-slate-400">Active Experiments</p>
<span className="material-symbols-outlined text-amber-500 text-sm">science</span>
</div>
<p className="text-2xl font-mono font-bold text-slate-100">12</p>
<p className="text-[10px] text-success-green font-bold mt-1 tracking-tight">2 new started today</p>
</div>
</div>
{/* Live Telemetry Graph */}
<div className="glass-panel rounded-xl p-6 border border-primary/10 h-80 flex flex-col">
<div className="flex justify-between items-center mb-6">
<div>
<h2 className="text-lg font-bold text-white">Live Telemetry</h2>
<p className="text-xs text-slate-400">Global traffic throughput and token generation rate</p>
</div>
<div className="flex items-center gap-2">
<div className="flex items-center gap-2 px-3 py-1 rounded bg-primary/10 border border-primary/20 text-xs text-primary font-bold">
                            Live Feed
                        </div>
</div>
</div>
<div className="flex-1 relative">
{/* Fake Graph Visualization */}
<svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1000 200">
<defs>
<linearGradient id="areaGradient" x1="0" x2="0" y1="0" y2="1">
<stop offset="0%" stopColor="#40baf7" stopOpacity="0.2"></stop>
<stop offset="100%" stopColor="#40baf7" stopOpacity="0"></stop>
</linearGradient>
</defs>
<path d="M0,150 Q50,140 100,160 T200,120 T300,140 T400,100 T500,130 T600,80 T700,110 T800,70 T900,90 T1000,60 V200 H0 Z" fill="url(#areaGradient)"></path>
<path className="drop-shadow-[0_0_8px_rgba(64,186,247,0.5)]" d="M0,150 Q50,140 100,160 T200,120 T300,140 T400,100 T500,130 T600,80 T700,110 T800,70 T900,90 T1000,60" fill="none" stroke="#40baf7" strokeWidth="2"></path>
{/* P99 line */}
<path d="M0,180 Q100,175 200,185 T400,170 T600,175 T800,165 T1000,170" fill="none" stroke="#a855f7" strokeDasharray="4" strokeWidth="1.5"></path>
</svg>
{/* Y-Axis Labels */}
<div className="absolute left-0 top-0 h-full flex flex-col justify-between text-[10px] font-mono text-slate-600">
<span>2.5k</span>
<span>1.2k</span>
<span>0</span>
</div>
</div>
<div className="flex justify-between mt-4 text-[10px] font-mono text-slate-600">
<span>14:30:00</span>
<span>14:35:00</span>
<span>14:40:00</span>
<span>14:45:00</span>
<span>14:50:00</span>
<span>14:55:00</span>
<span>NOW</span>
</div>
</div>
{/* Bottom Section Split */}
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-8">
{/* Experiments Table */}
<div className="glass-panel rounded-xl flex flex-col overflow-hidden border border-primary/10">
<div className="p-5 border-b border-primary/10 flex items-center justify-between">
<h3 className="font-bold text-white flex items-center gap-2">
<span className="material-symbols-outlined text-sm text-primary">science</span>
                            Active Experiments
                        </h3>
<button className="text-[10px] font-bold text-primary hover:underline">View All</button>
</div>
<div className="flex-1 overflow-x-auto">
<table className="w-full text-left text-sm">
<thead className="bg-slate-800/50 text-[11px] text-slate-400 uppercase tracking-wider">
<tr>
<th className="px-5 py-3 font-semibold">Experiment ID</th>
<th className="px-5 py-3 font-semibold">Traffic</th>
<th className="px-5 py-3 font-semibold">Success Rate</th>
<th className="px-5 py-3 font-semibold text-right">Status</th>
</tr>
</thead>
<tbody className="divide-y divide-primary/5">
<tr className="hover:bg-primary/5 transition-colors">
<td className="px-5 py-4 font-mono text-primary text-xs">GPT4-TURBO-HYBRID-A</td>
<td className="px-5 py-4 font-mono text-xs">45.2%</td>
<td className="px-5 py-4">
<div className="flex items-center gap-2">
<div className="flex-1 bg-slate-800 h-1.5 rounded-full overflow-hidden w-20">
<div className="bg-success-green h-full" style={{ width: "94.2%" }}></div>
</div>
<span className="font-mono text-xs">94.2%</span>
</div>
</td>
<td className="px-5 py-4 text-right">
<span className="px-2 py-0.5 rounded text-[10px] font-bold bg-success-green/10 text-success-green border border-success-green/20">WINNING</span>
</td>
</tr>
<tr className="hover:bg-primary/5 transition-colors">
<td className="px-5 py-4 font-mono text-primary text-xs">CLAUDE-3-HAIKU-FAST-B</td>
<td className="px-5 py-4 font-mono text-xs">44.8%</td>
<td className="px-5 py-4">
<div className="flex items-center gap-2">
<div className="flex-1 bg-slate-800 h-1.5 rounded-full overflow-hidden w-20">
<div className="bg-primary h-full" style={{ width: "88.5%" }}></div>
</div>
<span className="font-mono text-xs">88.5%</span>
</div>
</td>
<td className="px-5 py-4 text-right">
<span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">TESTING</span>
</td>
</tr>
<tr className="hover:bg-primary/5 transition-colors">
<td className="px-5 py-4 font-mono text-primary text-xs">LOCAL-LLAMA3-8B-C</td>
<td className="px-5 py-4 font-mono text-xs">10.0%</td>
<td className="px-5 py-4">
<div className="flex items-center gap-2">
<div className="flex-1 bg-slate-800 h-1.5 rounded-full overflow-hidden w-20">
<div className="bg-red-500 h-full" style={{ width: "72.1%" }}></div>
</div>
<span className="font-mono text-xs">72.1%</span>
</div>
</td>
<td className="px-5 py-4 text-right">
<span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/10 text-red-500 border border-red-500/20">ALERT</span>
</td>
</tr>
</tbody>
</table>
</div>
</div>
{/* Live Pipeline Logs */}
<div className="bg-terminal-bg rounded-xl flex flex-col border border-primary/20 overflow-hidden neon-border">
<div className="bg-slate-900 px-5 py-2.5 flex items-center justify-between border-b border-white/5">
<div className="flex items-center gap-2">
<div className="flex gap-1.5">
<div className="size-2 rounded-full bg-red-500/50"></div>
<div className="size-2 rounded-full bg-amber-500/50"></div>
<div className="size-2 rounded-full bg-green-500/50"></div>
</div>
<span className="text-[10px] font-mono text-slate-500 ml-2 uppercase tracking-widest font-bold">Live Pipeline Logs</span>
</div>
<span className="text-[10px] font-mono text-success-green animate-pulse">STREAMING</span>
</div>
<div className="flex-1 p-5 font-mono text-[11px] leading-relaxed overflow-y-auto space-y-1.5 max-h-[250px]">
<p className="text-slate-500">[14:52:01.201] <span className="text-primary">INFO</span> Routing decision: model="gpt-4o" reason="high_complexity_request"</p>
<p className="text-slate-500">[14:52:01.245] <span className="text-success-green">SUCCESS</span> Middleware "TokenCounter" executed in 4ms</p>
<p className="text-slate-500">[14:52:01.450] <span className="text-slate-100">DEBUG</span> Pipeline stage "SemanticCache" cache miss</p>
<p className="text-slate-500">[14:52:01.451] <span className="text-primary">INFO</span> Forwarding to upstream: primary_provider="openai"</p>
<p className="text-slate-500">[14:52:02.100] <span className="text-slate-100">DEBUG</span> Initial chunk received: delta_token="Hello"</p>
<p className="text-slate-500">[14:52:02.122] <span className="text-slate-100">DEBUG</span> Chunk received: delta_token=" there!"</p>
<p className="text-slate-500">[14:52:02.341] <span className="text-success-green">SUCCESS</span> Final token count generated: 142 tokens</p>
<p className="text-slate-500">[14:52:02.342] <span className="text-primary">INFO</span> Request closed. Total latency: 1.1s</p>
<p className="text-slate-500">[14:52:04.001] <span className="text-primary">INFO</span> Routing decision: model="llama-3" reason="internal_tool_call"</p>
<p className="text-slate-500">[14:52:04.020] <span className="text-amber-500">WARN</span> Upstream latency warning: "anthropic" latency &gt; 2.5s</p>
<p className="text-slate-500">[14:52:04.050] <span className="text-slate-100">DEBUG</span> Executing plugin: "WeatherAPI_Tool"</p>
<div className="h-4 w-1.5 bg-success-green animate-pulse inline-block"></div>
</div>
</div>
</div>
</div>
</main>

        </div>
    );
}
