import { useState, useRef } from 'react'
import {
  HiOutlineChatAlt,
  HiOutlineCheckCircle,
  HiOutlinePhone,
  HiOutlinePhotograph,
  HiOutlineX,
  HiOutlineVideoCamera,
} from 'react-icons/hi'
import api from '../../services/api'

const EKITI_LGAS = [
  'Ado-Ekiti', 'Ikere-Ekiti', 'Oye-Ekiti', 'Ikole-Ekiti', 'Ijero-Ekiti',
  'Efon-Alaaye', 'Emure-Ekiti', 'Ilejemeje', 'Irepodun/Ifelodun', 'Ise-Orun',
  'Moba', 'Gbonyin', 'Ekiti East', 'Ekiti West', 'Ekiti South West', 'Ido-Osi',
]

const CHANNELS = [
  { value: 'sms',      label: 'SMS' },
  { value: 'call',     label: 'Phone Call' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'email',    label: 'Email' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'twitter',  label: 'Twitter / X' },
  { value: 'walk_in',  label: 'Walk-in' },
  { value: 'other',    label: 'Other' },
]

const channelLabel = (value) => CHANNELS.find((c) => c.value === value)?.label || value

export default function SMSIntake() {
  const [form, setForm] = useState({ channel: 'sms', reporterName: '', reporterPhone: '', message: '', lga: '', location: '' })
  const [mediaFiles, setMediaFiles] = useState([])   // [{ file, preview, mediaType }]
  const [errors,     setErrors]     = useState({})
  const [submitted,  setSubmitted]  = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [apiError,   setApiError]   = useState('')
  const fileInputRef = useRef()

  const validate = () => {
    const e = {}
    if (!form.reporterPhone.trim()) e.reporterPhone = 'Reporter phone number is required'
    else if (!/^[\+\d\s-]{10,15}$/.test(form.reporterPhone)) e.reporterPhone = 'Enter a valid phone number'
    if (!form.message.trim()) e.message = 'Message content is required'
    if (!form.lga) e.lga = 'LGA is required'
    return e
  }

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const handleFileSelect = (e) => {
    const selected = Array.from(e.target.files)
    const added = selected.map((file) => ({
      file,
      mediaType: file.type.startsWith('video/') ? 'video' : 'image',
      preview:   file.type.startsWith('video/') ? null : URL.createObjectURL(file),
    }))
    setMediaFiles((prev) => [...prev, ...added])
    e.target.value = ''
  }

  const removeFile = (idx) => {
    setMediaFiles((prev) => {
      const updated = [...prev]
      if (updated[idx].preview) URL.revokeObjectURL(updated[idx].preview)
      updated.splice(idx, 1)
      return updated
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const e2 = validate()
    if (Object.keys(e2).length > 0) { setErrors(e2); return }

    setSubmitting(true)
    setApiError('')
    try {
      const label = channelLabel(form.channel)
      let body

      if (mediaFiles.length > 0) {
        body = new FormData()
        body.append('channel',       form.channel)
        body.append('type',          'other')
        body.append('title',         `${label} Report – ${form.lga}`)
        body.append('description',   form.message)
        body.append('lga',           form.lga)
        body.append('location',      form.location || form.lga)
        body.append('reporterPhone', form.reporterPhone)
        if (form.reporterName.trim()) body.append('reporter', form.reporterName.trim())
        mediaFiles.forEach(({ file, mediaType }) => {
          body.append(mediaType === 'video' ? 'videos' : 'images', file)
        })
      } else {
        body = {
          channel:       form.channel,
          type:          'other',
          title:         `${label} Report – ${form.lga}`,
          description:   form.message,
          lga:           form.lga,
          location:      form.location || form.lga,
          reporterPhone: form.reporterPhone,
          reporter:      form.reporterName.trim() || undefined,
        }
      }

      const data = await api.post('/incidents', body)
      setSubmitted(data.incident)
    } catch (err) {
      setApiError(err.message || 'Submission failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = () => {
    mediaFiles.forEach(({ preview }) => preview && URL.revokeObjectURL(preview))
    setForm({ channel: 'sms', reporterName: '', reporterPhone: '', message: '', lga: '', location: '' })
    setMediaFiles([])
    setErrors({})
    setSubmitted(null)
    setApiError('')
  }

  const inputClass = (field) =>
    `w-full px-4 py-2.5 bg-white border rounded-xl text-sm text-gray-900 placeholder-gray-400 transition-colors focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 ${
      errors[field] ? 'border-red-400 bg-red-50' : 'border-gray-300'
    }`

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto mt-16 text-center">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <HiOutlineCheckCircle className="text-green-600 text-4xl" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Incident Logged</h2>
        <p className="text-gray-500 text-sm mb-1">
          {channelLabel(form.channel)} report from{' '}
          <span className="font-semibold text-gray-700">{form.reporterPhone}</span> has been recorded.
        </p>
        <p className="text-gray-400 text-xs mb-1">
          Incident ID: <span className="font-mono font-semibold">{submitted.incidentId}</span>
        </p>
        <p className="text-gray-400 text-xs mb-6">A dispatcher will review and assign this incident shortly.</p>
        <button onClick={handleReset}
          className="px-6 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 transition-colors">
          Log Another
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
            {form.channel === 'call'
              ? <HiOutlinePhone className="text-green-600 text-xl" />
              : <HiOutlineChatAlt className="text-green-600 text-xl" />}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Intake Form</h1>
            <p className="text-sm text-gray-500">Log incidents received via SMS, call, WhatsApp, or other channels</p>
          </div>
        </div>
      </div>

      {apiError && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
          {apiError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">

        {/* Channel */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Channel <span className="text-red-500">*</span>
          </label>
          <select value={form.channel} onChange={(e) => handleChange('channel', e.target.value)} className={inputClass('channel')}>
            {CHANNELS.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>

        {/* Reporter Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Reporter Name <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <input type="text" value={form.reporterName}
            onChange={(e) => handleChange('reporterName', e.target.value)}
            placeholder="Full name of the person who reported this"
            className={inputClass('reporterName')} />
          <p className="text-xs text-gray-400 mt-1">The person who sent the message or made the call</p>
        </div>

        {/* Reporter Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Reporter Phone Number <span className="text-red-500">*</span>
          </label>
          <input type="tel" value={form.reporterPhone}
            onChange={(e) => handleChange('reporterPhone', e.target.value)}
            placeholder="+234 800 000 0000" className={inputClass('reporterPhone')} />
          {errors.reporterPhone && <p className="text-red-500 text-xs mt-1">{errors.reporterPhone}</p>}
          <p className="text-xs text-gray-400 mt-1">
            {form.channel === 'call' ? 'The number the caller rang from' : `The phone number used to send the ${channelLabel(form.channel)} message`}
          </p>
        </div>

        {/* Message */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            {form.channel === 'call' ? 'Call Summary' : `${channelLabel(form.channel)} Message Content`}{' '}
            <span className="text-red-500">*</span>
          </label>
          <textarea value={form.message} onChange={(e) => handleChange('message', e.target.value)}
            placeholder={
              form.channel === 'call'
                ? 'Summarise what the caller reported…'
                : `Paste or type the ${channelLabel(form.channel)} message received…`
            }
            rows={5} className={inputClass('message')} />
          {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message}</p>}
          <p className="text-xs text-gray-400 mt-1">{form.message.length} characters</p>
        </div>

        {/* LGA */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            LGA (Location) <span className="text-red-500">*</span>
          </label>
          <select value={form.lga} onChange={(e) => handleChange('lga', e.target.value)} className={inputClass('lga')}>
            <option value="">Select LGA…</option>
            {EKITI_LGAS.map((l) => <option key={l}>{l}</option>)}
          </select>
          {errors.lga && <p className="text-red-500 text-xs mt-1">{errors.lga}</p>}
        </div>

        {/* Specific Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Specific Location <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <input type="text" value={form.location} onChange={(e) => handleChange('location', e.target.value)}
            placeholder="Street name, landmark, or area" className={inputClass('location')} />
        </div>

        {/* Media Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Photos / Videos <span className="text-gray-400 font-normal">(optional)</span>
          </label>

          {/* File previews */}
          {mediaFiles.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {mediaFiles.map(({ preview, mediaType, file }, idx) => (
                <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center">
                  {mediaType === 'image' && preview
                    ? <img src={preview} alt="" className="w-full h-full object-cover" />
                    : (
                      <div className="flex flex-col items-center gap-1 text-gray-400">
                        <HiOutlineVideoCamera className="text-2xl" />
                        <span className="text-[10px] leading-tight text-center px-1 truncate w-full">{file.name}</span>
                      </div>
                    )
                  }
                  <button type="button" onClick={() => removeFile(idx)}
                    className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600">
                    <HiOutlineX className="text-xs" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            multiple
            className="hidden"
            onChange={handleFileSelect}
          />
          <button type="button" onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2.5 border border-dashed border-gray-300 rounded-xl text-sm text-gray-500 hover:border-green-400 hover:text-green-600 hover:bg-green-50 transition-colors w-full justify-center">
            <HiOutlinePhotograph className="text-lg" />
            {mediaFiles.length > 0 ? 'Add more photos or videos' : 'Attach photos or videos'}
          </button>
          <p className="text-xs text-gray-400 mt-1">Supports images and videos. You can attach multiple files.</p>
        </div>

        <div className="pt-2 flex justify-end">
          <button type="submit" disabled={submitting}
            className="px-8 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 transition-colors disabled:opacity-60">
            {submitting ? 'Submitting…' : 'Submit Incident'}
          </button>
        </div>
      </form>
    </div>
  )
}
