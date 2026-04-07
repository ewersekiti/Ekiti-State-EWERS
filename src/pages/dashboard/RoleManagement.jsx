import { useState, useEffect } from 'react'
import {
  HiOutlineShieldCheck,
  HiOutlinePlusCircle,
  HiOutlineChevronDown,
  HiOutlineChevronUp,
  HiOutlinePencil,
  HiOutlineTrash,
} from 'react-icons/hi'
import api from '../../services/api'
import { usePermission } from '../../hooks/usePermission'

const ALL_PERMISSIONS = [
  { key: 'view_dashboard',          label: 'View Dashboard'          },
  { key: 'view_incidents',          label: 'View All Incidents'       },
  { key: 'view_assigned_incidents', label: 'View Assigned Incidents'  },
  { key: 'create_sms_incident',     label: 'Create SMS Incident'      },
  { key: 'assign_incident',         label: 'Assign Incident'          },
  { key: 'update_incident',         label: 'Update Incident Status'   },
  { key: 'delete_incident',         label: 'Delete Incident'          },
  { key: 'manage_users',            label: 'Manage Users'             },
  { key: 'manage_roles',            label: 'Manage Roles'             },
  { key: 'manage_config',           label: 'Manage System Config'     },
  { key: 'view_reports',            label: 'View Reports'             },
  { key: 'send_alert',              label: 'Alert the Public'         },
]

// ── Permission checkbox list (shared by create + edit modals) ──────────────
function PermissionList({ selected, onChange }) {
  const toggle = (key) =>
    onChange(
      selected.includes(key)
        ? selected.filter((p) => p !== key)
        : [...selected, key]
    )

  return (
    <div className="space-y-2">
      {ALL_PERMISSIONS.map((perm) => {
        const checked = selected.includes(perm.key)
        return (
          <label
            key={perm.key}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border cursor-pointer transition-colors ${
              checked ? 'border-green-300 bg-green-50' : 'border-gray-200 hover:bg-gray-50'
            }`}
          >
            <input
              type="checkbox"
              checked={checked}
              onChange={() => toggle(perm.key)}
              className="accent-green-600"
            />
            <span className="text-sm text-gray-700">{perm.label}</span>
          </label>
        )
      })}
    </div>
  )
}

// ── Role card ──────────────────────────────────────────────────────────────
function RoleCard({ role, expanded, onToggle, onEdit, onDelete, canEdit }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer"
        onClick={onToggle}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && onToggle()}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-green-100 flex items-center justify-center">
            <HiOutlineShieldCheck className="text-green-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">{role.name}</p>
            <p className="text-xs text-gray-500 mt-0.5">{role.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400">{role.permissions.length} permissions</span>
          {canEdit && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); onEdit(role) }}
                className="p-1.5 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 transition-colors"
                title="Edit permissions"
              >
                <HiOutlinePencil className="text-base" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(role) }}
                className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                title="Delete role"
              >
                <HiOutlineTrash className="text-base" />
              </button>
            </>
          )}
          {expanded ? (
            <HiOutlineChevronUp className="text-gray-400" />
          ) : (
            <HiOutlineChevronDown className="text-gray-400" />
          )}
        </div>
      </div>

      {expanded && (
        <div className="px-6 pb-5 border-t border-gray-50">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-4 mb-3">
            Permissions
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {ALL_PERMISSIONS.map((perm) => {
              const granted = role.permissions.includes(perm.key)
              return (
                <div
                  key={perm.key}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm ${
                    granted ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-400'
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      granted ? 'border-green-500 bg-green-500' : 'border-gray-300 bg-white'
                    }`}
                  >
                    {granted && (
                      <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 12 12">
                        <path
                          d="M2 6l3 3 5-5"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </span>
                  {perm.label}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Edit Role modal ────────────────────────────────────────────────────────
function EditRoleModal({ role, onClose, onSave, saving }) {
  const [permissions, setPermissions] = useState(role.permissions || [])
  const [description, setDescription] = useState(role.description || '')

  const handleSave = () => onSave(role._id, { description, permissions })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="font-bold text-gray-900 text-lg">Edit Role</h2>
            <p className="text-xs text-gray-500 mt-0.5">{role.name}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors text-xl font-bold"
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Permissions</p>
            <PermissionList selected={permissions} onChange={setPermissions} />
          </div>
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-5 py-2.5 border border-gray-200 text-sm font-semibold text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 transition-colors disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Create Role modal ──────────────────────────────────────────────────────
function CreateRoleModal({ onClose, onSave, saving }) {
  const [form,  setForm]  = useState({ name: '', description: '', permissions: [] })
  const [error, setError] = useState('')

  const handleSave = () => {
    if (!form.name.trim()) { setError('Role name is required'); return }
    onSave(form)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900 text-lg">Create Role</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors text-xl font-bold">×</button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Role Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => { setForm((p) => ({ ...p, name: e.target.value })); setError('') }}
              placeholder="e.g. Supervisor"
              className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${
                error ? 'border-red-400 bg-red-50' : 'border-gray-200'
              }`}
            />
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              placeholder="Describe what this role can do…"
              rows={2}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Permissions</p>
            <PermissionList
              selected={form.permissions}
              onChange={(perms) => setForm((p) => ({ ...p, permissions: perms }))}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-5 py-2.5 border border-gray-200 text-sm font-semibold text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 transition-colors disabled:opacity-60"
          >
            {saving ? 'Creating…' : 'Create Role'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────
export default function RoleManagement() {
  const { hasPermission } = usePermission()
  const canEdit = hasPermission('manage_roles')

  const [roles,       setRoles]       = useState([])
  const [loading,     setLoading]     = useState(true)
  const [expandedId,  setExpandedId]  = useState(null)
  const [showCreate,  setShowCreate]  = useState(false)
  const [editRole,    setEditRole]    = useState(null)
  const [deleteRole,  setDeleteRole]  = useState(null)  // role pending deletion
  const [deleteError, setDeleteError] = useState('')
  const [deleting,    setDeleting]    = useState(false)
  const [saving,      setSaving]      = useState(false)
  const [apiError,    setApiError]    = useState('')

  useEffect(() => {
    api.get('/roles')
      .then((data) => setRoles(data.roles || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleCreateRole = async (form) => {
    setSaving(true)
    setApiError('')
    try {
      const data = await api.post('/roles', {
        name:        form.name,
        slug:        form.name.toLowerCase().replace(/\s+/g, '_'),
        description: form.description,
        permissions: form.permissions,
      })
      setRoles((prev) => [...prev, data.role])
      setShowCreate(false)
    } catch (err) {
      setApiError(err.message || 'Failed to create role')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteRole = async () => {
    if (!deleteRole) return
    setDeleting(true)
    setDeleteError('')
    try {
      await api.delete(`/roles/${deleteRole._id}`)
      setRoles((prev) => prev.filter((r) => r._id !== deleteRole._id))
      setDeleteRole(null)
    } catch (err) {
      setDeleteError(err.message || 'Failed to delete role')
    } finally {
      setDeleting(false)
    }
  }

  const handleEditRole = async (id, updates) => {
    setSaving(true)
    setApiError('')
    try {
      const data = await api.patch(`/roles/${id}`, updates)
      setRoles((prev) => prev.map((r) => (r._id === id ? data.role : r)))
      setEditRole(null)
    } catch (err) {
      setApiError(err.message || 'Failed to save changes')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Role Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">{roles.length} roles defined</p>
        </div>
        {canEdit && (
          <button
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors"
          >
            <HiOutlinePlusCircle className="text-lg" /> Create Role
          </button>
        )}
      </div>

      {apiError && (
        <div className="px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
          {apiError}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {roles.map((role) => (
            <RoleCard
              key={role._id}
              role={role}
              expanded={expandedId === role._id}
              onToggle={() => setExpandedId(expandedId === role._id ? null : role._id)}
              onEdit={setEditRole}
              onDelete={setDeleteRole}
              canEdit={canEdit}
            />
          ))}
        </div>
      )}

      {showCreate && (
        <CreateRoleModal
          onClose={() => setShowCreate(false)}
          onSave={handleCreateRole}
          saving={saving}
        />
      )}

      {editRole && (
        <EditRoleModal
          role={editRole}
          onClose={() => setEditRole(null)}
          onSave={handleEditRole}
          saving={saving}
        />
      )}

      {deleteRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => { setDeleteRole(null); setDeleteError('') }} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
                <HiOutlineTrash className="text-red-600 text-lg" />
              </div>
              <div>
                <h2 className="font-bold text-gray-900">Delete Role</h2>
                <p className="text-sm text-gray-500 mt-0.5">This cannot be undone.</p>
              </div>
            </div>

            {deleteError ? (
              <div className="px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
                {deleteError}
              </div>
            ) : (
              <p className="text-sm text-gray-700">
                Are you sure you want to delete <span className="font-semibold">{deleteRole.name}</span>?
              </p>
            )}

            <div className="flex justify-end gap-3 pt-1">
              <button
                onClick={() => { setDeleteRole(null); setDeleteError('') }}
                className="px-5 py-2.5 border border-gray-200 text-sm font-semibold text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
              >
                {deleteError ? 'Close' : 'Cancel'}
              </button>
              {!deleteError && (
                <button
                  onClick={handleDeleteRole}
                  disabled={deleting}
                  className="px-5 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-xl hover:bg-red-700 transition-colors disabled:opacity-60"
                >
                  {deleting ? 'Deleting…' : 'Delete Role'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
