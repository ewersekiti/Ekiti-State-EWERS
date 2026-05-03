import { useCallback, useEffect, useState } from 'react'
import {
  HiOutlineBell,
  HiOutlineExclamation,
  HiOutlineLocationMarker,
  HiOutlinePlusCircle,
  HiOutlineRefresh,
  HiOutlineTrash,
  HiOutlineUser,
  HiOutlineX,
} from 'react-icons/hi'
import api from '../../services/api'

const SEVERITY_CONFIG = {
  critical: { label: 'Critical', color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200', dot: 'bg-red-600' },
  high:     { label: 'High',     color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200', dot: 'bg-orange-500' },
  moderate: { label: 'Moderate', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200', dot: 'bg-amber-500' },
  low:      { label: 'Low',      color: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200', dot: 'bg-green-600' },
}

const SEVERITIES = ['critical', 'high', 'moderate', 'low']
const ICONS = [
  'warning-outline',
  'alert-circle-outline',
  'flame-outline',
  'water-outline',
  'medical-outline',
  'shield-outline',
  'car-outline',
  'person-outline',
]
const LGAS = [
  '',
  'Ado-Ekiti',
  'Ikere-Ekiti',
  'Ijero-Ekiti',
  'Efon-Alaaye',
  'Oye-Ekiti',
  'Ikole-Ekiti',
  'Aramoko-Ekiti',
  'Emure-Ekiti',
  'Ise-Ekiti',
  'Ilawe-Ekiti',
  'Omuo-Ekiti',
  'Ido-Ekiti',
  'Iyin-Ekiti',
  'Igede-Ekiti',
  'Afao-Ekiti',
]

function formatDate(value) {
  return new Date(value).toLocaleString('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function ComposeAlertModal({ onClose, onPosted }) {
  const [form, setForm] = useState({
    title: '',
    body: '',
    severity: 'moderate',
    icon: 'warning-outline',
    lga: '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const update = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setError('')
  }

  const handleSubmit = async () => {
    if (!form.title.trim()) { setError('Title is required'); return }
    if (!form.body.trim()) { setError('Message is required'); return }

    setSaving(true)
    setError('')
    try {
      await api.post('/alerts', {
        ...form,
        title: form.title.trim(),
        body: form.body.trim(),
        lga: form.lga || null,
      })
      onPosted()
      onClose()
    } catch (err) {
      setError(err.message || 'Failed to post alert')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="font-bold text-gray-900 text-lg">Post Public Alert</h2>
            <p className="text-xs text-gray-500 mt-0.5">Citizens will see this in the mobile app immediately</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <HiOutlineX className="text-xl" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {error && <p className="text-red-500 text-sm bg-red-50 border border-red-200 px-3 py-2 rounded-xl">{error}</p>}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Title <span className="text-red-500">*</span></label>
            <input
              value={form.title}
              onChange={(e) => update('title', e.target.value)}
              placeholder="e.g. Flash Flood Warning - Ado-Ekiti"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Message <span className="text-red-500">*</span></label>
            <textarea
              value={form.body}
              onChange={(e) => update('body', e.target.value)}
              rows={4}
              placeholder="Describe the situation and any safety instructions..."
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Severity</label>
              <select
                value={form.severity}
                onChange={(e) => update('severity', e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
              >
                {SEVERITIES.map((severity) => (
                  <option key={severity} value={severity}>{SEVERITY_CONFIG[severity].label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">LGA</label>
              <select
                value={form.lga}
                onChange={(e) => update('lga', e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
              >
                {LGAS.map((lga) => (
                  <option key={lga || 'all'} value={lga}>{lga || 'All LGAs'}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Icon</label>
            <div className="flex flex-wrap gap-2">
              {ICONS.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => update('icon', icon)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono border transition-colors ${
                    form.icon === icon ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <button onClick={onClose} disabled={saving}
            className="px-5 py-2.5 border border-gray-200 text-sm font-semibold text-gray-700 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-60">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-60">
            <HiOutlineBell /> {saving ? 'Posting...' : 'Post Alert'}
          </button>
        </div>
      </div>
    </div>
  )
}

function DeleteAlertModal({ alert, onClose, onDeleted }) {
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')

  const handleDelete = async () => {
    setDeleting(true)
    setError('')
    try {
      await api.delete(`/alerts/${alert._id}`)
      onDeleted(alert._id)
    } catch (err) {
      setError(err.message || 'Failed to delete alert')
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
              <h2 className="font-bold text-gray-900">Delete Alert</h2>
              <p className="text-xs text-gray-400 mt-0.5">This removes it from the public app</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <HiOutlineX className="text-xl" />
          </button>
        </div>

        <p className="text-sm text-gray-600 leading-relaxed">
          Delete <span className="font-semibold text-gray-900">{alert.title}</span>? This action cannot be undone.
        </p>

        {error && <p className="mt-4 text-sm text-red-500 bg-red-50 border border-red-100 px-3 py-2 rounded-xl">{error}</p>}

        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} disabled={deleting}
            className="px-5 py-2.5 border border-gray-200 text-sm font-semibold text-gray-700 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-60">
            Cancel
          </button>
          <button onClick={handleDelete} disabled={deleting}
            className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-60">
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AlertManagement() {
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showCompose, setShowCompose] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const fetchAlerts = useCallback(() => {
    setLoading(true)
    setError('')
    api.get('/alerts')
      .then((data) => setAlerts(data.alerts || []))
      .catch((err) => setError(err.message || 'Failed to load alerts'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    fetchAlerts()
  }, [fetchAlerts])

  const handleDeleted = (id) => {
    setAlerts((prev) => prev.filter((alert) => alert._id !== id))
    setDeleteTarget(null)
  }

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Public Alerts</h1>
          <p className="text-sm text-gray-500 mt-0.5">{alerts.length} active alert{alerts.length !== 1 ? 's' : ''} showing in the app</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchAlerts}
            className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-200 text-gray-700 bg-white text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors"
          >
            <HiOutlineRefresh /> Refresh
          </button>
          <button
            type="button"
            onClick={() => setShowCompose(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            <HiOutlinePlusCircle className="text-lg" /> Post Alert
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 rounded-2xl px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="h-40 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : alerts.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center">
          <HiOutlineBell className="text-gray-300 text-5xl mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No active public alerts.</p>
          <p className="text-gray-300 text-sm mt-1">Post an alert to notify citizens through the app.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {alerts.map((alert) => {
            const cfg = SEVERITY_CONFIG[alert.severity] || SEVERITY_CONFIG.moderate
            return (
              <div key={alert._id} className={`bg-white rounded-2xl shadow-sm border ${cfg.border} overflow-hidden`}>
                <div className={`h-1 ${cfg.dot}`} />
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className={`w-10 h-10 rounded-xl ${cfg.bg} flex items-center justify-center shrink-0`}>
                        <HiOutlineExclamation className={`${cfg.color} text-xl`} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.color}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                            {cfg.label}
                          </span>
                          <span className="text-xs text-gray-400 font-mono">{alert.icon}</span>
                        </div>
                        <h2 className="font-bold text-gray-900 leading-snug">{alert.title}</h2>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(alert)}
                      className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Delete alert"
                      aria-label={`Delete ${alert.title}`}
                    >
                      <HiOutlineTrash />
                    </button>
                  </div>

                  <p className="text-sm text-gray-600 leading-relaxed mt-4">{alert.body}</p>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-4 pt-4 border-t border-gray-100">
                    <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                      <HiOutlineLocationMarker className="text-gray-400" /> {alert.lga || 'All LGAs'}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                      <HiOutlineUser className="text-gray-400" /> {alert.createdBy || 'Admin'}
                    </span>
                    <span className="text-xs text-gray-400">{formatDate(alert.createdAt)}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {showCompose && (
        <ComposeAlertModal
          onClose={() => setShowCompose(false)}
          onPosted={fetchAlerts}
        />
      )}

      {deleteTarget && (
        <DeleteAlertModal
          alert={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onDeleted={handleDeleted}
        />
      )}
    </div>
  )
}
