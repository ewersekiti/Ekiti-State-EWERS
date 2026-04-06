import { useEffect, useState } from 'react'
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  LineChart, Line, ResponsiveContainer, Legend,
} from 'recharts'
import api from '../../services/api'

const RADIAN = Math.PI / 180
const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  const r = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + r * Math.cos(-midAngle * RADIAN)
  const y = cy + r * Math.sin(-midAngle * RADIAN)
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={600}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  )
}

function SummaryCard({ label, value, color }) {
  return (
    <div className={`rounded-2xl p-5 ${color}`}>
      <p className="text-3xl font-bold">{value}</p>
      <p className="text-sm font-medium mt-1 opacity-80">{label}</p>
    </div>
  )
}

const STATUS_PIE_COLORS = { pending: '#f59e0b', in_progress: '#3b82f6', resolved: '#16a34a' }

export default function Reports() {
  const [summary, setSummary]   = useState(null)
  const [weekly,  setWeekly]    = useState([])
  const [byChannel, setByChannel] = useState([])
  const [byType,    setByType]    = useState([])
  const [loading,   setLoading]   = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/reports/summary'),
      api.get('/reports/weekly'),
      api.get('/reports/by-channel'),
      api.get('/reports/by-type'),
    ])
      .then(([s, w, c, t]) => {
        setSummary(s)
        setWeekly(w.weekly || [])
        setByChannel(c.byChannel || [])
        setByType(t.byType || [])
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded-xl w-64" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-gray-200 rounded-2xl" />)}
        </div>
        <div className="h-64 bg-gray-200 rounded-2xl" />
      </div>
    )
  }

  const statusPieData = summary ? [
    { name: 'Pending',     value: summary.pending,     fill: STATUS_PIE_COLORS.pending     },
    { name: 'In Progress', value: summary.in_progress, fill: STATUS_PIE_COLORS.in_progress },
    { name: 'Resolved',    value: summary.resolved,    fill: STATUS_PIE_COLORS.resolved    },
  ].filter((d) => d.value > 0) : []

  const total    = summary?.total    || 0
  const resolved = summary?.resolved || 0
  const assigned = 0 // not available from summary endpoint

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports &amp; Analytics</h1>
        <p className="text-sm text-gray-500 mt-0.5">Incident statistics and operational overview</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard label="Total Incidents" value={summary?.total ?? '—'}     color="bg-indigo-600 text-white" />
        <SummaryCard label="Pending"          value={summary?.pending ?? '—'}   color="bg-yellow-500 text-white" />
        <SummaryCard label="In Progress"      value={summary?.in_progress ?? '—'} color="bg-blue-600 text-white" />
        <SummaryCard label="Resolved"         value={summary?.resolved ?? '—'}  color="bg-green-600 text-white" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status pie */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-1">Status Distribution</h2>
          <p className="text-xs text-gray-400 mb-4">Breakdown of incident statuses</p>
          {statusPieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={statusPieData} cx="50%" cy="50%" labelLine={false}
                  label={renderCustomLabel} outerRadius={100} dataKey="value">
                  {statusPieData.map((entry, index) => <Cell key={index} fill={entry.fill} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-300 text-sm">No data yet</div>
          )}
        </div>

        {/* Channel bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-1">Channel Distribution</h2>
          <p className="text-xs text-gray-400 mb-4">Incidents by reporting channel</p>
          {byChannel.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={byChannel} barSize={36}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="channel" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#16a34a" radius={[6, 6, 0, 0]} name="Incidents" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-300 text-sm">No data yet</div>
          )}
        </div>
      </div>

      {/* Weekly trend */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="font-semibold text-gray-900 mb-1">Weekly Incident Trend</h2>
        <p className="text-xs text-gray-400 mb-4">Incidents reported per day (last 7 days)</p>
        {weekly.length > 0 ? (
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={weekly}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="incidents" stroke="#16a34a" strokeWidth={2.5}
                dot={{ r: 5, fill: '#16a34a' }} activeDot={{ r: 7 }} name="Incidents" />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-60 flex items-center justify-center text-gray-300 text-sm">No data for the last 7 days</div>
        )}
      </div>

      {/* Type breakdown + key metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 text-center">
          <p className="text-3xl font-bold text-gray-900">
            {total > 0 ? Math.round((resolved / total) * 100) : 0}%
          </p>
          <p className="text-sm text-gray-500 mt-1">Resolution Rate</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 text-center">
          <p className="text-3xl font-bold text-red-600">{summary?.byPriority?.critical ?? 0}</p>
          <p className="text-sm text-gray-500 mt-1">Critical Incidents</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 text-center">
          <p className="text-3xl font-bold text-gray-900">{summary?.total ?? 0}</p>
          <p className="text-sm text-gray-500 mt-1">Total Reported</p>
        </div>
      </div>
    </div>
  )
}
