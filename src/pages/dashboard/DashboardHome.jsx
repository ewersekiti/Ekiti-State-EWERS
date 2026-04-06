import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  HiOutlineClipboardList,
  HiOutlineClock,
  HiOutlineRefresh,
  HiOutlineCheckCircle,
  HiOutlineExclamation,
  HiOutlineLocationMarker,
  HiOutlineArrowRight,
  HiOutlineLightningBolt,
} from 'react-icons/hi'
import { useAuthStore } from '../../store/authStore'
import { usePermission } from '../../hooks/usePermission'
import api from '../../services/api'

const STATUS_CONFIG = {
  pending:     { label: 'Pending',     color: 'bg-amber-100 text-amber-700',   dot: 'bg-amber-500',   ring: 'ring-amber-200'  },
  in_progress: { label: 'In Progress', color: 'bg-blue-100 text-blue-700',     dot: 'bg-blue-500',    ring: 'ring-blue-200'   },
  resolved:    { label: 'Resolved',    color: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500', ring: 'ring-emerald-200' },
}

const PRIORITY_CONFIG = {
  critical: { color: 'bg-red-100 text-red-700',    bar: 'bg-red-500'    },
  high:     { color: 'bg-orange-100 text-orange-700', bar: 'bg-orange-400' },
  medium:   { color: 'bg-yellow-100 text-yellow-700', bar: 'bg-yellow-400' },
  low:      { color: 'bg-gray-100 text-gray-600',   bar: 'bg-gray-300'   },
}

const CHANNEL_ICONS = { sms: '💬', web: '🌐', app: '📱', phone: '📞' }

function StatCard({ icon: Icon, label, value, gradient, textColor, iconColor, sub, percentage, total }) {
  const pct = total ? Math.round((value / total) * 100) : null
  return (
    <div className={`relative overflow-hidden rounded-2xl p-5 ${gradient} shadow-sm`}>
      <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-white/10" />
      <div className="absolute -right-1 -top-1 w-14 h-14 rounded-full bg-white/10" />
      <div className="relative z-10">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${iconColor}`}>
          <Icon className="text-xl" />
        </div>
        <p className={`text-3xl font-extrabold ${textColor} tracking-tight`}>{value}</p>
        <p className={`text-sm font-semibold mt-0.5 ${textColor} opacity-80`}>{label}</p>
        {sub && <p className={`text-xs mt-1 ${textColor} opacity-60`}>{sub}</p>}
        {pct !== null && (
          <div className="mt-3">
            <div className="h-1.5 rounded-full bg-white/30 overflow-hidden">
              <div className="h-full rounded-full bg-white/70 transition-all" style={{ width: `${pct}%` }} />
            </div>
            <p className={`text-xs mt-1 ${textColor} opacity-60`}>{pct}% of total</p>
          </div>
        )}
      </div>
    </div>
  )
}

function CriticalBanner({ incidents }) {
  if (!incidents.length) return null
  return (
    <div className="bg-red-50 border border-red-200 rounded-2xl px-5 py-4 flex items-center gap-4">
      <div className="w-9 h-9 rounded-xl bg-red-500 flex items-center justify-center shrink-0 animate-pulse">
        <HiOutlineLightningBolt className="text-white text-lg" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-red-800">
          {incidents.length} Critical Incident{incidents.length > 1 ? 's' : ''} Require Immediate Attention
        </p>
        <p className="text-xs text-red-600 mt-0.5 truncate">
          {incidents.map((i) => i.title).join(' · ')}
        </p>
      </div>
      <Link
        to="/dashboard/incidents"
        className="shrink-0 flex items-center gap-1 text-xs font-semibold text-red-700 hover:text-red-900 transition-colors"
      >
        View <HiOutlineArrowRight className="text-sm" />
      </Link>
    </div>
  )
}

function PriorityBar({ incidents }) {
  const counts = { critical: 0, high: 0, medium: 0, low: 0 }
  incidents.forEach((i) => { if (counts[i.priority] !== undefined) counts[i.priority]++ })
  const total = incidents.length || 1

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">Priority Breakdown</h3>
      <div className="space-y-3">
        {Object.entries(counts).map(([priority, count]) => {
          const cfg = PRIORITY_CONFIG[priority]
          const pct = Math.round((count / total) * 100)
          return (
            <div key={priority}>
              <div className="flex justify-between items-center mb-1">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${cfg.color}`}>{priority}</span>
                <span className="text-xs font-bold text-gray-700">{count}</span>
              </div>
              <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                <div className={`h-full rounded-full transition-all ${cfg.bar}`} style={{ width: `${pct}%` }} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function DashboardHome() {
  const { user } = useAuthStore()
  const { hasPermission } = usePermission()

  const [incidents, setIncidents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/incidents?limit=100')
      .then((data) => setIncidents(data.incidents || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const total      = incidents.length
  const pending    = incidents.filter((i) => i.status === 'pending').length
  const inProgress = incidents.filter((i) => i.status === 'in_progress').length
  const resolved   = incidents.filter((i) => i.status === 'resolved').length
  const critical   = incidents.filter((i) => i.priority === 'critical' && i.status !== 'resolved')

  const recent = incidents.slice(0, 5)

  const allTimeline = incidents.flatMap((inc) =>
    (inc.timeline || []).map((t, idx) => ({ ...t, incId: inc.incidentId, key: `${inc.incidentId}-${idx}` }))
  ).sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 7)

  const ACTOR_COLORS = ['bg-violet-500', 'bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500']
  const actorColor = (name) => ACTOR_COLORS[(name?.charCodeAt(0) || 0) % ACTOR_COLORS.length] || 'bg-gray-400'

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded-xl w-64" />
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-gray-200 rounded-2xl" />)}
        </div>
        <div className="h-64 bg-gray-200 rounded-2xl" />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Page header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">
            Welcome back, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {new Date().toLocaleDateString('en-NG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            {' · '}{user?.agency}
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold px-3 py-1.5 rounded-full">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          System Live
        </div>
      </div>

      {/* Critical alert */}
      {hasPermission('view_incidents') && <CriticalBanner incidents={critical} />}

      {/* Stat cards */}
      {hasPermission('view_incidents') && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard icon={HiOutlineClipboardList} label="Total Incidents" value={total}
            gradient="bg-linear-to-br from-slate-700 to-slate-900" textColor="text-white" iconColor="bg-white/20 text-white" sub="All time" />
          <StatCard icon={HiOutlineClock} label="Pending" value={pending}
            gradient="bg-linear-to-br from-amber-400 to-orange-500" textColor="text-white" iconColor="bg-white/20 text-white"
            sub="Awaiting assignment" percentage total={total} />
          <StatCard icon={HiOutlineRefresh} label="In Progress" value={inProgress}
            gradient="bg-linear-to-br from-blue-500 to-indigo-600" textColor="text-white" iconColor="bg-white/20 text-white"
            sub="Actively handled" percentage total={total} />
          <StatCard icon={HiOutlineCheckCircle} label="Resolved" value={resolved}
            gradient="bg-linear-to-br from-emerald-400 to-green-600" textColor="text-white" iconColor="bg-white/20 text-white"
            sub="Closed incidents" percentage total={total} />
        </div>
      )}

      {/* Field officer summary */}
      {hasPermission('view_assigned_incidents') && !hasPermission('view_incidents') && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <StatCard icon={HiOutlineClipboardList} label="Assigned to Me" value={total}
            gradient="bg-linear-to-br from-emerald-400 to-green-600" textColor="text-white" iconColor="bg-white/20 text-white" />
          <StatCard icon={HiOutlineExclamation} label="Active" value={inProgress}
            gradient="bg-linear-to-br from-blue-500 to-indigo-600" textColor="text-white" iconColor="bg-white/20 text-white" />
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent incidents */}
        <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div>
              <h2 className="font-bold text-gray-900">Recent Incidents</h2>
              <p className="text-xs text-gray-400 mt-0.5">{recent.length} most recent</p>
            </div>
            {hasPermission('view_incidents') && (
              <Link to="/dashboard/incidents" className="flex items-center gap-1 text-xs text-green-600 font-semibold hover:text-green-800 transition-colors">
                View all <HiOutlineArrowRight className="text-sm" />
              </Link>
            )}
          </div>

          <div className="divide-y divide-gray-50">
            {recent.map((inc) => {
              const statusCfg   = STATUS_CONFIG[inc.status]   || STATUS_CONFIG.pending
              const priorityCfg = PRIORITY_CONFIG[inc.priority] || PRIORITY_CONFIG.medium
              return (
                <Link
                  key={inc._id}
                  to={`/dashboard/incidents/${inc.incidentId}`}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors group"
                >
                  <div className={`w-1 h-10 rounded-full shrink-0 ${priorityCfg.bar}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-green-700 transition-colors">{inc.title}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <HiOutlineLocationMarker className="text-gray-400 text-xs shrink-0" />
                      <p className="text-xs text-gray-400 truncate">{inc.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${priorityCfg.color}`}>
                      {inc.priority}
                    </span>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${statusCfg.color}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                      {statusCfg.label}
                    </span>
                    <span className="text-lg" title={inc.channel}>{CHANNEL_ICONS[inc.channel] || '📋'}</span>
                  </div>
                </Link>
              )
            })}
            {recent.length === 0 && (
              <div className="px-6 py-12 text-center text-gray-400 text-sm">No incidents yet.</div>
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {hasPermission('view_incidents') && <PriorityBar incidents={incidents} />}

          {/* Activity feed */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">Activity Feed</h2>
              <p className="text-xs text-gray-400 mt-0.5">Latest updates across system</p>
            </div>
            <div className="px-4 py-2">
              {allTimeline.length === 0 && (
                <p className="text-xs text-gray-400 py-4 text-center">No activity yet.</p>
              )}
              {allTimeline.map((entry, idx) => {
                const initials = entry.by?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || '?'
                const isLast = idx === allTimeline.length - 1
                return (
                  <div key={entry.key} className="flex gap-3 py-3 relative">
                    {!isLast && <div className="absolute left-4.75 top-10 bottom-0 w-px bg-gray-100" />}
                    <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-white text-xs font-bold ${actorColor(entry.by)}`}>
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0 pt-0.5">
                      <p className="text-xs font-semibold text-gray-800 leading-snug">{entry.action}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-xs text-gray-400">{entry.incId}</span>
                        <span className="text-gray-200">·</span>
                        <span className="text-xs text-gray-400">{entry.by}</span>
                        <span className="text-gray-200">·</span>
                        <span className="text-xs text-gray-400">
                          {new Date(entry.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
