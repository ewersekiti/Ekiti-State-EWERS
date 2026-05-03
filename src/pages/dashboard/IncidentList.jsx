import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { HiOutlinePlusCircle, HiOutlineSearch, HiOutlineTrash, HiOutlineX } from 'react-icons/hi'
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

function DeleteIncidentModal({ incident, onClose, onDeleted }) {
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')

  const handleDelete = async () => {
    setDeleting(true)
    setError('')
    try {
      await api.delete(`/incidents/${incident.incidentId}`)
      onDeleted(incident)
    } catch (err) {
      setError(err.message || 'Failed to delete incident')
      setDeleting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
              <HiOutlineTrash className="text-red-600 text-xl" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900">Delete Incident</h2>
              <p className="text-xs text-gray-400 mt-0.5">{incident.incidentId}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <HiOutlineX className="text-xl" />
          </button>
        </div>

        <p className="text-sm text-gray-600 leading-relaxed">
          This will permanently delete <span className="font-semibold text-gray-900">{incident.title}</span>. This action cannot be undone.
        </p>

        {error && <p className="mt-4 text-sm text-red-500 bg-red-50 border border-red-100 px-3 py-2 rounded-xl">{error}</p>}

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            disabled={deleting}
            className="px-5 py-2.5 border border-gray-200 text-sm font-semibold text-gray-700 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-60"
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}

function BulkDeleteIncidentModal({ incidents, onClose, onDeleted }) {
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')

  const handleDelete = async () => {
    setDeleting(true)
    setError('')
    try {
      await Promise.all(incidents.map((incident) => api.delete(`/incidents/${incident.incidentId}`)))
      onDeleted(incidents)
    } catch (err) {
      setError(err.message || 'Failed to delete selected incidents')
      setDeleting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
              <HiOutlineTrash className="text-red-600 text-xl" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900">Delete Selected Incidents</h2>
              <p className="text-xs text-gray-400 mt-0.5">{incidents.length} selected</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <HiOutlineX className="text-xl" />
          </button>
        </div>

        <p className="text-sm text-gray-600 leading-relaxed">
          This will permanently delete {incidents.length} incident{incidents.length !== 1 ? 's' : ''}. This action cannot be undone.
        </p>

        <div className="mt-4 max-h-36 overflow-y-auto rounded-xl bg-gray-50 border border-gray-100 divide-y divide-gray-100">
          {incidents.map((incident) => (
            <div key={incident._id} className="px-3 py-2">
              <p className="text-xs font-semibold text-gray-800 truncate">{incident.title}</p>
              <p className="text-[11px] text-gray-400">{incident.incidentId}</p>
            </div>
          ))}
        </div>

        {error && <p className="mt-4 text-sm text-red-500 bg-red-50 border border-red-100 px-3 py-2 rounded-xl">{error}</p>}

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            disabled={deleting}
            className="px-5 py-2.5 border border-gray-200 text-sm font-semibold text-gray-700 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-60"
          >
            {deleting ? 'Deleting...' : 'Delete Selected'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function IncidentList() {
  const { hasPermission } = usePermission()
  const canDelete = hasPermission('delete_incident')
  const [incidents, setIncidents] = useState([])
  const [total, setTotal]         = useState(0)
  const [loading, setLoading]     = useState(true)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)
  const [selectedIds, setSelectedIds] = useState([])

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

  const handleDeleted = (incident) => {
    setIncidents((prev) => prev.filter((item) => item._id !== incident._id))
    setTotal((prev) => Math.max(0, prev - 1))
    setSelectedIds((prev) => prev.filter((id) => id !== incident._id))
    setDeleteTarget(null)
  }

  const selectedIncidents = incidents.filter((incident) => selectedIds.includes(incident._id))
  const allVisibleSelected = incidents.length > 0 && incidents.every((incident) => selectedIds.includes(incident._id))

  const toggleSelected = (id) => {
    setSelectedIds((prev) => (
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    ))
  }

  const toggleAllVisible = () => {
    if (allVisibleSelected) {
      setSelectedIds((prev) => prev.filter((id) => !incidents.some((incident) => incident._id === id)))
      return
    }
    setSelectedIds((prev) => Array.from(new Set([...prev, ...incidents.map((incident) => incident._id)])))
  }

  const handleBulkDeleted = (deletedIncidents) => {
    const deletedIds = new Set(deletedIncidents.map((incident) => incident._id))
    setIncidents((prev) => prev.filter((incident) => !deletedIds.has(incident._id)))
    setTotal((prev) => Math.max(0, prev - deletedIncidents.length))
    setSelectedIds((prev) => prev.filter((id) => !deletedIds.has(id)))
    setBulkDeleteOpen(false)
  }

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

      {canDelete && selectedIds.length > 0 && (
        <div className="bg-red-50 border border-red-100 rounded-2xl px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-sm font-semibold text-red-700">
            {selectedIds.length} incident{selectedIds.length !== 1 ? 's' : ''} selected
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="px-4 py-2 border border-red-200 text-red-700 bg-white text-xs font-semibold rounded-xl hover:bg-red-50 transition-colors"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => setBulkDeleteOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-xl transition-colors"
            >
              <HiOutlineTrash /> Delete Selected
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400 text-sm animate-pulse">Loading incidents…</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-left">
                  {canDelete && (
                    <th className="px-6 py-3 w-12">
                      <input
                        type="checkbox"
                        checked={allVisibleSelected}
                        onChange={toggleAllVisible}
                        className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                        aria-label="Select all visible incidents"
                      />
                    </th>
                  )}
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
                      {canDelete && (
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(inc._id)}
                            onChange={() => toggleSelected(inc._id)}
                            className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                            aria-label={`Select ${inc.incidentId}`}
                          />
                        </td>
                      )}
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
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/dashboard/incidents/${inc.incidentId}`}
                            className="text-xs text-green-600 font-semibold hover:text-green-800 hover:underline"
                          >
                            View
                          </Link>
                          {canDelete && (
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(inc)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                              title="Delete incident"
                              aria-label={`Delete ${inc.incidentId}`}
                            >
                              <HiOutlineTrash />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
                {incidents.length === 0 && (
                  <tr>
                    <td colSpan={canDelete ? 8 : 7} className="px-6 py-16 text-center">
                      <p className="text-gray-400 text-sm">No incidents match your filters.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {deleteTarget && (
        <DeleteIncidentModal
          incident={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onDeleted={handleDeleted}
        />
      )}

      {bulkDeleteOpen && (
        <BulkDeleteIncidentModal
          incidents={selectedIncidents}
          onClose={() => setBulkDeleteOpen(false)}
          onDeleted={handleBulkDeleted}
        />
      )}
    </div>
  )
}
