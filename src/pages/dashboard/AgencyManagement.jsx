import { useState, useEffect } from 'react'
import {
  HiOutlinePlusCircle, HiOutlinePencil, HiOutlineTrash,
  HiOutlineX, HiOutlineOfficeBuilding,
} from 'react-icons/hi'
import api from '../../services/api'
import { usePermission } from '../../hooks/usePermission'

const TYPE_OPTIONS = [
  { value: 'security',   label: 'Security'    },
  { value: 'medical',    label: 'Medical'     },
  { value: 'fire',       label: 'Fire'        },
  { value: 'transport',  label: 'Transport'   },
  { value: 'government', label: 'Government'  },
  { value: 'other',      label: 'Other'       },
]

const TYPE_COLORS = {
  security:   'bg-purple-100 text-purple-700',
  medical:    'bg-pink-100 text-pink-700',
  fire:       'bg-red-100 text-red-700',
  transport:  'bg-yellow-100 text-yellow-700',
  government: 'bg-blue-100 text-blue-700',
  other:      'bg-gray-100 text-gray-600',
}

const EMPTY_FORM = { name: '', code: '', description: '', type: 'other' }

// ── Agency Modal (create + edit) ─────────────────────────────────────────────
function AgencyModal({ agency, onClose, onSaved }) {
  const isEdit = !!agency
  const [form, setForm]   = useState(agency ? {
    name:        agency.name        || '',
    code:        agency.code        || '',
    description: agency.description || '',
    type:        agency.type        || 'other',
  } : { ...EMPTY_FORM })
  const [saving, setSaving] = useState(false)
  const [error,  setError]  = useState('')

  const handle = (field, val) => setForm((p) => ({ ...p, [field]: val }))

  const handleSave = async () => {
    if (!form.name.trim()) return setError('Agency name is required')
    setSaving(true)
    setError('')
    try {
      let result
      if (isEdit) {
        result = await api.patch(`/agencies/${agency._id}`, form)
      } else {
        result = await api.post('/agencies', form)
      }
      onSaved(result.agency, isEdit)
    } catch (err) {
      setError(err.message || 'Failed to save agency')
    } finally {
      setSaving(false)
    }
  }

  const inputCls = 'w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 placeholder-gray-400 transition-colors focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">{isEdit ? 'Edit Agency' : 'Create Agency'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition-colors">
            <HiOutlineX className="text-xl" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {error && (
            <div className="px-4 py-2.5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Agency Name <span className="text-red-500">*</span>
            </label>
            <input value={form.name} onChange={(e) => handle('name', e.target.value)}
              className={inputCls} placeholder="e.g. Nigeria Police Force" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Code</label>
              <input value={form.code} onChange={(e) => handle('code', e.target.value)}
                className={inputCls} placeholder="e.g. NPF" maxLength={10} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Type</label>
              <select value={form.type} onChange={(e) => handle('type', e.target.value)} className={inputCls}>
                {TYPE_OPTIONS.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
            <textarea value={form.description} onChange={(e) => handle('description', e.target.value)}
              rows={3} className={inputCls} placeholder="Brief description (optional)" />
          </div>
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <button onClick={onClose}
            className="px-5 py-2.5 border border-gray-200 text-sm font-semibold text-gray-700 rounded-xl hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving}
            className="px-5 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 transition-colors disabled:opacity-60">
            {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Agency'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Delete confirm modal ─────────────────────────────────────────────────────
function DeleteModal({ agency, onClose, onDeleted }) {
  const [deleting, setDeleting] = useState(false)
  const [error,    setError]    = useState('')

  const handleDelete = async () => {
    setDeleting(true)
    setError('')
    try {
      await api.delete(`/agencies/${agency._id}`)
      onDeleted(agency._id)
    } catch (err) {
      setError(err.message || 'Failed to delete agency')
      setDeleting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center">
        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
          <HiOutlineTrash className="text-red-600 text-xl" />
        </div>
        <h2 className="font-bold text-gray-900 mb-1">Delete Agency</h2>
        <p className="text-sm text-gray-500 mb-4">
          Are you sure you want to delete <span className="font-semibold text-gray-700">{agency.name}</span>? This cannot be undone.
        </p>
        {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
        <div className="flex justify-center gap-3">
          <button onClick={onClose}
            className="px-5 py-2.5 border border-gray-200 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button onClick={handleDelete} disabled={deleting}
            className="px-5 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-xl hover:bg-red-700 transition-colors disabled:opacity-60">
            {deleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main page ────────────────────────────────────────────────────────────────
export default function AgencyManagement() {
  const { hasPermission } = usePermission()
  const canManage = hasPermission('manage_users')

  const [agencies,  setAgencies]  = useState([])
  const [loading,   setLoading]   = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing,   setEditing]   = useState(null)
  const [deleting,  setDeleting]  = useState(null)

  useEffect(() => {
    api.get('/agencies')
      .then((d) => setAgencies(d.agencies || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleSaved = (agency, isEdit) => {
    if (isEdit) {
      setAgencies((prev) => prev.map((a) => a._id === agency._id ? agency : a))
      setEditing(null)
    } else {
      setAgencies((prev) => [agency, ...prev])
      setShowModal(false)
    }
  }

  const handleDeleted = (id) => {
    setAgencies((prev) => prev.filter((a) => a._id !== id))
    setDeleting(null)
  }

  const toggleStatus = async (agency) => {
    try {
      const { agency: updated } = await api.patch(`/agencies/${agency._id}`, {
        status: agency.status === 'active' ? 'inactive' : 'active',
      })
      setAgencies((prev) => prev.map((a) => a._id === updated._id ? updated : a))
    } catch (err) {
      alert(err.message || 'Failed to update status')
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      {showModal && (
        <AgencyModal onClose={() => setShowModal(false)} onSaved={handleSaved} />
      )}
      {editing && (
        <AgencyModal agency={editing} onClose={() => setEditing(null)} onSaved={handleSaved} />
      )}
      {deleting && (
        <DeleteModal agency={deleting} onClose={() => setDeleting(null)} onDeleted={handleDeleted} />
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agency Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {agencies.length} agenc{agencies.length !== 1 ? 'ies' : 'y'} registered
          </p>
        </div>
        {canManage && (
          <button onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors">
            <HiOutlinePlusCircle className="text-lg" /> Add Agency
          </button>
        )}
      </div>

      {loading ? (
        <div className="p-8 text-center text-gray-400 text-sm animate-pulse">Loading agencies…</div>
      ) : agencies.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center">
          <HiOutlineOfficeBuilding className="text-4xl text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">No agencies yet.</p>
          {canManage && (
            <button onClick={() => setShowModal(true)}
              className="mt-4 px-5 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 transition-colors">
              Add First Agency
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {agencies.map((agency) => (
            <div key={agency._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                    <HiOutlineOfficeBuilding className="text-green-600 text-lg" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{agency.name}</p>
                    {agency.code && (
                      <p className="text-xs text-gray-400 font-mono mt-0.5">{agency.code}</p>
                    )}
                  </div>
                </div>

                {canManage && (
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button onClick={() => setEditing(agency)}
                      className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Edit">
                      <HiOutlinePencil />
                    </button>
                    <button onClick={() => setDeleting(agency)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete">
                      <HiOutlineTrash />
                    </button>
                  </div>
                )}
              </div>

              {agency.description && (
                <p className="text-sm text-gray-500 mt-3 leading-relaxed">{agency.description}</p>
              )}

              <div className="flex items-center gap-2 mt-4">
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${TYPE_COLORS[agency.type] || TYPE_COLORS.other}`}>
                  {agency.type}
                </span>
                {canManage ? (
                  <button
                    onClick={() => toggleStatus(agency)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize transition-colors cursor-pointer ${
                      agency.status === 'active'
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    {agency.status}
                  </button>
                ) : (
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${
                    agency.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {agency.status}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
