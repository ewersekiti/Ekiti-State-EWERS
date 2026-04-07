import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  HiOutlineArrowLeft, HiOutlineLocationMarker, HiOutlinePhone,
  HiOutlineOfficeBuilding, HiOutlineUser, HiOutlineClock,
  HiOutlinePhotograph, HiOutlineVideoCamera, HiOutlineX,
  HiOutlineCheckCircle, HiOutlineExclamation,
  HiOutlineChevronLeft, HiOutlineChevronRight,
  HiOutlineBell, HiOutlineMap, HiOutlineInformationCircle,
  HiOutlineMail, HiOutlineShieldExclamation, HiOutlineBan,
} from 'react-icons/hi'
import { AnimatePresence, motion } from 'framer-motion'
import PermissionGuard from '../../components/dashboard/PermissionGuard'
import { useAuthStore } from '../../store/authStore'
import api from '../../services/api'

const STATUS_CONFIG = {
  pending:     { label: 'Pending',     color: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-500' },
  in_progress: { label: 'In Progress', color: 'bg-blue-100 text-blue-700',     dot: 'bg-blue-500'   },
  resolved:    { label: 'Resolved',    color: 'bg-green-100 text-green-700',   dot: 'bg-green-500'  },
  false_alarm: { label: 'False Alarm', color: 'bg-orange-100 text-orange-700', dot: 'bg-orange-500' },
}
const PRIORITY_CONFIG = {
  critical: 'bg-red-100 text-red-700',
  high:     'bg-orange-100 text-orange-700',
  medium:   'bg-yellow-100 text-yellow-700',
  low:      'bg-gray-100 text-gray-600',
}
const SEVERITY_ALERT = {
  critical: 'critical',
  high:     'high',
  medium:   'moderate',
  low:      'low',
}
const THUMB_PALETTES = [
  'from-slate-600 to-slate-800', 'from-gray-600 to-gray-800',
  'from-zinc-600 to-zinc-800',   'from-stone-600 to-stone-800',
  'from-neutral-600 to-neutral-800',
]

// ── Small helper: labelled info row ────────────────────────────────────────
function InfoRow({ icon: Icon, label, value }) {
  if (!value && value !== 0) return null
  return (
    <div className="flex items-start gap-3">
      <Icon className="text-gray-400 mt-0.5 shrink-0" />
      <div>
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-sm font-medium text-gray-800">{value}</p>
      </div>
    </div>
  )
}

// ── Lightbox ────────────────────────────────────────────────────────────────
function Lightbox({ media, startIndex, onClose }) {
  const [idx, setIdx] = useState(startIndex)
  const item = media[idx]
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
      onClick={onClose}
    >
      <div className="relative max-w-3xl w-full" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute -top-10 right-0 text-white/70 hover:text-white transition-colors">
          <HiOutlineX className="text-2xl" />
        </button>
        <div className={`w-full aspect-video rounded-2xl bg-linear-to-br ${THUMB_PALETTES[idx % THUMB_PALETTES.length]} flex flex-col items-center justify-center`}>
          {item.url ? (
            item.type === 'video'
              ? <video src={item.url} controls className="w-full h-full rounded-2xl object-contain" />
              : <img src={item.url} alt={item.caption} className="w-full h-full rounded-2xl object-contain" />
          ) : item.type === 'video' ? (
            <>
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-3">
                <HiOutlineVideoCamera className="text-white text-3xl" />
              </div>
              <p className="text-white font-semibold text-sm">{item.caption}</p>
              <p className="text-white/50 text-xs mt-1">{item.filename}</p>
              {item.duration && <span className="mt-2 px-3 py-1 bg-black/30 rounded-full text-white/70 text-xs">Duration: {item.duration}</span>}
            </>
          ) : (
            <>
              <HiOutlinePhotograph className="text-white/30 text-6xl mb-3" />
              <p className="text-white font-semibold text-sm">{item.caption}</p>
              <p className="text-white/50 text-xs mt-1">{item.filename}</p>
            </>
          )}
        </div>
        <div className="flex items-center justify-between mt-4">
          <button onClick={() => setIdx((i) => Math.max(0, i - 1))} disabled={idx === 0}
            className="p-2 rounded-xl bg-white/10 text-white disabled:opacity-30 hover:bg-white/20 transition-colors">
            <HiOutlineChevronLeft />
          </button>
          <p className="text-white/60 text-sm">{idx + 1} / {media.length}</p>
          <button onClick={() => setIdx((i) => Math.min(media.length - 1, i + 1))} disabled={idx === media.length - 1}
            className="p-2 rounded-xl bg-white/10 text-white disabled:opacity-30 hover:bg-white/20 transition-colors">
            <HiOutlineChevronRight />
          </button>
        </div>
      </div>
    </motion.div>
  )
}

// ── Promote to Alert modal ──────────────────────────────────────────────────
function AlertModal({ incident, onClose, onSaved }) {
  const [form, setForm] = useState({
    title:    incident.title || '',
    body:     `Incident reported in ${incident.lga || 'Ekiti State'}: ${incident.description?.slice(0, 120) || ''}`,
    lga:      incident.lga || '',
    severity: SEVERITY_ALERT[incident.priority] || 'moderate',
    icon:     'warning-outline',
  })
  const [saving, setSaving] = useState(false)
  const [error,  setError]  = useState('')

  const ICONS = [
    'warning-outline', 'alert-circle-outline', 'flame-outline',
    'water-outline',   'medical-outline',       'shield-outline',
    'car-outline',     'person-outline',
  ]

  const handleSave = async () => {
    if (!form.title.trim() || !form.body.trim()) { setError('Title and message are required'); return }
    setSaving(true); setError('')
    try {
      await api.post('/alerts', form)
      onSaved()
      onClose()
    } catch (err) {
      setError(err.message || 'Failed to create alert')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="font-bold text-gray-900 text-lg">Promote to Public Alert</h2>
            <p className="text-xs text-gray-500 mt-0.5">Citizens will see this in their alerts screen</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl font-bold">×</button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {error && <p className="text-red-500 text-sm bg-red-50 border border-red-200 px-3 py-2 rounded-xl">{error}</p>}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Alert Title <span className="text-red-500">*</span></label>
            <input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Alert Message <span className="text-red-500">*</span></label>
            <textarea value={form.body} onChange={(e) => setForm((p) => ({ ...p, body: e.target.value }))} rows={3}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Severity</label>
              <select value={form.severity} onChange={(e) => setForm((p) => ({ ...p, severity: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white">
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="moderate">Moderate</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">LGA (leave blank for all)</label>
              <input value={form.lga} onChange={(e) => setForm((p) => ({ ...p, lga: e.target.value }))}
                placeholder="e.g. Ado-Ekiti"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Icon</label>
            <div className="flex flex-wrap gap-2">
              {ICONS.map((ic) => (
                <button key={ic} onClick={() => setForm((p) => ({ ...p, icon: ic }))}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono border transition-colors ${form.icon === ic ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
                  {ic}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <button onClick={onClose} className="px-5 py-2.5 border border-gray-200 text-sm font-semibold text-gray-700 rounded-xl hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving}
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-60 flex items-center gap-2">
            <HiOutlineBell /> {saving ? 'Publishing…' : 'Publish Alert'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Resolve modal ────────────────────────────────────────────────────────────
function ResolveModal({ onConfirm, onCancel }) {
  const [report, setReport] = useState('')
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
            <HiOutlineCheckCircle className="text-green-600 text-xl" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">Mark as Resolved?</h3>
            <p className="text-xs text-gray-400 mt-0.5">Confirm this incident has been handled.</p>
          </div>
        </div>
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Resolution Report <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <textarea
            value={report}
            onChange={(e) => setReport(e.target.value)}
            placeholder="Describe how this incident was handled, actions taken, outcome…"
            rows={4}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 resize-none"
          />
        </div>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2.5 border border-gray-200 text-sm font-semibold text-gray-700 rounded-xl hover:bg-gray-50 transition-colors">Cancel</button>
          <button onClick={() => onConfirm(report)} className="flex-1 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 transition-colors">Yes, Resolve</button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ── False Alarm modal ─────────────────────────────────────────────────────────
function FalseAlarmModal({ onConfirm, onCancel }) {
  const [note, setNote] = useState('')
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
            <HiOutlineBan className="text-orange-600 text-xl" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">Mark as False Alarm?</h3>
            <p className="text-xs text-gray-400 mt-0.5">Confirm this incident was not a real emergency.</p>
          </div>
        </div>
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Note <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Explain why this was a false alarm, what was found on the ground…"
            rows={4}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 resize-none"
          />
        </div>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2.5 border border-gray-200 text-sm font-semibold text-gray-700 rounded-xl hover:bg-gray-50 transition-colors">Cancel</button>
          <button onClick={() => onConfirm(note)} className="flex-1 py-2.5 bg-orange-500 text-white text-sm font-semibold rounded-xl hover:bg-orange-600 transition-colors">Yes, False Alarm</button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ── Main page ────────────────────────────────────────────────────────────────
export default function IncidentDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const [incident,      setIncident]      = useState(null)
  const [fieldOfficers, setFieldOfficers] = useState([])
  const [loading,       setLoading]       = useState(true)
  const [assigneeId,      setAssigneeId]      = useState('')
  const [assignPriority,  setAssignPriority]  = useState('medium')
  const [assignError,     setAssignError]     = useState('')
  const [assignLoading,   setAssignLoading]   = useState(false)
  const [lightboxIdx,   setLightboxIdx]   = useState(null)
  const [showResolve,     setShowResolve]     = useState(false)
  const [showFalseAlarm,  setShowFalseAlarm]  = useState(false)
  const [showAlert,       setShowAlert]       = useState(false)
  const [alertSuccess,    setAlertSuccess]    = useState(false)

  useEffect(() => {
    Promise.all([
      api.get(`/incidents/${id}`),
      api.get('/users?permission=view_assigned_incidents&status=active'),
    ])
      .then(([incData, usersData]) => {
        setIncident(incData.incident)
        setAssigneeId(incData.incident?.assignedTo?._id || '')
        setAssignPriority(incData.incident?.priority || 'medium')
        setFieldOfficers(usersData.users || [])
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [id])

  const refreshIncident = () =>
    api.get(`/incidents/${id}`)
      .then((d) => { setIncident(d.incident); setAssigneeId(d.incident?.assignedTo?._id || '') })
      .catch(console.error)

  const handleAssign = async () => {
    if (!assigneeId) { setAssignError('Please select an officer'); return }
    setAssignError('')
    setAssignLoading(true)
    try {
      await api.patch(`/incidents/${id}/assign`, { userId: assigneeId, priority: assignPriority })
      await refreshIncident()
    } catch (err) {
      setAssignError(err.message || 'Assignment failed')
    } finally {
      setAssignLoading(false)
    }
  }

  const handleMarkInProgress = async () => {
    try {
      await api.patch(`/incidents/${id}/status`, { status: 'in_progress' })
      await refreshIncident()
    } catch (err) {
      console.error(err)
    }
  }

  const handleResolve = async (resolutionReport = '') => {
    setShowResolve(false)
    try {
      await api.patch(`/incidents/${id}/status`, { status: 'resolved', resolutionReport })
      await refreshIncident()
    } catch (err) {
      console.error(err)
    }
  }

  const handleFalseAlarm = async (note = '') => {
    setShowFalseAlarm(false)
    try {
      await api.patch(`/incidents/${id}/status`, { status: 'false_alarm', note })
      await refreshIncident()
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto space-y-5 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-32" />
        <div className="h-40 bg-gray-200 rounded-2xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-5">
            <div className="h-32 bg-gray-200 rounded-2xl" />
            <div className="h-48 bg-gray-200 rounded-2xl" />
          </div>
          <div className="h-64 bg-gray-200 rounded-2xl" />
        </div>
      </div>
    )
  }

  if (!incident) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <p className="text-gray-400 text-lg mb-2">Incident not found.</p>
        <Link to="/dashboard/incidents" className="text-green-600 hover:underline text-sm">← Back to incidents</Link>
      </div>
    )
  }

  const statusCfg    = STATUS_CONFIG[incident.status] || STATUS_CONFIG.pending
  const isResolved   = incident.status === 'resolved'
  const isFalseAlarm = incident.status === 'false_alarm'
  const isClosed     = isResolved || isFalseAlarm
  const media        = incident.media || []

  // Casualties
  const killed    = Number(incident.killed    || 0)
  const injured   = Number(incident.injured   || 0)
  const displaced = Number(incident.displaced || 0)
  const hasCasualties = killed > 0 || injured > 0 || displaced > 0

  return (
    <>
      <div className="max-w-5xl mx-auto space-y-5">
        <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors">
          <HiOutlineArrowLeft /> Back to Incidents
        </button>

        {/* ── Header card ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="text-xs text-gray-400 font-mono bg-gray-100 px-2 py-0.5 rounded">{incident.incidentId}</span>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${statusCfg.color}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                  {statusCfg.label}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${PRIORITY_CONFIG[incident.priority] || 'bg-gray-100 text-gray-600'}`}>
                  {incident.priority} priority
                </span>
                <span className="uppercase text-xs font-semibold text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-full">{incident.channel}</span>
                {incident.isOngoing && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-600 animate-pulse">Ongoing</span>
                )}
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 leading-snug">{incident.title}</h1>
              <p className="text-sm text-gray-500 mt-1 flex items-center gap-1.5">
                <HiOutlineLocationMarker className="shrink-0" />
                {[incident.location, incident.lga, incident.lcda].filter(Boolean).join(' · ')}
              </p>
            </div>

            <div className="flex flex-wrap gap-2 shrink-0">
              {/* Promote to Alert */}
              <PermissionGuard permission="update_incident">
                {!alertSuccess ? (
                  <button onClick={() => setShowAlert(true)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm">
                    <HiOutlineBell className="text-lg" /> Promote to Alert
                  </button>
                ) : (
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 text-amber-700 text-sm font-semibold rounded-xl">
                    <HiOutlineBell /> Alert Published
                  </div>
                )}
              </PermissionGuard>

              {/* Mark In Progress */}
              <PermissionGuard permission="update_incident">
                {incident.status === 'pending' && (
                  <button onClick={handleMarkInProgress}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm">
                    <HiOutlineExclamation className="text-lg" /> Mark In Progress
                  </button>
                )}
              </PermissionGuard>

              {/* Mark Resolved */}
              <PermissionGuard permission="update_incident">
                {!isClosed && incident.status === 'in_progress' && (
                  <button onClick={() => setShowResolve(true)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm">
                    <HiOutlineCheckCircle className="text-lg" /> Mark as Resolved
                  </button>
                )}
                {isResolved && (
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 text-green-700 text-sm font-semibold rounded-xl">
                    <HiOutlineCheckCircle className="text-lg" /> Case Resolved
                  </div>
                )}
              </PermissionGuard>

              {/* Mark False Alarm */}
              <PermissionGuard permission="update_incident">
                {!isClosed && (incident.status === 'pending' || incident.status === 'in_progress') && (
                  <button onClick={() => setShowFalseAlarm(true)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm">
                    <HiOutlineBan className="text-lg" /> False Alarm
                  </button>
                )}
                {isFalseAlarm && (
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 border border-orange-200 text-orange-700 text-sm font-semibold rounded-xl">
                    <HiOutlineBan className="text-lg" /> False Alarm
                  </div>
                )}
              </PermissionGuard>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* ── Left column ── */}
          <div className="lg:col-span-2 space-y-5">

            {/* Description */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <HiOutlineInformationCircle className="text-gray-400" /> Description
              </h2>
              <p className="text-sm text-gray-700 leading-relaxed">{incident.description}</p>
            </div>

            {/* Location */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <HiOutlineMap className="text-gray-400" /> Location
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {incident.location && (
                  <div>
                    <p className="text-xs text-gray-400">Specific Location</p>
                    <p className="text-sm font-medium text-gray-800 mt-0.5">{incident.location}</p>
                  </div>
                )}
                {incident.lga && (
                  <div>
                    <p className="text-xs text-gray-400">LGA</p>
                    <p className="text-sm font-medium text-gray-800 mt-0.5">{incident.lga}</p>
                  </div>
                )}
                {incident.lcda && (
                  <div>
                    <p className="text-xs text-gray-400">LCDA</p>
                    <p className="text-sm font-medium text-gray-800 mt-0.5">{incident.lcda}</p>
                  </div>
                )}
                {incident.latitude && incident.longitude && (
                  <div>
                    <p className="text-xs text-gray-400">GPS Coordinates</p>
                    <a
                      href={`https://maps.google.com/?q=${incident.latitude},${incident.longitude}`}
                      target="_blank" rel="noreferrer"
                      className="text-sm font-medium text-green-600 hover:underline mt-0.5 block"
                    >
                      {Number(incident.latitude).toFixed(5)}, {Number(incident.longitude).toFixed(5)} ↗
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Reporter */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <HiOutlineUser className="text-gray-400" /> Reporter Information
              </h2>
              {incident.anonymous ? (
                <p className="text-sm text-gray-500 italic">This report was submitted anonymously.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {incident.reporter && (
                    <div>
                      <p className="text-xs text-gray-400">Name</p>
                      <p className="text-sm font-medium text-gray-800 mt-0.5">{incident.reporter}</p>
                    </div>
                  )}
                  {incident.reporterPhone && (
                    <div>
                      <p className="text-xs text-gray-400">Phone</p>
                      <a href={`tel:${incident.reporterPhone}`} className="text-sm font-medium text-green-600 hover:underline mt-0.5 block">
                        {incident.reporterPhone}
                      </a>
                    </div>
                  )}
                  {incident.reporterEmail && (
                    <div>
                      <p className="text-xs text-gray-400">Email</p>
                      <a href={`mailto:${incident.reporterEmail}`} className="text-sm font-medium text-green-600 hover:underline mt-0.5 block">
                        {incident.reporterEmail}
                      </a>
                    </div>
                  )}
                  {incident.channel && (
                    <div>
                      <p className="text-xs text-gray-400">Reported Via</p>
                      <p className="text-sm font-medium text-gray-800 mt-0.5 uppercase">{incident.channel}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Casualties & Context */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <HiOutlineShieldExclamation className="text-gray-400" /> Casualties &amp; Context
              </h2>
              <div className="grid grid-cols-3 gap-3 mb-4">
                {[
                  { label: 'Killed',    value: killed,    color: 'bg-red-50 text-red-700 border-red-100' },
                  { label: 'Injured',   value: injured,   color: 'bg-orange-50 text-orange-700 border-orange-100' },
                  { label: 'Displaced', value: displaced, color: 'bg-yellow-50 text-yellow-700 border-yellow-100' },
                ].map(({ label, value, color }) => (
                  <div key={label} className={`border rounded-xl p-3 text-center ${color}`}>
                    <p className="text-2xl font-bold">{value}</p>
                    <p className="text-xs font-semibold mt-0.5">{label}</p>
                  </div>
                ))}
              </div>
              {!hasCasualties && <p className="text-sm text-gray-400 italic mb-4">No casualties reported.</p>}

              <div className="space-y-3 border-t border-gray-50 pt-4">
                {incident.peopleInvolved && (
                  <div>
                    <p className="text-xs text-gray-400">People Involved</p>
                    <p className="text-sm text-gray-700 mt-0.5">{incident.peopleInvolved}</p>
                  </div>
                )}
                {incident.injuryDetails && (
                  <div>
                    <p className="text-xs text-gray-400">Injury / Damage Details</p>
                    <p className="text-sm text-gray-700 mt-0.5">{incident.injuryDetails}</p>
                  </div>
                )}
                {incident.authorityContacted !== undefined && incident.authorityContacted !== '' && (
                  <div>
                    <p className="text-xs text-gray-400">Authority Contacted</p>
                    <p className="text-sm font-medium text-gray-800 mt-0.5 capitalize">{incident.authorityContacted}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Media */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-semibold text-gray-900 mb-4">
                Evidence &amp; Media
                {media.length > 0 && (
                  <span className="ml-2 text-xs font-normal text-gray-400">({media.length} file{media.length !== 1 ? 's' : ''})</span>
                )}
              </h2>
              {media.length > 0 ? (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {media.map((item, i) => (
                      <button key={i} onClick={() => setLightboxIdx(i)}
                        className={`relative group aspect-video rounded-xl bg-linear-to-br ${THUMB_PALETTES[i % THUMB_PALETTES.length]} flex flex-col items-center justify-center overflow-hidden hover:ring-2 hover:ring-green-500 hover:ring-offset-2 transition-all`}>
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
                        {item.type === 'video' ? (
                          <>
                            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mb-1.5">
                              <HiOutlineVideoCamera className="text-white text-xl" />
                            </div>
                            {item.duration && (
                              <span className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded font-mono">{item.duration}</span>
                            )}
                          </>
                        ) : (
                          item.url
                            ? <img src={item.url} alt={item.caption} className="absolute inset-0 w-full h-full object-cover" />
                            : <HiOutlinePhotograph className="text-white/40 text-3xl" />
                        )}
                        {item.caption && (
                          <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-2 py-1">
                            <p className="text-white text-xs truncate">{item.caption}</p>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 mt-3 flex items-center gap-1">
                    <HiOutlineExclamation className="text-amber-400" /> Files submitted by the reporter. Click to preview.
                  </p>
                </>
              ) : (
                <div className="flex items-center gap-3 text-gray-400 text-sm">
                  <HiOutlinePhotograph className="text-2xl shrink-0" /> No images or videos were submitted with this report.
                </div>
              )}
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-semibold text-gray-900 mb-5">Activity Timeline</h2>
              <div className="relative">
                <div className="absolute left-2.25 top-0 bottom-0 w-px bg-gray-100" />
                <ul className="space-y-5">
                  {[...(incident.timeline || [])].reverse().map((entry, idx) => {
                    const s = entry.status?.toLowerCase()
                    const dot = s === 'resolved'    ? 'bg-green-100 border-green-500'
                              : s === 'in_progress' ? 'bg-blue-100 border-blue-500'
                              : s === 'pending'     ? 'bg-yellow-100 border-yellow-500'
                              : 'bg-gray-100 border-gray-400'
                    const inner = s === 'resolved'    ? 'bg-green-600'
                                : s === 'in_progress' ? 'bg-blue-600'
                                : s === 'pending'     ? 'bg-yellow-500'
                                : 'bg-gray-400'
                    const badge = STATUS_CONFIG[s]
                    return (
                      <li key={idx} className="relative pl-9">
                        <div className={`absolute left-0 top-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center ${dot}`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${inner}`} />
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mb-0.5">
                          <p className="text-sm font-medium text-gray-800 leading-snug">{entry.action}</p>
                          {badge && (
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${badge.color}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                              {badge.label}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5">
                          {entry.by && (
                            <span className="flex items-center gap-1 text-xs text-gray-500">
                              <HiOutlineUser className="text-gray-400" /> {entry.by}
                            </span>
                          )}
                          <span className="flex items-center gap-1 text-xs text-gray-400">
                            <HiOutlineClock className="text-gray-400" />
                            {new Date(entry.time).toLocaleString('en-NG', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </li>
                    )
                  })}
                  {(!incident.timeline || incident.timeline.length === 0) && (
                    <li className="text-sm text-gray-400 pl-9">No timeline entries.</li>
                  )}
                </ul>
              </div>
            </div>
          </div>

          {/* ── Right column ── */}
          <div className="space-y-5">
            {/* Core details */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4">
              <h2 className="font-semibold text-gray-900">Incident Details</h2>
              <InfoRow icon={HiOutlineInformationCircle} label="Type"          value={incident.type ? incident.type.charAt(0).toUpperCase() + incident.type.slice(1) : null} />
              <InfoRow icon={HiOutlineOfficeBuilding}    label="Assigned Agency" value={incident.agency} />
              <InfoRow icon={HiOutlineUser}              label="Assigned Officer" value={
                incident.assignedTo
                  ? `${incident.assignedTo.name}${incident.assignedTo.agency ? ` — ${incident.assignedTo.agency}` : ''}`
                  : null
              } />
              <InfoRow icon={HiOutlinePhone}             label="Reporter Phone"  value={incident.reporterPhone} />
              <InfoRow icon={HiOutlineMail}              label="Reporter Email"  value={incident.reporterEmail} />
              <InfoRow icon={HiOutlineClock}             label="Date Reported"   value={
                new Date(incident.createdAt).toLocaleString('en-NG', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
              } />
              <InfoRow icon={HiOutlineClock}             label="Last Updated"    value={
                new Date(incident.updatedAt).toLocaleString('en-NG', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
              } />
            </div>

            {/* Assign panel */}
            <PermissionGuard permission="assign_incident">
              {!isClosed && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                  <h2 className="font-semibold text-gray-900 mb-1">
                    {incident.assignedTo ? 'Reassign Officer' : 'Assign Officer'}
                  </h2>
                  <p className="text-xs text-gray-400 mb-4">
                    {incident.assignedTo
                      ? `Currently: ${incident.assignedTo.name}`
                      : 'No officer assigned yet. Select one below.'}
                  </p>
                  <select
                    value={assigneeId}
                    onChange={(e) => { setAssigneeId(e.target.value); setAssignError('') }}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white mb-3"
                  >
                    <option value="">Select field officer…</option>
                    {fieldOfficers.map((u) => (
                      <option key={u._id} value={u._id}>{u.name} — {u.agency}</option>
                    ))}
                  </select>
                  <p className="text-xs font-semibold text-gray-600 mb-1.5">Case Severity</p>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {[
                      { value: 'low',      label: 'Low',      desc: 'Routine response',           color: 'text-gray-600',   ring: 'ring-gray-400',   bg: 'bg-gray-50'   },
                      { value: 'medium',   label: 'Medium',   desc: 'Timely attention needed',    color: 'text-yellow-700', ring: 'ring-yellow-400', bg: 'bg-yellow-50' },
                      { value: 'high',     label: 'High',     desc: 'Quick response required',    color: 'text-orange-700', ring: 'ring-orange-400', bg: 'bg-orange-50' },
                      { value: 'critical', label: 'Critical', desc: 'Immediate action needed',    color: 'text-red-700',    ring: 'ring-red-400',    bg: 'bg-red-50'    },
                    ].map(({ value, label, desc, color, ring, bg }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setAssignPriority(value)}
                        className={`p-2.5 rounded-xl border-2 text-left transition-all duration-150 ${
                          assignPriority === value
                            ? `${bg} border-current ring-1 ${ring} ${color}`
                            : 'bg-white border-gray-100 hover:border-gray-300 text-gray-500'
                        }`}
                      >
                        <p className={`text-xs font-bold ${assignPriority === value ? color : 'text-gray-700'}`}>{label}</p>
                        <p className={`text-[10px] mt-0.5 ${assignPriority === value ? color : 'text-gray-400'}`}>{desc}</p>
                      </button>
                    ))}
                  </div>
                  {assignError && <p className="text-xs text-red-500 mb-2">{assignError}</p>}
                  <button
                    onClick={handleAssign}
                    disabled={assignLoading}
                    className="w-full py-2.5 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 transition-colors disabled:opacity-60"
                  >
                    {assignLoading ? 'Assigning…' : incident.assignedTo ? 'Reassign' : 'Assign Officer'}
                  </button>
                </div>
              )}
            </PermissionGuard>

            {/* Resolved banner */}
            {isResolved && (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-5">
                <div className="text-center mb-3">
                  <HiOutlineCheckCircle className="text-green-600 text-3xl mx-auto mb-2" />
                  <p className="text-sm font-semibold text-green-700">This incident is closed</p>
                  <p className="text-xs text-green-500 mt-1">
                    Resolved on {new Date(incident.updatedAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
                {incident.resolutionReport ? (
                  <div className="border-t border-green-200 pt-3 mt-1">
                    <p className="text-xs font-semibold text-green-700 mb-1">Resolution Report</p>
                    <p className="text-xs text-green-800 leading-relaxed whitespace-pre-wrap">{incident.resolutionReport}</p>
                  </div>
                ) : (
                  <p className="text-center text-xs text-green-400 border-t border-green-200 pt-3 mt-1 italic">No resolution report submitted.</p>
                )}
              </div>
            )}

            {/* False Alarm banner */}
            {isFalseAlarm && (
              <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 text-center">
                <HiOutlineBan className="text-orange-500 text-3xl mx-auto mb-2" />
                <p className="text-sm font-semibold text-orange-700">Marked as False Alarm</p>
                <p className="text-xs text-orange-400 mt-1">
                  Closed on {new Date(incident.updatedAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {lightboxIdx !== null && <Lightbox media={media} startIndex={lightboxIdx} onClose={() => setLightboxIdx(null)} />}
      </AnimatePresence>

      <AnimatePresence>
        {showResolve && <ResolveModal onConfirm={handleResolve} onCancel={() => setShowResolve(false)} />}
      </AnimatePresence>

      <AnimatePresence>
        {showFalseAlarm && <FalseAlarmModal onConfirm={handleFalseAlarm} onCancel={() => setShowFalseAlarm(false)} />}
      </AnimatePresence>

      {showAlert && (
        <AlertModal
          incident={incident}
          onClose={() => setShowAlert(false)}
          onSaved={() => setAlertSuccess(true)}
        />
      )}
    </>
  )
}
