import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { HiOutlinePlusCircle, HiOutlineSearch } from 'react-icons/hi'
import { usePermission } from '../../hooks/usePermission'
import PermissionGuard from '../../components/dashboard/PermissionGuard'
import api from '../../services/api'

const STATUS_CONFIG = {
  pending:     { label: 'Pending',     color: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-500' },
  in_progress: { label: 'In Progress', color: 'bg-blue-100 text-blue-700',     dot: 'bg-blue-500'   },
  resolved:    { label: 'Resolved',    color: 'bg-green-100 text-green-700',   dot: 'bg-green-500'  },
}
const PRIORITY_CONFIG = {
  critical: 'bg-red-100 text-red-700',
  high:     'bg-orange-100 text-orange-700',
  medium:   'bg-yellow-100 text-yellow-700',
  low:      'bg-gray-100 text-gray-600',
}

export default function IncidentList() {
  const { hasPermission } = usePermission()
  const [incidents, setIncidents] = useState([])
  const [total, setTotal]         = useState(0)
  const [loading, setLoading]     = useState(true)

  const [search,        setSearch]        = useState('')
  const [statusFilter,  setStatusFilter]  = useState('all')
  const [channelFilter, setChannelFilter] = useState('all')

  const fetchIncidents = useCallback(() => {
    setLoading(true)
    const params = new URLSearchParams({ limit: 100 })
    if (statusFilter !== 'all')  params.set('status',  statusFilter)
    if (channelFilter !== 'all') params.set('channel', channelFilter)
    if (search.trim())           params.set('search',  search.trim())

    api.get(`/incidents?${params}`)
      .then((data) => { setIncidents(data.incidents || []); setTotal(data.total || 0) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [statusFilter, channelFilter, search])

  // Debounce search, instant on filter change
  useEffect(() => {
    const t = setTimeout(fetchIncidents, search ? 400 : 0)
    return () => clearTimeout(t)
  }, [fetchIncidents, search])

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Incidents</h1>
          <p className="text-sm text-gray-500 mt-0.5">{total} incident{total !== 1 ? 's' : ''} found</p>
        </div>
        <PermissionGuard permission="create_sms_incident">
          <Link
            to="/dashboard/sms-intake"
            className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors"
          >
            <HiOutlinePlusCircle className="text-lg" />
            SMS Intake
          </Link>
        </PermissionGuard>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
            <input
              type="text"
              placeholder="Search incidents..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>

          <select
            value={channelFilter}
            onChange={(e) => setChannelFilter(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
          >
            <option value="all">All Channels</option>
            <option value="sms">SMS</option>
            <option value="web">Web</option>
            <option value="app">App</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400 text-sm animate-pulse">Loading incidents…</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-left">
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Incident</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Priority</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Channel</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Assigned To</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {incidents.map((inc) => {
                  const statusCfg = STATUS_CONFIG[inc.status] || STATUS_CONFIG.pending
                  return (
                    <tr key={inc._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 max-w-xs">
                        <p className="font-medium text-gray-900 truncate">{inc.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{inc.incidentId} · {inc.location}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusCfg.color}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                          {statusCfg.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${PRIORITY_CONFIG[inc.priority] || 'bg-gray-100 text-gray-600'}`}>
                          {inc.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="uppercase text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">
                          {inc.channel}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {inc.assignedTo?.name || <span className="text-gray-300 italic">Unassigned</span>}
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-400">
                        {new Date(inc.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          to={`/dashboard/incidents/${inc.incidentId}`}
                          className="text-xs text-green-600 font-semibold hover:text-green-800 hover:underline"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  )
                })}
                {incidents.length === 0 && (
                  <tr>
                    <td colSpan="7" className="px-6 py-16 text-center">
                      <p className="text-gray-400 text-sm">No incidents match your filters.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
