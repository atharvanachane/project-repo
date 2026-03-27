import React, { useState } from 'react'
import { GraduationCap, Plus, Pencil, Trash2, Search, BookOpen, Users } from 'lucide-react'
import { useApp } from '../store/AppStore'
import Modal from '../components/Modal'

function SubjectAssignmentRow({ sa, subjects, faculty, onChange, onRemove }) {
  return (
    <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
      <select
        className="input flex-1 py-1"
        value={sa.subjectId}
        onChange={e => onChange({ ...sa, subjectId: e.target.value })}
      >
        <option value="">-- Subject --</option>
        {subjects.map(s => <option key={s.id} value={s.id}>{s.name} {s.code && `(${s.code})`}</option>)}
      </select>
      <select
        className="input flex-1 py-1"
        value={sa.facultyId}
        onChange={e => onChange({ ...sa, facultyId: e.target.value })}
      >
        <option value="">-- Faculty --</option>
        {faculty.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
      </select>
      <div className="flex items-center gap-1 shrink-0">
        <span className="text-xs text-slate-500">Hrs/wk:</span>
        <input
          type="number" min={1} max={10}
          className="input w-14 py-1 text-center"
          value={sa.weeklyHours || 3}
          onChange={e => onChange({ ...sa, weeklyHours: Number(e.target.value) })}
        />
      </div>
      <button onClick={onRemove} className="text-red-400 hover:text-red-600 p-1">
        <Trash2 size={14} />
      </button>
    </div>
  )
}

function BatchForm({ initial, onSave, onClose }) {
  const { state } = useApp()
  const [form, setForm] = useState(initial || {
    name: '', year: '', semester: '', program: '', strength: 60,
    subjectAssignments: []
  })
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const addAssignment = () => {
    set('subjectAssignments', [...(form.subjectAssignments || []), { subjectId: '', facultyId: '', weeklyHours: 3 }])
  }
  const updateAssignment = (i, val) => {
    const arr = [...(form.subjectAssignments || [])]
    arr[i] = val
    set('subjectAssignments', arr)
  }
  const removeAssignment = (i) => {
    set('subjectAssignments', (form.subjectAssignments || []).filter((_, j) => j !== i))
  }

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
          <label className="label">Batch Name *</label>
          <input className="input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. CS-2024-A" required />
        </div>
        <div>
          <label className="label">Program</label>
          <input className="input" value={form.program} onChange={e => set('program', e.target.value)} placeholder="B.Tech CS" />
        </div>
        <div>
          <label className="label">Year</label>
          <input className="input" value={form.year} onChange={e => set('year', e.target.value)} placeholder="2nd Year" />
        </div>
        <div>
          <label className="label">Semester</label>
          <input className="input" value={form.semester} onChange={e => set('semester', e.target.value)} placeholder="Semester 3" />
        </div>
        <div>
          <label className="label">Strength</label>
          <input className="input" type="number" min={1} value={form.strength} onChange={e => set('strength', Number(e.target.value))} />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="label mb-0">Subject Assignments</label>
          <button type="button" onClick={addAssignment} className="btn-ghost py-1 text-xs flex items-center gap-1">
            <Plus size={12} /> Add Subject
          </button>
        </div>
        {state.subjects.length === 0 && (
          <p className="text-xs text-amber-600 bg-amber-50 rounded p-2">Add subjects first before assigning them here.</p>
        )}
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {(form.subjectAssignments || []).map((sa, i) => (
            <SubjectAssignmentRow
              key={i} sa={sa}
              subjects={state.subjects}
              faculty={state.faculty}
              onChange={v => updateAssignment(i, v)}
              onRemove={() => removeAssignment(i)}
            />
          ))}
          {(form.subjectAssignments || []).length === 0 && (
            <div className="text-center py-4 text-sm text-slate-400">No assignments yet. Click "Add Subject" above.</div>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
        <button type="submit" className="btn-primary">{initial ? 'Save Changes' : 'Add Batch'}</button>
      </div>
    </form>
  )
}

export default function BatchesPage() {
  const { state, dispatch } = useApp()
  const [showAdd, setShowAdd] = useState(false)
  const [editing, setEditing] = useState(null)
  const [search, setSearch] = useState('')

  const filtered = state.batches.filter(b =>
    b.name?.toLowerCase().includes(search.toLowerCase()) ||
    b.program?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Batches</h1>
          <p className="text-sm text-slate-500 mt-0.5">{state.batches.length} batches registered</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Add Batch
        </button>
      </div>

      <div className="relative mb-5">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input className="input pl-9" placeholder="Search batches..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <GraduationCap size={40} className="mx-auto text-slate-200 mb-3" />
          <p className="text-slate-400 font-medium">No batches found</p>
          <button onClick={() => setShowAdd(true)} className="btn-primary mt-4 inline-flex items-center gap-2">
            <Plus size={16} /> Add Batch
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(b => {
            const assignments = b.subjectAssignments || []
            const validAssignments = assignments.filter(sa => sa.subjectId && sa.facultyId)
            return (
              <div key={b.id} className="card p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-orange-500 flex items-center justify-center text-white">
                      <GraduationCap size={20} />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-800">{b.name}</div>
                      <div className="text-xs text-slate-400">{b.program} {b.year && `· ${b.year}`} {b.semester && `· ${b.semester}`}</div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => setEditing(b)} className="btn-ghost p-1.5"><Pencil size={14} /></button>
                    <button onClick={() => { if (confirm('Delete batch?')) dispatch({ type: 'DELETE_BATCH', payload: b.id }) }} className="btn-ghost p-1.5 text-red-400"><Trash2 size={14} /></button>
                  </div>
                </div>

                <div className="flex gap-2 mb-3">
                  <span className="badge-blue flex items-center gap-1"><Users size={10} /> {b.strength} students</span>
                  <span className="badge-green flex items-center gap-1"><BookOpen size={10} /> {validAssignments.length} subjects</span>
                </div>

                {validAssignments.length > 0 && (
                  <div className="space-y-1 mt-2">
                    {validAssignments.slice(0, 4).map((sa, i) => {
                      const subj = state.subjects.find(s => s.id === sa.subjectId)
                      const teacher = state.faculty.find(f => f.id === sa.facultyId)
                      return (
                        <div key={i} className="flex items-center gap-2 text-xs text-slate-600">
                          {subj?.color && <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: subj.color }} />}
                          <span className="font-medium truncate">{subj?.name || 'Unknown'}</span>
                          <span className="text-slate-400">→</span>
                          <span className="text-slate-500 truncate">{teacher?.name || 'Unassigned'}</span>
                          <span className="ml-auto text-slate-400 shrink-0">{sa.weeklyHours}h/wk</span>
                        </div>
                      )
                    })}
                    {validAssignments.length > 4 && (
                      <div className="text-xs text-slate-400">+{validAssignments.length - 4} more subjects</div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {showAdd && (
        <Modal title="Add Batch" onClose={() => setShowAdd(false)} size="xl">
          <BatchForm onSave={d => dispatch({ type: 'ADD_BATCH', payload: d })} onClose={() => setShowAdd(false)} />
        </Modal>
      )}
      {editing && (
        <Modal title="Edit Batch" onClose={() => setEditing(null)} size="xl">
          <BatchForm initial={editing} onSave={d => dispatch({ type: 'UPDATE_BATCH', payload: d })} onClose={() => setEditing(null)} />
        </Modal>
      )}
    </div>
  )
}
