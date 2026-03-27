import React, { useState } from 'react'
import { BookOpen, Plus, Pencil, Trash2, Search } from 'lucide-react'
import { useApp } from '../store/AppStore'
import Modal from '../components/Modal'

const COLORS = ['#4F46E5', '#0EA5E9', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316', '#6366F1']
const TYPES = ['Theory', 'Lab', 'Tutorial', 'Project', 'Seminar']

function SubjectForm({ initial, onSave, onClose }) {
  const [form, setForm] = useState(initial || {
    name: '', code: '', department: '', credits: 3, type: 'Theory',
    color: COLORS[0], description: ''
  })
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const submit = (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    onSave(form)
    onClose()
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="label">Subject Name *</label>
          <input className="input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Data Structures" required />
        </div>
        <div>
          <label className="label">Subject Code</label>
          <input className="input" value={form.code} onChange={e => set('code', e.target.value)} placeholder="CS301" />
        </div>
        <div>
          <label className="label">Department</label>
          <input className="input" value={form.department} onChange={e => set('department', e.target.value)} placeholder="Computer Science" />
        </div>
        <div>
          <label className="label">Credits</label>
          <input className="input" type="number" min={1} max={6} value={form.credits} onChange={e => set('credits', Number(e.target.value))} />
        </div>
        <div>
          <label className="label">Type</label>
          <select className="input" value={form.type} onChange={e => set('type', e.target.value)}>
            {TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div className="col-span-2">
          <label className="label">Description</label>
          <textarea className="input" rows={2} value={form.description} onChange={e => set('description', e.target.value)} placeholder="Brief description..." />
        </div>
      </div>

      <div>
        <label className="label">Color</label>
        <div className="flex gap-2 flex-wrap">
          {COLORS.map(c => (
            <button
              key={c} type="button"
              onClick={() => set('color', c)}
              className={`w-7 h-7 rounded-full border-2 transition-all ${form.color === c ? 'border-slate-800 scale-110' : 'border-transparent'}`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
        <button type="submit" className="btn-primary">
          {initial ? 'Save Changes' : 'Add Subject'}
        </button>
      </div>
    </form>
  )
}

export default function SubjectsPage() {
  const { state, dispatch } = useApp()
  const [showAdd, setShowAdd] = useState(false)
  const [editing, setEditing] = useState(null)
  const [search, setSearch] = useState('')

  const filtered = state.subjects.filter(s =>
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.code?.toLowerCase().includes(search.toLowerCase()) ||
    s.department?.toLowerCase().includes(search.toLowerCase())
  )

  const TYPE_BADGE = { Theory: 'badge-blue', Lab: 'badge-green', Tutorial: 'badge-purple', Project: 'badge-yellow', Seminar: 'badge-red' }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Subjects</h1>
          <p className="text-sm text-slate-500 mt-0.5">{state.subjects.length} subjects registered</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Add Subject
        </button>
      </div>

      <div className="relative mb-5">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input className="input pl-9" placeholder="Search subjects..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <BookOpen size={40} className="mx-auto text-slate-200 mb-3" />
          <p className="text-slate-400 font-medium">No subjects found</p>
          <button onClick={() => setShowAdd(true)} className="btn-primary mt-4 inline-flex items-center gap-2">
            <Plus size={16} /> Add Subject
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(s => {
            const usedInBatches = state.batches.filter(b =>
              (b.subjectAssignments || []).some(sa => sa.subjectId === s.id)
            ).length
            return (
              <div key={s.id} className="card p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0"
                      style={{ backgroundColor: s.color }}
                    >
                      {s.code?.slice(0, 2) || s.name?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-800 text-sm">{s.name}</div>
                      {s.code && <div className="text-xs text-slate-400">{s.code}</div>}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => setEditing(s)} className="btn-ghost p-1.5"><Pencil size={14} /></button>
                    <button onClick={() => { if (confirm('Delete subject?')) dispatch({ type: 'DELETE_SUBJECT', payload: s.id }) }} className="btn-ghost p-1.5 text-red-400"><Trash2 size={14} /></button>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <span className={TYPE_BADGE[s.type] || 'badge-blue'}>{s.type}</span>
                  <span className="badge-purple">{s.credits} Credits</span>
                  {s.department && <span className="badge-blue">{s.department}</span>}
                </div>

                {s.description && (
                  <p className="text-xs text-slate-500 mt-2 line-clamp-2">{s.description}</p>
                )}

                <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between text-xs text-slate-400">
                  <span>Used in {usedInBatches} batch{usedInBatches !== 1 ? 'es' : ''}</span>
                  <span>{state.timetable.filter(e => e.subjectId === s.id).length} periods scheduled</span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {showAdd && (
        <Modal title="Add Subject" onClose={() => setShowAdd(false)}>
          <SubjectForm onSave={d => dispatch({ type: 'ADD_SUBJECT', payload: d })} onClose={() => setShowAdd(false)} />
        </Modal>
      )}
      {editing && (
        <Modal title="Edit Subject" onClose={() => setEditing(null)}>
          <SubjectForm initial={editing} onSave={d => dispatch({ type: 'UPDATE_SUBJECT', payload: d })} onClose={() => setEditing(null)} />
        </Modal>
      )}
    </div>
  )
}
