import { useQuery } from '@tanstack/react-query'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { RefreshCw, CheckCircle, XCircle } from 'lucide-react'
import { getFeedbackStats, getHealth } from '../api'

const StatCard = ({ label, value, sub, color = '#00d4ff' }) => (
  <div className="bg-[#080d14] border border-[#162030] rounded-2xl p-5">
    <div className="font-mono text-[10px] font-bold tracking-widest text-[#2a3d52] uppercase mb-3">{label}</div>
    <div style={{ color }} className="font-mono text-3xl font-bold leading-none mb-1">{value}</div>
    {sub && <div className="text-[#5a7a99] text-xs mt-1">{sub}</div>}
  </div>
)

export default function DashboardPage() {
  const { data: stats, refetch: refetchStats } = useQuery({
    queryKey: ['feedbackStats'],
    queryFn: getFeedbackStats,
    refetchInterval: 15000,
  })

  const { data: health } = useQuery({
    queryKey: ['health'],
    queryFn: getHealth,
    refetchInterval: 10000,
  })

  const chartData = stats?.by_variant?.map(v => ({
    name: v.variant,
    win_rate: Math.round(v.win_rate * 100),
    total: v.total,
    thumbs_up: v.thumbs_up,
    thumbs_down: v.thumbs_down,
  })) || []

  const topVariant = chartData.reduce((best, v) =>
    v.win_rate > (best?.win_rate || 0) ? v : best, null)

  return (
    <div className="h-[calc(100vh-57px)] overflow-y-auto px-6 py-6 max-w-5xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold mb-1">Dashboard</h1>
          <p className="text-[#5a7a99] text-sm">Live feedback stats and system health.</p>
        </div>
        <button
          onClick={refetchStats}
          className="flex items-center gap-2 font-mono text-xs text-[#5a7a99] hover:text-[#dce8f5] border border-[#162030] hover:border-[#1c2d40] px-3 py-2 rounded-lg transition-all"
        >
          <RefreshCw size={12} /> Refresh
        </button>
      </div>

      {/* System Health */}
      {health && (
        <div className="bg-[#080d14] border border-[#162030] rounded-2xl p-5 mb-5">
          <div className="font-mono text-[10px] font-bold tracking-widest text-[#2a3d52] uppercase mb-3">System Health</div>
          <div className="flex gap-6">
            {[
              { label: 'API',      status: health.status },
              { label: 'Database', status: health.db },
              { label: 'Redis',    status: health.redis || 'unknown' },
            ].map(({ label, status }) => (
              <div key={label} className="flex items-center gap-2">
                {status === 'ok'
                  ? <CheckCircle size={14} className="text-[#00ff9d]" />
                  : <XCircle size={14} className="text-red-400" />}
                <span className="text-sm text-[#dce8f5]">{label}</span>
                <span className={`font-mono text-xs ${status === 'ok' ? 'text-[#00ff9d]' : 'text-red-400'}`}>
                  {status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-3 gap-4 mb-5">
        <StatCard
          label="Total Feedback"
          value={stats?.total_feedback ?? '—'}
          sub="ratings submitted"
          color="#00d4ff"
        />
        <StatCard
          label="Best Variant"
          value={topVariant?.name ?? '—'}
          sub={topVariant ? `${topVariant.win_rate}% win rate` : 'no data yet'}
          color="#00ff9d"
        />
        <StatCard
          label="Variants Tracked"
          value={stats?.by_variant?.length ?? '—'}
          sub="active in experiment"
          color="#bc8cff"
        />
      </div>

      {/* Win Rate Chart */}
      <div className="bg-[#080d14] border border-[#162030] rounded-2xl p-5 mb-5">
        <div className="font-mono text-[10px] font-bold tracking-widest text-[#2a3d52] uppercase mb-4">
          Win Rate by Variant (%)
        </div>
        {chartData.length > 0
          ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData} barSize={40}>
                <XAxis
                  dataKey="name"
                  tick={{ fill: '#5a7a99', fontFamily: 'IBM Plex Mono', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#5a7a99', fontFamily: 'IBM Plex Mono', fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  domain={[0, 100]}
                />
                <Tooltip
                  contentStyle={{
                    background: '#0d1520',
                    border: '1px solid #162030',
                    borderRadius: '8px',
                    fontFamily: 'IBM Plex Mono',
                    fontSize: 11,
                  }}
                  cursor={{ fill: '#162030' }}
                  formatter={(val) => [`${val}%`, 'Win Rate']}
                />
                <Bar dataKey="win_rate" radius={[4, 4, 0, 0]}>
                  {chartData.map((_, i) => (
                    <Cell key={i} fill={i === 0 ? '#00d4ff' : '#bc8cff'} fillOpacity={0.8} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-[#2a3d52] text-sm font-mono">
              No feedback data yet — submit some ratings in the Chat tab
            </div>
          )
        }
      </div>

      {/* Variant Table */}
      {chartData.length > 0 && (
        <div className="bg-[#080d14] border border-[#162030] rounded-2xl overflow-hidden">
          <div className="font-mono text-[10px] font-bold tracking-widest text-[#2a3d52] uppercase p-5 border-b border-[#162030]">
            Breakdown by Variant
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#162030]">
                {['Variant', '👍 Up', '👎 Down', 'Total', 'Win Rate'].map(h => (
                  <th key={h} className="text-left font-mono text-[10px] text-[#2a3d52] uppercase tracking-wider px-5 py-3">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {chartData.map((v, i) => (
                <tr key={i} className="border-b border-[#0d1520] hover:bg-[#0d1520] transition-colors">
                  <td className="px-5 py-3 font-mono text-xs text-[#dce8f5]">{v.name}</td>
                  <td className="px-5 py-3 font-mono text-xs text-[#00ff9d]">{v.thumbs_up}</td>
                  <td className="px-5 py-3 font-mono text-xs text-red-400">{v.thumbs_down}</td>
                  <td className="px-5 py-3 font-mono text-xs text-[#5a7a99]">{v.total}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 rounded-full bg-[#162030] flex-1 max-w-[80px]">
                        <div
                          style={{
                            width: `${v.win_rate}%`,
                            background: v.win_rate > 50 ? '#00ff9d' : '#ffb347',
                          }}
                          className="h-full rounded-full"
                        />
                      </div>
                      <span className="font-mono text-xs text-[#dce8f5]">{v.win_rate}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}