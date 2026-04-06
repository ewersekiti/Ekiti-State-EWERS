import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { HiOutlineClipboardList } from 'react-icons/hi'
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

export default function MyIncidents() {
  const [incidents, setIncidents] = useState([])
  const [loading,   setLoading]   = useState(true)

  useEffect(() => {
    api.get('/incidents?assignedTo=me&limit=100')
      .then((data) => setIncidents(data.incidents || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Incidents</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {incidents.length} incident{incidents.length !== 1 ? 's' : ''} assigned to you
        </p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <div key={i} className="h-28 bg-gray-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : incidents.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center">
          <HiOutlineClipboardList className="text-gray-300 text-5xl mx-auto mb-3" />
          <p className="text-gray-400 font-medium">No incidents assigned to you yet.</p>
          <p className="text-gray-300 text-sm mt-1">Check back later or contact your dispatcher.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {incidents.map((inc) => {
            const statusCfg = STATUS_CONFIG[inc.status] || STATUS_CONFIG.pending
            return (
              <div key={inc._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-xs text-gray-400 font-mono">{inc.incidentId}</span>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${statusCfg.color}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                        {statusCfg.label}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${PRIORITY_CONFIG[inc.priority] || 'bg-gray-100 text-gray-600'}`}>
                        {inc.priority}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900 text-base truncate">{inc.title}</h3>
                    <p className="text-sm text-gray-500 mt-0.5">{inc.location}</p>
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">{inc.description}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <p className="text-xs text-gray-400">
                      {new Date(inc.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                    <Link to={`/dashboard/incidents/${inc.incidentId}`}
                      className="px-4 py-2 bg-green-600 text-white text-xs font-semibold rounded-xl hover:bg-green-700 transition-colors">
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
