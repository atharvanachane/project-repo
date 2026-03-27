import React, { useState } from 'react'
import { Building2, Plus, Pencil, Trash2, Search } from 'lucide-react'
import { useApp } from '../store/AppStore'
import Modal from '../components/Modal'

const ROOM_TYPES = ['Lecture Hall', 'Lab', 'Seminar Room', 'Tutorial Room', 'Auditorium']

function ClassroomForm({ initial, onSave, onClose }) {
  const [form, setForm] = useState(initial || {
    name: '', building: '', floor: '', capacity: 40, type: 'Lecture Hall', facilities: []
  })
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const FACILITIES = ['Projector', 'Smartboard', 'AC', 'WiFi', 'Audio System', 'Video Conf']
  const toggleFacility = (f) => {
    set('facilities', form.facilities?.includes(f)
      ? form.facilities.filter(x => x !== f)
      : [...(form.facilities || []), f])
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
          <label className="label">Room Name *</label>
          <input className="input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Room 101" required />
        </div>
        <div>
          <label className="label">Building</label>
          <input className="input" value={form.building} onChange={e => set('building', e.target.value)} placeholder="Main Block" />
        </div>
        <div>
          <label className="label">Floor</label>
          <input className="input" value={form.floor} onChange={e => set('floor', e.target.value)} placeholder="Ground Floor" />
        </div>
        <div>
          <label className="label">Capacity</label>
          <input className="input" type="number" min={1} value={form.capacity} onChange={e => set('capacity', Number(e.target.value))} />
        </div>
        <div>
          <label className="label">Room Type</label>
          <select className="input" value={form.type} onChange={e => set('type', e.target.value)}>
            {ROOM_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className="label">Facilities</label>
        <div className="flex flex-wrap gap-2 mt-1">
          {FACILITIES.map(f => (
            <button
              key={f} type="button"
              onClick={() => toggleFacility(f)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                form.facilities?.includes(f)
                  ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                  : 'border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >{f}</button>
          ))}
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
        <button type="submit" className="btn-primary">{initial ? 'Save Changes' : 'Add Classroom'}</button>
      </div>
    </form>
  )
}

export default function ClassroomsPage() {
  const { state, dispatch } = useApp()
  const [showAdd, setShowAdd] = useState(false)
  const [editing, setEditing] = useState(null)
  const [search, setSearch] = useState('')

  const filtered = state.classrooms.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.building?.toLowerCase().includes(search.toLowerCase())
  )

  const TYPE_COLORS = {
    'Lecture Hall': 'bg-blue-500', 'Lab': 'bg-green-500',
    'Seminar Room': 'bg-purple-500', 'Tutorial Room': 'bg-orange-500', 'Auditorium': 'bg-red-500'
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Classrooms</h1>
          <p className="text-sm text-slate-500 mt-0.5">{state.classrooms.length} rooms registered</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Add Classroom
        </button>
      </div>

      <div className="relative mb-5">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input className="input pl-9" placeholder="Search classrooms..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <Building2 size={40} className="mx-auto text-slate-200 mb-3" />
          <p className="text-slate-400 font-medium">No classrooms found</p>
          <button onClick={() => setShowAdd(true)} className="btn-primary mt-4 inline-flex items-center gap-2">
            <Plus size={16} /> Add Classroom
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(c => {
            const usageCount = state.timetable.filter(e => e.classroomId === c.id).length
            return (
              <div key={c.id} className="card p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${TYPE_COLORS[c.type] || 'bg-blue-500'}`}>
                      <Building2 size={18} />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-800">{c.name}</div>
                      <div className="text-xs text-slate-400">{c.building} {c.floor && `· ${c.floor}`}</div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => setEditing(c)} className="btn-ghost p-1.5"><Pencil size={14} /></button>
                    <button onClick={() => { if (confirm('Delete?')) dispatch({ type: 'DELETE_CLASSROOM', payload: c.id }) }} className="btn-ghost p-1.5 text-red-400"><Trash2 size={14} /></button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="badge-blue">{c.type}</span>
                  <span className="badge-green">Cap: {c.capacity}</span>
                  <span className="badge-purple">{usageCount} periods/wk</span>
                </div>
                {c.facilities?.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {c.facilities.map(f => (
                      <span key={f} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">{f}</span>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {showAdd && (
        <Modal title="Add Classroom" onClose={() => setShowAdd(false)}>
          <ClassroomForm onSave={d => dispatch({ type: 'ADD_CLASSROOM', payload: d })} onClose={() => setShowAdd(false)} />
        </Modal>
      )}
      {editing && (
        <Modal title="Edit Classroom" onClose={() => setEditing(null)}>
          <ClassroomForm initial={editing} onSave={d => dispatch({ type: 'UPDATE_CLASSROOM', payload: d })} onClose={() => setEditing(null)} />
        </Modal>
      )}
    </div>
  )
}
