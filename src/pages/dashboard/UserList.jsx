import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  HiOutlinePlusCircle, HiOutlineSearch, HiOutlinePencil,
  HiOutlineX, HiOutlineEye, HiOutlineEyeOff,
} from 'react-icons/hi'
import api from '../../services/api'

const STATUS_CONFIG = {
  active:   'bg-green-100 text-green-700',
  inactive: 'bg-gray-100 text-gray-500',
}

// ── Edit User Modal ──────────────────────────────────────────────────────────
function EditUserModal({ user, roles, agencies, onClose, onSaved }) {
  const [form, setForm] = useState({
    name:     user.name     || '',
    email:    user.email    || '',
    role:     user.role     || '',
    agency:   user.agency   || '',
    password: '',
  })
  const [showPass, setShowPass] = useState(false)
  const [saving, setSaving]     = useState(false)
  const [error, setError]       = useState('')

  const handle = (field, val) => setForm((p) => ({ ...p, [field]: val }))

  const handleSave = async () => {
    if (!form.name.trim())  return setError('Name is required')
    if (!form.email.trim()) return setError('Email is required')
    if (!form.role)         return setError('Role is required')
    if (form.password && form.password.length < 6) return setError('Password must be at least 6 characters')

    setSaving(true)
    setError('')
    try {
      const body = {
        name:   form.name,
        email:  form.email,
        role:   form.role,
        agency: form.agency,
      }
      if (form.password) body.password = form.password

      const { user: updated } = await api.patch(`/users/${user._id}`, body)
      onSaved(updated)
    } catch (err) {
      setError(err.message || 'Failed to update user')
    } finally {
      setSaving(false)
    }
  }

  const inputCls = 'w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 placeholder-gray-400 transition-colors focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">Edit User</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition-colors">
            <HiOutlineX className="text-xl" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          {error && (
            <div className="px-4 py-2.5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
            <input value={form.name} onChange={(e) => handle('name', e.target.value)}
              className={inputCls} placeholder="Full name" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
            <input type="email" value={form.email} onChange={(e) => handle('email', e.target.value)}
              className={inputCls} placeholder="Email address" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Role</label>
              <select value={form.role} onChange={(e) => handle('role', e.target.value)} className={inputCls}>
                <option value="">Select role…</option>
                {roles.map((r) => (
                  <option key={r._id} value={r.slug}>{r.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Agency</label>
              <select value={form.agency} onChange={(e) => handle('agency', e.target.value)} className={inputCls}>
                <option value="">Select agency…</option>
                {agencies.map((a) => (
                  <option key={a._id} value={a.name}>{a.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              New Password <span className="text-gray-400 font-normal">(leave blank to keep current)</span>
            </label>
            <div className="relative">
              <input type={showPass ? 'text' : 'password'} value={form.password}
                onChange={(e) => handle('password', e.target.value)}
                className={inputCls + ' pr-11'} placeholder="Minimum 6 characters" />
              <button type="button" onClick={() => setShowPass((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                {showPass ? <HiOutlineEyeOff className="text-lg" /> : <HiOutlineEye className="text-lg" />}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <button onClick={onClose}
            className="px-5 py-2.5 border border-gray-200 text-sm font-semibold text-gray-700 rounded-xl hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving}
            className="px-5 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 transition-colors disabled:opacity-60">
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main component ───────────────────────────────────────────────────────────
export default function UserList() {
  const [users,      setUsers]      = useState([])
  const [roles,      setRoles]      = useState([])
  const [agencies,   setAgencies]   = useState([])
  const [loading,    setLoading]    = useState(true)
  const [search,     setSearch]     = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [toggling,   setToggling]   = useState(null)
  const [editing,    setEditing]    = useState(null)

  useEffect(() => {
    Promise.all([
      api.get('/users'),
      api.get('/roles'),
      api.get('/agencies'),
    ])
      .then(([u, r, a]) => {
        setUsers(u.users || [])
        setRoles(r.roles || [])
        setAgencies(a.agencies || [])
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const filtered = users.filter((u) => {
    const matchSearch = !search ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    const matchRole = roleFilter === 'all' || u.role === roleFilter
    return matchSearch && matchRole
  })

  const toggleStatus = async (id) => {
    setToggling(id)
    try {
      const { user: updated } = await api.patch(`/users/${id}/status`)
      setUsers((prev) => prev.map((u) => u._id === id ? { ...u, status: updated.status } : u))
    } catch (err) {
      alert(err.message || 'Failed to update status')
    } finally {
      setToggling(null)
    }
  }

  const handleSaved = (updated) => {
    setUsers((prev) => prev.map((u) => u._id === updated._id ? { ...u, ...updated } : u))
    setEditing(null)
  }

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      {editing && (
        <EditUserModal
          user={editing}
          roles={roles}
          agencies={agencies}
          onClose={() => setEditing(null)}
          onSaved={handleSaved}
        />
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">{filtered.length} user{filtered.length !== 1 ? 's' : ''}</p>
        </div>
        <Link to="/dashboard/users/create"
          className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors">
          <HiOutlinePlusCircle className="text-lg" /> Create User
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
            <input type="text" placeholder="Search users…" value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" />
          </div>
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 bg-white">
            <option value="all">All Roles</option>
            {roles.map((r) => (
              <option key={r._id} value={r.slug}>{r.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400 text-sm animate-pulse">Loading users…</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-left">
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Agency</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((user) => {
                  const initials = user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
                  return (
                    <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-green-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {initials}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{user.name}</p>
                            <p className="text-xs text-gray-400">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          {user.roleLabel || user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{user.agency || '—'}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${STATUS_CONFIG[user.status]}`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleStatus(user._id)}
                            disabled={toggling === user._id}
                            className="text-xs text-gray-500 hover:text-gray-800 font-medium border border-gray-200 px-2.5 py-1 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                          >
                            {toggling === user._id ? '…' : user.status === 'active' ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            onClick={() => setEditing(user)}
                            className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Edit user"
                          >
                            <HiOutlinePencil />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-6 py-16 text-center text-gray-400 text-sm">No users found.</td>
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
