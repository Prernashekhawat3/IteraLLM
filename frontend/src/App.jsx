import { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MessageSquare, Swords, LayoutDashboard, Activity } from 'lucide-react'
import ChatPage from './pages/ChatPage'
import ArenaPage from './pages/ArenaPage'
import DashboardPage from './pages/DashboardPage'
import LandingPage from './pages/LandingPage'

const queryClient = new QueryClient()

const TABS = [
  { id: 'chat',      label: 'Chat',      Icon: MessageSquare },
  { id: 'arena',     label: 'Arena',     Icon: Swords },
  { id: 'dashboard', label: 'Dashboard', Icon: LayoutDashboard },
]

import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-10 text-red-500 bg-red-900/10 min-h-screen">
          <h1 className="text-2xl font-bold mb-4">Something went wrong.</h1>
          <pre className="text-sm bg-black/50 p-4 rounded overflow-auto mb-4">{this.state.error?.toString()}</pre>
          <details className="text-xs text-slate-400 whitespace-pre-wrap">
            <summary>Component Stack Trace</summary>
            {this.state.errorInfo?.componentStack}
          </details>
          <button onClick={() => window.location.reload()} className="mt-6 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-500">
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const [tab, setTab] = useState('landing')

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        {tab === 'landing' ? (
          <LandingPage onNavigate={(newTab) => setTab(newTab)} />
        ) : (
          <div className="min-h-screen bg-[#05080d] text-[#dce8f5] flex flex-col">

            {/* ── Top Nav ── */}
            <nav className="border-b border-[#162030] bg-[#080d14] px-6 py-0 flex items-center gap-0">
              <div className="flex items-center gap-2 pr-8 border-r border-[#162030] py-4 cursor-pointer" onClick={() => setTab('landing')}>
                <Activity size={16} className="text-[#00d4ff]" />
                <span className="font-mono text-sm font-bold tracking-widest text-[#00d4ff]">
                  ITERALLM
                </span>
              </div>

              {TABS.map(({ id, label, Icon }) => (
                <button
                  key={id}
                  onClick={() => setTab(id)}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-all ${
                    tab === id
                      ? 'border-[#00d4ff] text-[#00d4ff] bg-[#00d4ff08]'
                      : 'border-transparent text-[#5a7a99] hover:text-[#dce8f5] hover:bg-[#0d1520]'
                  }`}
                >
                  <Icon size={15} />
                  {label}
                </button>
              ))}
            </nav>

            {/* ── Page Content ── */}
            <main className="flex-1 overflow-hidden">
              {tab === 'chat'      && <ChatPage />}
              {tab === 'arena'     && <ArenaPage />}
              {tab === 'dashboard' && <DashboardPage />}
            </main>

          </div>
        )}
      </QueryClientProvider>
    </ErrorBoundary>
  )
}