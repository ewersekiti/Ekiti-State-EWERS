import { useState, useEffect, useRef } from 'react'
import {
  HiOutlineQuestionMarkCircle, HiOutlineTag, HiOutlineLocationMarker,
  HiOutlineOfficeBuilding, HiOutlinePlusCircle, HiOutlinePencil,
  HiOutlineTrash, HiOutlineX, HiOutlinePhotograph, HiOutlineCheck,
} from 'react-icons/hi'
import api from '../../services/api'
import { usePermission } from '../../hooks/usePermission'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const TABS = [
  { key: 'faqs',     label: 'FAQs',            icon: HiOutlineQuestionMarkCircle },
  { key: 'types',    label: 'Incident Types',   icon: HiOutlineTag               },
  { key: 'locations',label: 'LGA & LCDA',       icon: HiOutlineLocationMarker    },
  { key: 'partners', label: 'Partner Agencies', icon: HiOutlineOfficeBuilding    },
]

const FAQ_CATEGORIES = ['General', 'Participation', 'Reporting', 'SMS', 'Response', 'Other']
const CATEGORY_COLORS = {
  General: 'bg-blue-100 text-blue-700', Participation: 'bg-purple-100 text-purple-700',
  Reporting: 'bg-green-100 text-green-700', SMS: 'bg-orange-100 text-orange-700',
  Response: 'bg-red-100 text-red-700', Other: 'bg-gray-100 text-gray-600',
}

// ── Shared delete-confirm modal ────────────────────────────────────────────
function DeleteModal({ label, name, onConfirm, onCancel, loading, error }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
            <HiOutlineTrash className="text-red-600 text-lg" />
          </div>
          <div>
            <h2 className="font-bold text-gray-900">Delete {label}</h2>
            <p className="text-sm text-gray-500">This cannot be undone.</p>
          </div>
        </div>
        {error
          ? <p className="text-sm text-red-600 bg-red-50 border border-red-200 px-4 py-3 rounded-xl">{error}</p>
          : <p className="text-sm text-gray-700">Are you sure you want to delete <span className="font-semibold">"{name}"</span>?</p>
        }
        <div className="flex justify-end gap-3 pt-1">
          <button onClick={onCancel} className="px-4 py-2 border border-gray-200 text-sm font-semibold text-gray-700 rounded-xl hover:bg-gray-50">{error ? 'Close' : 'Cancel'}</button>
          {!error && (
            <button onClick={onConfirm} disabled={loading} className="px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-xl hover:bg-red-700 disabled:opacity-60">
              {loading ? 'Deleting…' : 'Delete'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// ── TAB 1: FAQs ────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════
function FaqModal({ faq, onClose, onSave, saving }) {
  const [form, setForm] = useState({
    question: faq?.question || '',
    answer:   faq?.answer   || '',
    category: faq?.category || 'General',
    order:    faq?.order    ?? 0,
    active:   faq?.active   ?? true,
  })
  const [error, setError] = useState('')
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }))

  const handleSave = () => {
    if (!form.question.trim()) { setError('Question is required'); return }
    if (!form.answer.trim())   { setError('Answer is required');   return }
    onSave(form)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900 text-lg">{faq ? 'Edit FAQ' : 'Add FAQ'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl font-bold"><HiOutlineX /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 px-4 py-2 rounded-xl">{error}</p>}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Question <span className="text-red-500">*</span></label>
            <input value={form.question} onChange={(e) => { set('question', e.target.value); setError('') }}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter the question…" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Answer <span className="text-red-500">*</span></label>
            <textarea value={form.answer} onChange={(e) => { set('answer', e.target.value); setError('') }} rows={5}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-y"
              placeholder="Enter the answer…" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
              <select value={form.category} onChange={(e) => set('category', e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white">
                {FAQ_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Display Order</label>
              <input type="number" value={form.order} onChange={(e) => set('order', Number(e.target.value))} min={0}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
          </div>
          {faq && (
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.active} onChange={(e) => set('active', e.target.checked)} className="accent-green-600" />
              <span className="text-sm text-gray-700">Active (visible on public site)</span>
            </label>
          )}
        </div>
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <button onClick={onClose} className="px-5 py-2.5 border border-gray-200 text-sm font-semibold text-gray-700 rounded-xl hover:bg-gray-50">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="px-5 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 disabled:opacity-60">
            {saving ? 'Saving…' : faq ? 'Save Changes' : 'Add FAQ'}
          </button>
        </div>
      </div>
    </div>
  )
}

function FaqsTab({ canEdit }) {
  const [faqs,      setFaqs]      = useState([])
  const [loading,   setLoading]   = useState(true)
  const [modal,     setModal]     = useState(null)   // null | 'create' | faq-obj
  const [delTarget, setDelTarget] = useState(null)
  const [saving,    setSaving]    = useState(false)
  const [deleting,  setDeleting]  = useState(false)
  const [delError,  setDelError]  = useState('')

  useEffect(() => {
    api.get('/config/faqs').then((d) => setFaqs(d.faqs || [])).catch(console.error).finally(() => setLoading(false))
  }, [])

  const handleSave = async (form) => {
    setSaving(true)
    try {
      if (modal && modal !== 'create') {
        const d = await api.patch(`/config/faqs/${modal._id}`, form)
        setFaqs((p) => p.map((f) => f._id === modal._id ? d.faq : f))
      } else {
        const d = await api.post('/config/faqs', form)
        setFaqs((p) => [...p, d.faq])
      }
      setModal(null)
    } catch (err) { alert(err.message) } finally { setSaving(false) }
  }

  const handleDelete = async () => {
    setDeleting(true); setDelError('')
    try {
      await api.delete(`/config/faqs/${delTarget._id}`)
      setFaqs((p) => p.filter((f) => f._id !== delTarget._id))
      setDelTarget(null)
    } catch (err) { setDelError(err.message) } finally { setDeleting(false) }
  }

  if (loading) return <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-14 bg-gray-100 rounded-2xl animate-pulse" />)}</div>

  return (
    <div className="space-y-4">
      {canEdit && (
        <div className="flex justify-end">
          <button onClick={() => setModal('create')} className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors">
            <HiOutlinePlusCircle className="text-lg" /> Add FAQ
          </button>
        </div>
      )}
      {faqs.length === 0
        ? <p className="text-center text-gray-400 py-12 text-sm">No FAQs yet. Add one above.</p>
        : faqs.map((faq) => (
          <div key={faq._id} className={`bg-white rounded-2xl border p-5 ${faq.active ? 'border-gray-100' : 'border-gray-200 opacity-60'}`}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${CATEGORY_COLORS[faq.category] || 'bg-gray-100 text-gray-600'}`}>{faq.category}</span>
                  {!faq.active && <span className="text-xs text-gray-400 font-medium">(hidden)</span>}
                </div>
                <p className="font-semibold text-gray-900 text-sm">{faq.question}</p>
                <p className="text-gray-500 text-xs mt-1 line-clamp-2 whitespace-pre-line">{faq.answer}</p>
              </div>
              {canEdit && (
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => setModal(faq)} className="p-1.5 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 transition-colors"><HiOutlinePencil /></button>
                  <button onClick={() => { setDelTarget(faq); setDelError('') }} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"><HiOutlineTrash /></button>
                </div>
              )}
            </div>
          </div>
        ))
      }
      {modal && <FaqModal faq={modal === 'create' ? null : modal} onClose={() => setModal(null)} onSave={handleSave} saving={saving} />}
      {delTarget && <DeleteModal label="FAQ" name={delTarget.question} onConfirm={handleDelete} onCancel={() => { setDelTarget(null); setDelError('') }} loading={deleting} error={delError} />}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// ── TAB 2: Incident Types ──────────────────────────────────
// ═══════════════════════════════════════════════════════════
function TypeModal({ type, onClose, onSave, saving }) {
  const [form, setForm] = useState({ name: type?.name || '', icon: type?.icon || '', order: type?.order ?? 0, active: type?.active ?? true })
  const [error, setError] = useState('')
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900 text-lg">{type ? 'Edit Incident Type' : 'Add Incident Type'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl font-bold"><HiOutlineX /></button>
        </div>
        <div className="px-6 py-5 space-y-4">
          {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 px-4 py-2 rounded-xl">{error}</p>}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Type Name <span className="text-red-500">*</span></label>
            <input value={form.name} onChange={(e) => { set('name', e.target.value); setError('') }}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="e.g. Building Collapse" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Icon Name <span className="text-xs text-gray-400">(Ionicons name, optional)</span></label>
            <input value={form.icon} onChange={(e) => set('icon', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="e.g. flame, shield, car…" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Display Order</label>
            <input type="number" value={form.order} onChange={(e) => set('order', Number(e.target.value))} min={0}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          {type && (
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.active} onChange={(e) => set('active', e.target.checked)} className="accent-green-600" />
              <span className="text-sm text-gray-700">Active (available for reporting)</span>
            </label>
          )}
        </div>
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <button onClick={onClose} className="px-5 py-2.5 border border-gray-200 text-sm font-semibold text-gray-700 rounded-xl hover:bg-gray-50">Cancel</button>
          <button onClick={() => { if (!form.name.trim()) { setError('Name is required'); return } onSave(form) }} disabled={saving}
            className="px-5 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 disabled:opacity-60">
            {saving ? 'Saving…' : type ? 'Save Changes' : 'Add Type'}
          </button>
        </div>
      </div>
    </div>
  )
}

function IncidentTypesTab({ canEdit }) {
  const [types,     setTypes]     = useState([])
  const [loading,   setLoading]   = useState(true)
  const [modal,     setModal]     = useState(null)
  const [delTarget, setDelTarget] = useState(null)
  const [saving,    setSaving]    = useState(false)
  const [deleting,  setDeleting]  = useState(false)
  const [delError,  setDelError]  = useState('')

  useEffect(() => {
    api.get('/config/incident-types').then((d) => setTypes(d.types || [])).catch(console.error).finally(() => setLoading(false))
  }, [])

  const handleSave = async (form) => {
    setSaving(true)
    try {
      if (modal && modal !== 'create') {
        const d = await api.patch(`/config/incident-types/${modal._id}`, form)
        setTypes((p) => p.map((t) => t._id === modal._id ? d.type : t))
      } else {
        const d = await api.post('/config/incident-types', form)
        setTypes((p) => [...p, d.type])
      }
      setModal(null)
    } catch (err) { alert(err.message) } finally { setSaving(false) }
  }

  const handleDelete = async () => {
    setDeleting(true); setDelError('')
    try {
      await api.delete(`/config/incident-types/${delTarget._id}`)
      setTypes((p) => p.filter((t) => t._id !== delTarget._id))
      setDelTarget(null)
    } catch (err) { setDelError(err.message) } finally { setDeleting(false) }
  }

  if (loading) return <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-12 bg-gray-100 rounded-2xl animate-pulse" />)}</div>

  return (
    <div className="space-y-4">
      {canEdit && (
        <div className="flex justify-end">
          <button onClick={() => setModal('create')} className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors">
            <HiOutlinePlusCircle className="text-lg" /> Add Type
          </button>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {types.length === 0
          ? <p className="col-span-2 text-center text-gray-400 py-12 text-sm">No incident types yet.</p>
          : types.map((t) => (
            <div key={t._id} className={`bg-white rounded-2xl border p-4 flex items-center justify-between gap-3 ${t.active ? 'border-gray-100' : 'border-gray-200 opacity-60'}`}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-green-50 border border-green-100 flex items-center justify-center text-green-700 text-xs font-bold">
                  {t.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{t.name}</p>
                  <p className="text-xs text-gray-400 font-mono">{t.slug}{!t.active && ' · hidden'}</p>
                </div>
              </div>
              {canEdit && (
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => setModal(t)} className="p-1.5 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 transition-colors"><HiOutlinePencil /></button>
                  <button onClick={() => { setDelTarget(t); setDelError('') }} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"><HiOutlineTrash /></button>
                </div>
              )}
            </div>
          ))
        }
      </div>
      {modal && <TypeModal type={modal === 'create' ? null : modal} onClose={() => setModal(null)} onSave={handleSave} saving={saving} />}
      {delTarget && <DeleteModal label="Incident Type" name={delTarget.name} onConfirm={handleDelete} onCancel={() => { setDelTarget(null); setDelError('') }} loading={deleting} error={delError} />}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// ── TAB 3: LGA & LCDA ──────────────────────────────────────
// ═══════════════════════════════════════════════════════════
function LocationModal({ loc, locationType, onClose, onSave, saving }) {
  const [form, setForm] = useState({ name: loc?.name || '', type: loc?.type || locationType || 'lga', order: loc?.order ?? 0, active: loc?.active ?? true })
  const [error, setError] = useState('')
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900 text-lg">{loc ? `Edit ${form.type.toUpperCase()}` : `Add ${form.type.toUpperCase()}`}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl font-bold"><HiOutlineX /></button>
        </div>
        <div className="px-6 py-5 space-y-4">
          {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 px-4 py-2 rounded-xl">{error}</p>}
          {!loc && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Type</label>
              <div className="flex gap-3">
                {['lga', 'lcda'].map((t) => (
                  <button key={t} type="button" onClick={() => set('type', t)}
                    className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${form.type === t ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                    {t.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Name <span className="text-red-500">*</span></label>
            <input value={form.name} onChange={(e) => { set('name', e.target.value); setError('') }}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder={`e.g. ${form.type === 'lga' ? 'Ado-Ekiti' : 'Ado Central LCDA'}`} />
          </div>
          {loc && (
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.active} onChange={(e) => set('active', e.target.checked)} className="accent-green-600" />
              <span className="text-sm text-gray-700">Active</span>
            </label>
          )}
        </div>
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <button onClick={onClose} className="px-5 py-2.5 border border-gray-200 text-sm font-semibold text-gray-700 rounded-xl hover:bg-gray-50">Cancel</button>
          <button onClick={() => { if (!form.name.trim()) { setError('Name is required'); return } onSave(form) }} disabled={saving}
            className="px-5 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 disabled:opacity-60">
            {saving ? 'Saving…' : loc ? 'Save Changes' : 'Add'}
          </button>
        </div>
      </div>
    </div>
  )
}

function LocationsTab({ canEdit }) {
  const [lgas,      setLgas]      = useState([])
  const [lcdas,     setLcdas]     = useState([])
  const [loading,   setLoading]   = useState(true)
  const [activeTab, setActiveTab] = useState('lga')
  const [modal,     setModal]     = useState(null)
  const [delTarget, setDelTarget] = useState(null)
  const [saving,    setSaving]    = useState(false)
  const [deleting,  setDeleting]  = useState(false)
  const [delError,  setDelError]  = useState('')

  useEffect(() => {
    Promise.all([
      api.get('/config/locations?type=lga'),
      api.get('/config/locations?type=lcda'),
    ]).then(([lgaData, lcdaData]) => {
      setLgas(lgaData.locations || [])
      setLcdas(lcdaData.locations || [])
    }).catch(console.error).finally(() => setLoading(false))
  }, [])

  const current = activeTab === 'lga' ? lgas : lcdas
  const setter  = activeTab === 'lga' ? setLgas : setLcdas

  const handleSave = async (form) => {
    setSaving(true)
    try {
      if (modal && modal !== 'create') {
        const d = await api.patch(`/config/locations/${modal._id}`, form)
        setter((p) => p.map((l) => l._id === modal._id ? d.location : l))
      } else {
        const d = await api.post('/config/locations', form)
        if (d.location.type === 'lga') setLgas((p) => [...p, d.location])
        else setLcdas((p) => [...p, d.location])
      }
      setModal(null)
    } catch (err) { alert(err.message) } finally { setSaving(false) }
  }

  const handleDelete = async () => {
    setDeleting(true); setDelError('')
    try {
      await api.delete(`/config/locations/${delTarget._id}`)
      setter((p) => p.filter((l) => l._id !== delTarget._id))
      setDelTarget(null)
    } catch (err) { setDelError(err.message) } finally { setDeleting(false) }
  }

  if (loading) return <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-10 bg-gray-100 rounded-xl animate-pulse" />)}</div>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-2">
          {['lga', 'lcda'].map((t) => (
            <button key={t} onClick={() => setActiveTab(t)}
              className={`px-5 py-2 rounded-xl text-sm font-semibold border-2 transition-all ${activeTab === t ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
              {t.toUpperCase()} <span className="ml-1 text-xs opacity-60">({(t === 'lga' ? lgas : lcdas).length})</span>
            </button>
          ))}
        </div>
        {canEdit && (
          <button onClick={() => setModal('create')} className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors">
            <HiOutlinePlusCircle className="text-lg" /> Add {activeTab.toUpperCase()}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {current.length === 0
          ? <p className="col-span-3 text-center text-gray-400 py-10 text-sm">No {activeTab.toUpperCase()}s yet.</p>
          : current.map((loc) => (
            <div key={loc._id} className={`bg-white rounded-xl border px-4 py-3 flex items-center justify-between gap-2 ${loc.active ? 'border-gray-100' : 'border-gray-200 opacity-55'}`}>
              <div className="flex items-center gap-2 min-w-0">
                <HiOutlineCheck className={`shrink-0 text-sm ${loc.active ? 'text-green-500' : 'text-gray-300'}`} />
                <span className="text-sm text-gray-800 truncate">{loc.name}</span>
              </div>
              {canEdit && (
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => setModal(loc)} className="p-1 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 transition-colors"><HiOutlinePencil className="text-sm" /></button>
                  <button onClick={() => { setDelTarget(loc); setDelError('') }} className="p-1 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"><HiOutlineTrash className="text-sm" /></button>
                </div>
              )}
            </div>
          ))
        }
      </div>

      {modal && <LocationModal loc={modal === 'create' ? null : modal} locationType={activeTab} onClose={() => setModal(null)} onSave={handleSave} saving={saving} />}
      {delTarget && <DeleteModal label={delTarget.type.toUpperCase()} name={delTarget.name} onConfirm={handleDelete} onCancel={() => { setDelTarget(null); setDelError('') }} loading={deleting} error={delError} />}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// ── TAB 4: Partner Agencies ─────────────────────────────────
// ═══════════════════════════════════════════════════════════
function PartnerModal({ partner, onClose, onSave, saving }) {
  const [name,     setName]     = useState(partner?.name     || '')
  const [order,    setOrder]    = useState(partner?.order    ?? 0)
  const [active,   setActive]   = useState(partner?.active   ?? true)
  const [file,     setFile]     = useState(null)
  const [preview,  setPreview]  = useState(partner?.logoUrl  || '')
  const [error,    setError]    = useState('')
  const inputRef = useRef()

  const handleFile = (e) => {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  const handleSave = () => {
    if (!name.trim()) { setError('Agency name is required'); return }
    const body = new FormData()
    body.append('name',   name.trim())
    body.append('order',  String(order))
    if (partner) body.append('active', String(active))
    if (file) body.append('logo', file)
    onSave(body)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900 text-lg">{partner ? 'Edit Partner' : 'Add Partner Agency'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl font-bold"><HiOutlineX /></button>
        </div>
        <div className="px-6 py-5 space-y-4">
          {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 px-4 py-2 rounded-xl">{error}</p>}

          {/* Logo upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Logo</label>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden bg-gray-50">
                {preview
                  ? <img src={preview} alt="logo" className="w-full h-full object-contain p-1" />
                  : <HiOutlinePhotograph className="text-gray-300 text-2xl" />
                }
              </div>
              <div>
                <button type="button" onClick={() => inputRef.current?.click()}
                  className="text-sm font-semibold text-green-600 hover:text-green-700 border border-green-200 bg-green-50 px-3 py-1.5 rounded-lg transition-colors">
                  {preview ? 'Change Logo' : 'Upload Logo'}
                </button>
                <p className="text-xs text-gray-400 mt-1">PNG, JPG, WebP — max 5MB</p>
                <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Agency Name <span className="text-red-500">*</span></label>
            <input value={name} onChange={(e) => { setName(e.target.value); setError('') }}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="e.g. Nigeria Police Force" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Display Order</label>
            <input type="number" value={order} onChange={(e) => setOrder(Number(e.target.value))} min={0}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          {partner && (
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="accent-green-600" />
              <span className="text-sm text-gray-700">Active (visible on public site)</span>
            </label>
          )}
        </div>
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <button onClick={onClose} className="px-5 py-2.5 border border-gray-200 text-sm font-semibold text-gray-700 rounded-xl hover:bg-gray-50">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="px-5 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 disabled:opacity-60">
            {saving ? 'Saving…' : partner ? 'Save Changes' : 'Add Partner'}
          </button>
        </div>
      </div>
    </div>
  )
}

function PartnersTab({ canEdit }) {
  const [partners,  setPartners]  = useState([])
  const [loading,   setLoading]   = useState(true)
  const [modal,     setModal]     = useState(null)
  const [delTarget, setDelTarget] = useState(null)
  const [saving,    setSaving]    = useState(false)
  const [deleting,  setDeleting]  = useState(false)
  const [delError,  setDelError]  = useState('')

  useEffect(() => {
    api.get('/config/partners').then((d) => setPartners(d.partners || [])).catch(console.error).finally(() => setLoading(false))
  }, [])

  const handleSave = async (formData) => {
    setSaving(true)
    try {
      if (modal && modal !== 'create') {
        const d = await api.patch(`/config/partners/${modal._id}`, formData)
        setPartners((p) => p.map((x) => x._id === modal._id ? d.partner : x))
      } else {
        const d = await api.post('/config/partners', formData)
        setPartners((p) => [...p, d.partner])
      }
      setModal(null)
    } catch (err) { alert(err.message) } finally { setSaving(false) }
  }

  const handleDelete = async () => {
    setDeleting(true); setDelError('')
    try {
      await api.delete(`/config/partners/${delTarget._id}`)
      setPartners((p) => p.filter((x) => x._id !== delTarget._id))
      setDelTarget(null)
    } catch (err) { setDelError(err.message) } finally { setDeleting(false) }
  }

  if (loading) return <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">{[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-gray-100 rounded-2xl animate-pulse" />)}</div>

  return (
    <div className="space-y-4">
      {canEdit && (
        <div className="flex justify-end">
          <button onClick={() => setModal('create')} className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors">
            <HiOutlinePlusCircle className="text-lg" /> Add Partner
          </button>
        </div>
      )}
      {partners.length === 0
        ? <p className="text-center text-gray-400 py-12 text-sm">No partner agencies yet. Add one above.</p>
        : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {partners.map((p) => (
              <div key={p._id} className={`bg-white rounded-2xl border p-4 flex flex-col items-center gap-3 relative group ${p.active ? 'border-gray-100' : 'border-gray-200 opacity-60'}`}>
                <div className="w-16 h-16 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden">
                  {p.logoUrl
                    ? <img src={p.logoUrl} alt={p.name} className="w-full h-full object-contain p-1" />
                    : <HiOutlineOfficeBuilding className="text-gray-300 text-3xl" />
                  }
                </div>
                <p className="text-xs font-semibold text-gray-800 text-center leading-tight">{p.name}</p>
                {!p.active && <span className="text-[10px] text-gray-400">hidden</span>}
                {canEdit && (
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => setModal(p)} className="p-1 rounded-lg bg-white shadow-sm border border-gray-100 text-gray-400 hover:text-green-600 transition-colors"><HiOutlinePencil className="text-sm" /></button>
                    <button onClick={() => { setDelTarget(p); setDelError('') }} className="p-1 rounded-lg bg-white shadow-sm border border-gray-100 text-gray-400 hover:text-red-600 transition-colors"><HiOutlineTrash className="text-sm" /></button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      }
      {modal && <PartnerModal partner={modal === 'create' ? null : modal} onClose={() => setModal(null)} onSave={handleSave} saving={saving} />}
      {delTarget && <DeleteModal label="Partner" name={delTarget.name} onConfirm={handleDelete} onCancel={() => { setDelTarget(null); setDelError('') }} loading={deleting} error={delError} />}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// ── Main page ───────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════
export default function ConfigManagement() {
  const { hasPermission } = usePermission()
  const canEdit = hasPermission('manage_config')
  const [activeTab, setActiveTab] = useState('faqs')

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">System Configuration</h1>
        <p className="text-sm text-gray-500 mt-0.5">Manage FAQs, incident types, locations, and partner agencies shown on the public site.</p>
      </div>

      {/* Tab bar */}
      <div className="flex flex-wrap gap-2 border-b border-gray-100 pb-2">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeTab === key
                ? 'bg-green-600 text-white shadow-sm'
                : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
            }`}
          >
            <Icon className="text-base" />
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div>
        {activeTab === 'faqs'      && <FaqsTab          canEdit={canEdit} />}
        {activeTab === 'types'     && <IncidentTypesTab canEdit={canEdit} />}
        {activeTab === 'locations' && <LocationsTab     canEdit={canEdit} />}
        {activeTab === 'partners'  && <PartnersTab      canEdit={canEdit} />}
      </div>
    </div>
  )
}
