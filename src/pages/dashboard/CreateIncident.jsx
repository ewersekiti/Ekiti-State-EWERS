import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { HiOutlineArrowLeft, HiOutlineCheckCircle } from 'react-icons/hi'
import { AGENCIES } from '../../data/mockData'
import api from '../../services/api'

const INCIDENT_TYPES = [
  'Armed Robbery', 'Building Collapse', 'Road Traffic Accident',
  'Flooding', 'Fire Outbreak', 'Gas Explosion', 'Missing Person',
  'Medical Emergency', 'Civil Unrest', 'Other',
]

const PRIORITIES = ['low', 'medium', 'high', 'critical']

const CHANNELS = ['web', 'app', 'sms', 'phone']

const EKITI_LGAS = [
  'Ado-Ekiti', 'Ikere-Ekiti', 'Oye-Ekiti', 'Ikole-Ekiti', 'Ijero-Ekiti',
  'Efon-Alaaye', 'Emure-Ekiti', 'Ilejemeje', 'Irepodun/Ifelodun', 'Ise-Orun',
  'Moba', 'Gbonyin', 'Ekiti East', 'Ekiti West', 'Ekiti South West', 'Ido-Osi',
]

export default function CreateIncident() {
  const navigate = useNavigate()
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({
    title: '',
    type: '',
    description: '',
    location: '',
    lga: '',
    priority: 'medium',
    channel: 'web',
    agency: '',
    reporterPhone: '',
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const validate = () => {
    const e = {}
    if (!form.title.trim()) e.title = 'Title is required'
    if (!form.type) e.type = 'Incident type is required'
    if (!form.description.trim()) e.description = 'Description is required'
    if (!form.lga) e.lga = 'LGA is required'
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
    setLoading(true)
    try {
      await api.post('/incidents', form)
      setSubmitted(true)
    } catch (err) {
      setErrors({ submit: err?.message || 'Failed to submit incident. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="max-w-xl mx-auto mt-16 text-center">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <HiOutlineCheckCircle className="text-green-600 text-4xl" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Incident Submitted</h2>
        <p className="text-gray-500 text-sm mb-6">
          The incident has been created and will be assigned shortly.
        </p>
        <div className="flex justify-center gap-3">
          <button
            onClick={() => { setSubmitted(false); setForm({ title: '', type: '', description: '', location: '', lga: '', priority: 'medium', channel: 'web', agency: '', reporterPhone: '' }) }}
            className="px-5 py-2.5 border border-gray-200 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors"
          >
            New Incident
          </button>
          <button
            onClick={() => navigate('/dashboard/incidents')}
            className="px-5 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 transition-colors"
          >
            View Incidents
          </button>
        </div>
      </div>
    )
  }

  const Field = ({ label, required, error, children }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  )

  const inputClass = (field) =>
    `w-full px-4 py-2.5 bg-white border rounded-xl text-sm text-gray-900 placeholder-gray-400 transition-colors focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 ${
      errors[field] ? 'border-red-400 bg-red-50' : 'border-gray-300'
    }`

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-5">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-2 transition-colors"
        >
          <HiOutlineArrowLeft /> Back
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Create Incident</h1>
        <p className="text-sm text-gray-500 mt-0.5">Fill in the details to log a new incident</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
          <h2 className="font-semibold text-gray-900 text-base border-b border-gray-100 pb-3">Incident Information</h2>

          <Field label="Title" required error={errors.title}>
            <input
              type="text"
              value={form.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="Brief title describing the incident"
              className={inputClass('title')}
            />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field label="Incident Type" required error={errors.type}>
              <select
                value={form.type}
                onChange={(e) => handleChange('type', e.target.value)}
                className={inputClass('type')}
              >
                <option value="">Select type...</option>
                {INCIDENT_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </Field>

            <Field label="Priority">
              <select
                value={form.priority}
                onChange={(e) => handleChange('priority', e.target.value)}
                className={inputClass('priority')}
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p} className="capitalize">{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Description" required error={errors.description}>
            <textarea
              value={form.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Describe what happened in detail..."
              rows={4}
              className={inputClass('description')}
            />
          </Field>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
          <h2 className="font-semibold text-gray-900 text-base border-b border-gray-100 pb-3">Location & Contact</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field label="LGA" required error={errors.lga}>
              <select
                value={form.lga}
                onChange={(e) => handleChange('lga', e.target.value)}
                className={inputClass('lga')}
              >
                <option value="">Select LGA...</option>
                {EKITI_LGAS.map((l) => <option key={l}>{l}</option>)}
              </select>
            </Field>

            <Field label="Specific Location">
              <input
                type="text"
                value={form.location}
                onChange={(e) => handleChange('location', e.target.value)}
                placeholder="Street / landmark"
                className={inputClass('location')}
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field label="Reporting Channel">
              <select
                value={form.channel}
                onChange={(e) => handleChange('channel', e.target.value)}
                className={inputClass('channel')}
              >
                {CHANNELS.map((c) => (
                  <option key={c} value={c}>{c.toUpperCase()}</option>
                ))}
              </select>
            </Field>

            <Field label="Reporter Phone">
              <input
                type="tel"
                value={form.reporterPhone}
                onChange={(e) => handleChange('reporterPhone', e.target.value)}
                placeholder="+234..."
                className={inputClass('reporterPhone')}
              />
            </Field>
          </div>

          <Field label="Responding Agency">
            <select
              value={form.agency}
              onChange={(e) => handleChange('agency', e.target.value)}
              className={inputClass('agency')}
            >
              <option value="">Select agency...</option>
              {AGENCIES.map((a) => <option key={a}>{a}</option>)}
            </select>
          </Field>
        </div>

        {errors.submit && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{errors.submit}</p>
        )}

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-2.5 border border-gray-200 text-sm font-semibold text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Submitting…' : 'Submit Incident'}
          </button>
        </div>
      </form>
    </div>
  )
}
