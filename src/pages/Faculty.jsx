import React, { useState } from 'react'
import { Users, Plus, Pencil, Trash2, Search, Clock, BookOpen } from 'lucide-react'
import { useApp } from '../store/AppStore'
import Modal from '../components/Modal'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
const COLORS = ['#4F46E5', '#0EA5E9', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6']

function FacultyForm({ initial, onSave, onClose }) {
  const { state } = useApp()
  const [form, setForm] = useState(initial || {
    name: '', email: '', phone: '', department: '', designation: '',
    color: COLORS[0],
    workingHours: DAYS.map(day => ({ day, startPeriod: 1, endPeriod: state.settings.periodsPerDay, active: true }))
  })

  const set = (key, val) => setForm(p => ({ ...p, [key]: val }))
  const setWH = (dayIdx, key, val) => {
    const wh = [...form.workingHours]
    wh[dayIdx] = { ...wh[dayIdx], [key]: val }
    setForm(p => ({ ...p, workingHours: wh }))
  }

  const submit = (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    onSave(form)
    onClose()
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="label">Full Name *</label>
          <input className="input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Dr. John Smith" required />
        </div>
        <div>
          <label className="label">Email</label>
          <input className="input" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="john@school.edu" />
        </div>
        <div>
          <label className="label">Phone</label>
          <input className="input" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+1 234 567 890" />
        </div>
        <div>
          <label className="label">Department</label>
          <input className="input" value={form.department} onChange={e => set('department', e.target.value)} placeholder="Computer Science" />
        </div>
        <div>
          <label className="label">Designation</label>
          <input className="input" value={form.designation} onChange={e => set('designation', e.target.value)} placeholder="Associate Professor" />
        </div>
      </div>

      <div>
        <label className="label">Color Tag</label>
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

      <div>
        <label className="label flex items-center gap-1"><Clock size={14} /> Working Hours (periods)</label>
        <div className="space-y-2 mt-2">
          {form.workingHours.map((wh, i) => (
            <div key={wh.day} className="flex items-center gap-3">
              <label className="flex items-center gap-2 w-36">
                <input
                  type="checkbox" checked={wh.active}
                  onChange={e => setWH(i, 'active', e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm text-slate-700">{wh.day}</span>
              </label>
              {wh.active && (
                <>
                  <select
                    value={wh.startPeriod}
                    onChange={e => setWH(i, 'startPeriod', Number(e.target.value))}
                    className="input w-20 py-1"
                  >
                    {Array.from({ length: state.settings.periodsPerDay }, (_, j) => j + 1).map(p => (
                      <option key={p} value={p}>P{p}</option>
                    ))}
                  </select>
                  <span className="text-slate-400 text-sm">to</span>
                  <select
                    value={wh.endPeriod}
                    onChange={e => setWH(i, 'endPeriod', Number(e.target.value))}
                    className="input w-20 py-1"
                  >
                    {Array.from({ length: state.settings.periodsPerDay }, (_, j) => j + 1).map(p => (
                      <option key={p} value={p}>P{p}</option>
                    ))}
                  </select>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
        <button type="submit" className="btn-primary">
          {initial ? 'Save Changes' : 'Add Faculty'}
        </button>
      </div>
    </form>
  )
}

export default function FacultyPage() {
  const { state, dispatch } = useApp()
  const [showAdd, setShowAdd] = useState(false)
  const [editing, setEditing] = useState(null)
  const [search, setSearch] = useState('')

  const filtered = state.faculty.filter(f =>
    f.name?.toLowerCase().includes(search.toLowerCase()) ||
    f.department?.toLowerCase().includes(search.toLowerCase())
  )

  const handleAdd = (data) => dispatch({ type: 'ADD_FACULTY', payload: data })
  const handleUpdate = (data) => dispatch({ type: 'UPDATE_FACULTY', payload: data })
  const handleDelete = (id) => { if (confirm('Delete this faculty member?')) dispatch({ type: 'DELETE_FACULTY', payload: id }) }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Faculty</h1>
          <p className="text-sm text-slate-500 mt-0.5">{state.faculty.length} faculty members registered</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Add Faculty
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          className="input pl-9"
          placeholder="Search faculty..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <Users size={40} className="mx-auto text-slate-200 mb-3" />
          <p className="text-slate-400 font-medium">No faculty found</p>
          <p className="text-sm text-slate-300 mt-1">Add your first faculty member to get started</p>
          <button onClick={() => setShowAdd(true)} className="btn-primary mt-4 inline-flex items-center gap-2">
            <Plus size={16} /> Add Faculty
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(f => {
            const load = state.timetable.filter(e => e.teacherId === f.id).length
            const subjects = [...new Set(state.timetable.filter(e => e.teacherId === f.id).map(e => e.subjectName))]
            const activeDays = (f.workingHours || []).filter(wh => wh.active).length

            return (
              <div key={f.id} className="card p-5">
                <div className="flex items-start gap-3">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0"
                    style={{ backgroundColor: f.color || '#4F46E5' }}
                  >
                    {f.name?.[0]?.toUpperCase() || 'F'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-slate-800">{f.name}</div>
                    <div className="text-xs text-slate-500">{f.designation} {f.department && `· ${f.department}`}</div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => setEditing(f)} className="btn-ghost p-1.5">
                      <Pencil size={15} />
                    </button>
                    <button onClick={() => handleDelete(f.id)} className="btn-ghost p-1.5 text-red-400 hover:text-red-600">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-3 gap-2 text-center">
                  <div>
                    <div className="text-lg font-bold text-indigo-600">{load}</div>
                    <div className="text-xs text-slate-400">Periods/wk</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-green-600">{subjects.length}</div>
                    <div className="text-xs text-slate-400">Subjects</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-orange-500">{activeDays}</div>
                    <div className="text-xs text-slate-400">Work Days</div>
                  </div>
                </div>

                {subjects.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {subjects.map(s => (
                      <span key={s} className="badge-blue">{s}</span>
                    ))}
                  </div>
                )}

                {f.email && (
                  <div className="mt-2 text-xs text-slate-400 truncate">{f.email}</div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {showAdd && (
        <Modal title="Add Faculty Member" onClose={() => setShowAdd(false)} size="lg">
          <FacultyForm onSave={handleAdd} onClose={() => setShowAdd(false)} />
        </Modal>
      )}
      {editing && (
        <Modal title="Edit Faculty Member" onClose={() => setEditing(null)} size="lg">
          <FacultyForm initial={editing} onSave={handleUpdate} onClose={() => setEditing(null)} />
        </Modal>
      )}
    </div>
  )
}
