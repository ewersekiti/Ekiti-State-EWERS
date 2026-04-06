import { useState } from 'react'
import { HiOutlineUser, HiOutlineLockClosed, HiOutlineEye, HiOutlineEyeOff, HiOutlineCheckCircle } from 'react-icons/hi'
import { useAuthStore } from '../../store/authStore'
import api from '../../services/api'

export default function Profile() {
  const { user } = useAuthStore()

  const [form,      setForm]      = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [showCur,   setShowCur]   = useState(false)
  const [showNew,   setShowNew]   = useState(false)
  const [showConf,  setShowConf]  = useState(false)
  const [saving,    setSaving]    = useState(false)
  const [success,   setSuccess]   = useState(false)
  const [errors,    setErrors]    = useState({})
  const [apiError,  setApiError]  = useState('')

  const validate = () => {
    const e = {}
    if (!form.currentPassword)         e.currentPassword = 'Current password is required'
    if (!form.newPassword)             e.newPassword     = 'New password is required'
    else if (form.newPassword.length < 6) e.newPassword  = 'Must be at least 6 characters'
    if (!form.confirmPassword)         e.confirmPassword = 'Please confirm your new password'
    else if (form.newPassword !== form.confirmPassword) e.confirmPassword = 'Passwords do not match'
    return e
  }

  const handleChange = (field, value) => {
    setForm((p) => ({ ...p, [field]: value }))
    setErrors((p) => ({ ...p, [field]: undefined }))
    setApiError('')
    setSuccess(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const e2 = validate()
    if (Object.keys(e2).length) { setErrors(e2); return }

    setSaving(true)
    setApiError('')
    try {
      await api.patch('/auth/password', {
        currentPassword: form.currentPassword,
        newPassword:     form.newPassword,
      })
      setSuccess(true)
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) {
      setApiError(err.message || 'Failed to change password')
    } finally {
      setSaving(false)
    }
  }

  const inputClass = (field) =>
    `w-full px-4 py-2.5 bg-white border rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-colors ${
      errors[field] ? 'border-red-400 bg-red-50' : 'border-gray-200'
    }`

  const initials = user?.name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-sm text-gray-500 mt-0.5">View your account details and change your password</p>
      </div>

      {/* ── Account info card ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-green-600 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
            {initials}
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">{user?.name}</h2>
            <p className="text-sm text-gray-500">{user?.roleLabel || user?.role}</p>
            {user?.agency && <p className="text-xs text-gray-400 mt-0.5">{user.agency}</p>}
          </div>
        </div>

        <div className="flex items-center gap-3 mb-4">
          <HiOutlineUser className="text-gray-400" />
          <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide text-xs">Account Details</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: 'Full Name', value: user?.name     },
            { label: 'Email',     value: user?.email    },
            { label: 'Role',      value: user?.roleLabel || user?.role },
            { label: 'Agency',    value: user?.agency || '—' },
            { label: 'Status',    value: user?.status === 'active' ? 'Active' : 'Inactive' },
          ].map(({ label, value }) => (
            <div key={label} className="bg-gray-50 rounded-xl px-4 py-3">
              <p className="text-xs font-semibold text-gray-400 mb-0.5">{label}</p>
              <p className="text-sm font-semibold text-gray-900">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Change password card ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl bg-green-100 flex items-center justify-center">
            <HiOutlineLockClosed className="text-green-600" />
          </div>
          <div>
            <h2 className="font-bold text-gray-900">Change Password</h2>
            <p className="text-xs text-gray-500">Choose a strong password of at least 6 characters</p>
          </div>
        </div>

        {success && (
          <div className="flex items-center gap-2 px-4 py-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl mb-5">
            <HiOutlineCheckCircle className="text-lg flex-shrink-0" />
            Password changed successfully.
          </div>
        )}

        {apiError && (
          <div className="px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl mb-5">
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Current password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Current Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showCur ? 'text' : 'password'}
                value={form.currentPassword}
                onChange={(e) => handleChange('currentPassword', e.target.value)}
                placeholder="Enter your current password"
                className={inputClass('currentPassword')}
              />
              <button type="button" onClick={() => setShowCur((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showCur ? <HiOutlineEyeOff /> : <HiOutlineEye />}
              </button>
            </div>
            {errors.currentPassword && <p className="text-red-500 text-xs mt-1">{errors.currentPassword}</p>}
          </div>

          {/* New password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              New Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                value={form.newPassword}
                onChange={(e) => handleChange('newPassword', e.target.value)}
                placeholder="At least 6 characters"
                className={inputClass('newPassword')}
              />
              <button type="button" onClick={() => setShowNew((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showNew ? <HiOutlineEyeOff /> : <HiOutlineEye />}
              </button>
            </div>
            {errors.newPassword && <p className="text-red-500 text-xs mt-1">{errors.newPassword}</p>}
          </div>

          {/* Confirm password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Confirm New Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showConf ? 'text' : 'password'}
                value={form.confirmPassword}
                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                placeholder="Repeat your new password"
                className={inputClass('confirmPassword')}
              />
              <button type="button" onClick={() => setShowConf((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showConf ? <HiOutlineEyeOff /> : <HiOutlineEye />}
              </button>
            </div>
            {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
          </div>

          <div className="pt-1 flex justify-end">
            <button type="submit" disabled={saving}
              className="px-6 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 transition-colors disabled:opacity-60">
              {saving ? 'Saving…' : 'Change Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
