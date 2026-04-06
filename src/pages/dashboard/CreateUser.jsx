import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { HiOutlineArrowLeft, HiOutlineCheckCircle, HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi'
import api from '../../services/api'


 const Field = ({ label, required, error, children }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  )
export default function CreateUser() {
  const navigate    = useNavigate()
  const [showPass,   setShowPass]   = useState(false)
  const [submitted,  setSubmitted]  = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [apiError,   setApiError]   = useState('')
  const [roles,      setRoles]      = useState([])
  const [agencies,   setAgencies]   = useState([])
  const [form,  setForm]  = useState({ name: '', email: '', password: '', role: '', agency: '' })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    Promise.all([api.get('/roles'), api.get('/agencies')])
      .then(([r, a]) => {
        setRoles(r.roles || [])
        setAgencies(a.agencies || [])
      })
      .catch(console.error)
  }, [])

  const validate = () => {
    const e = {}
    if (!form.name.trim())                           e.name     = 'Full name is required'
    if (!form.email.trim())                          e.email    = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email))      e.email    = 'Enter a valid email'
    if (!form.password)                              e.password = 'Password is required'
    else if (form.password.length < 6)              e.password = 'Password must be at least 6 characters'
    if (!form.role)                                  e.role     = 'Role is required'
    if (!form.agency)                                e.agency   = 'Agency is required'
    return e
  }

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const e2 = validate()
    if (Object.keys(e2).length > 0) { setErrors(e2); return }

    setSubmitting(true)
    setApiError('')
    try {
      const data = await api.post('/users', form)
      setSubmitted(data.user)
    } catch (err) {
      setApiError(err.message || 'Failed to create user. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const inputClass = (field) =>
    `w-full px-4 py-2.5 bg-white border rounded-xl text-sm text-gray-900 placeholder-gray-400 transition-colors focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 ${
      errors[field] ? 'border-red-400 bg-red-50' : 'border-gray-300'
    }`

 

  if (submitted) {
    return (
      <div className="max-w-xl mx-auto mt-16 text-center">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <HiOutlineCheckCircle className="text-green-600 text-4xl" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">User Created</h2>
        <p className="text-gray-500 text-sm mb-6">
          <span className="font-semibold text-gray-700">{submitted.name}</span> has been added to the system.
        </p>
        <div className="flex justify-center gap-3">
          <button
            onClick={() => { setSubmitted(null); setForm({ name: '', email: '', password: '', role: '', agency: '' }) }}
            className="px-5 py-2.5 border border-gray-200 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors"
          >
            Add Another
          </button>
          <button onClick={() => navigate('/dashboard/users')}
            className="px-5 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 transition-colors">
            View Users
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-5">
        <button onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-2 transition-colors">
          <HiOutlineArrowLeft /> Back
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Create User</h1>
        <p className="text-sm text-gray-500 mt-0.5">Add a new user account to the system</p>
      </div>

      {apiError && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
          {apiError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
        <Field label="Full Name" required error={errors.name}>
          <input type="text" value={form.name} onChange={(e) => handleChange('name', e.target.value)}
            placeholder="e.g. Abiodun Fayemi" className={inputClass('name')} />
        </Field>

        <Field label="Email Address" required error={errors.email}>
          <input type="email" value={form.email} onChange={(e) => handleChange('email', e.target.value)}
            placeholder="user@ekiti.gov.ng" className={inputClass('email')} />
        </Field>

        <Field label="Password" required error={errors.password}>
          <div className="relative">
            <input type={showPass ? 'text' : 'password'} value={form.password}
              onChange={(e) => handleChange('password', e.target.value)}
              placeholder="Minimum 6 characters" className={inputClass('password') + ' pr-11'} />
            <button type="button" onClick={() => setShowPass((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
              {showPass ? <HiOutlineEyeOff className="text-lg" /> : <HiOutlineEye className="text-lg" />}
            </button>
          </div>
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="Role" required error={errors.role}>
            <select value={form.role} onChange={(e) => handleChange('role', e.target.value)} className={inputClass('role')}>
              <option value="">Select role…</option>
              {roles.map((r) => (
                <option key={r._id} value={r.slug}>{r.name}</option>
              ))}
            </select>
          </Field>

          <Field label="Agency" required error={errors.agency}>
            <select value={form.agency} onChange={(e) => handleChange('agency', e.target.value)} className={inputClass('agency')}>
              <option value="">Select agency…</option>
              {agencies.map((a) => (
                <option key={a._id} value={a.name}>{a.name}</option>
              ))}
            </select>
          </Field>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={() => navigate(-1)}
            className="px-6 py-2.5 border border-gray-200 text-sm font-semibold text-gray-700 rounded-xl hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={submitting}
            className="px-6 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 transition-colors disabled:opacity-60">
            {submitting ? 'Creating…' : 'Create User'}
          </button>
        </div>
      </form>
    </div>
  )
}
