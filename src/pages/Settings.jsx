import React, { useState } from 'react'
import { Settings, Save, RefreshCw } from 'lucide-react'
import { useApp } from '../store/AppStore'

const DAYS_OPTIONS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export default function SettingsPage() {
  const { state, dispatch } = useApp()
  const [form, setForm] = useState({ ...state.settings })
  const [saved, setSaved] = useState(false)

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const toggleDay = (d) => {
    const days = form.days || []
    if (days.includes(d)) {
      set('days', days.filter(x => x !== d))
    } else {
      set('days', DAYS_OPTIONS.filter(x => [...days, d].includes(x)))
    }
  }

  const save = (e) => {
    e.preventDefault()
    dispatch({ type: 'UPDATE_SETTINGS', payload: form })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const reset = () => {
    const defaults = {
      periodsPerDay: 8, daysPerWeek: 5, startTime: '08:00',
      periodDuration: 45, shortBreakAfterPeriod: 2, shortBreakDuration: 15,
      longBreakAfterPeriod: 4, longBreakDuration: 30,
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    }
    setForm(defaults)
    dispatch({ type: 'UPDATE_SETTINGS', payload: defaults })
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Settings</h1>
          <p className="text-sm text-slate-500 mt-0.5">Configure timetable generation parameters</p>
        </div>
        <button onClick={reset} className="btn-secondary flex items-center gap-2 text-xs">
          <RefreshCw size={14} /> Reset Defaults
        </button>
      </div>

      <form onSubmit={save} className="space-y-6">
        {/* Schedule */}
        <div className="card p-5">
          <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Settings size={16} className="text-indigo-500" /> Schedule Configuration
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Periods per Day</label>
              <input
                type="number" min={1} max={12} className="input"
                value={form.periodsPerDay}
                onChange={e => set('periodsPerDay', Number(e.target.value))}
              />
            </div>
            <div>
              <label className="label">Start Time</label>
              <input
                type="time" className="input"
                value={form.startTime}
                onChange={e => set('startTime', e.target.value)}
              />
            </div>
            <div>
              <label className="label">Period Duration (minutes)</label>
              <input
                type="number" min={15} max={120} className="input"
                value={form.periodDuration}
                onChange={e => set('periodDuration', Number(e.target.value))}
              />
            </div>
            <div>
              <label className="label">Short Break After Period #</label>
              <input
                type="number" min={1} max={form.periodsPerDay} className="input"
                value={form.shortBreakAfterPeriod || 2}
                onChange={e => set('shortBreakAfterPeriod', Number(e.target.value))}
              />
            </div>
            <div>
              <label className="label">Short Break Duration (minutes)</label>
              <input
                type="number" min={5} max={60} className="input"
                value={form.shortBreakDuration || 15}
                onChange={e => set('shortBreakDuration', Number(e.target.value))}
              />
            </div>
            <div>
              <label className="label">Long Break After Period #</label>
              <input
                type="number" min={1} max={form.periodsPerDay} className="input"
                value={form.longBreakAfterPeriod || 4}
                onChange={e => set('longBreakAfterPeriod', Number(e.target.value))}
              />
            </div>
            <div>
              <label className="label">Long Break Duration (minutes)</label>
              <input
                type="number" min={5} max={60} className="input"
                value={form.longBreakDuration || 30}
                onChange={e => set('longBreakDuration', Number(e.target.value))}
              />
            </div>
          </div>
        </div>

        {/* Official Information */}
        <div className="card p-5">
          <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
            Official Information (for Timetable Header)
          </h2>
          <div className="space-y-4">
            <div>
              <label className="label">University Name</label>
              <input
                type="text" className="input text-sm"
                value={form.universityName || ''}
                onChange={e => set('universityName', e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="label">School / College Name</label>
                <input
                  type="text" className="input text-sm"
                  value={form.schoolName || ''}
                  onChange={e => set('schoolName', e.target.value)}
                />
              </div>
              <div>
                <label className="label">Session / Term</label>
                <input
                  type="text" className="input text-sm"
                  value={form.session || ''}
                  onChange={e => set('session', e.target.value)}
                />
              </div>
              <div>
                <label className="label">W.E.F. Date</label>
                <input
                  type="text" className="input text-sm"
                  value={form.wefDate || ''}
                  onChange={e => set('wefDate', e.target.value)}
                />
              </div>
              <div>
                <label className="label">Semester / Course Info</label>
                <input
                  type="text" className="input text-sm"
                  value={form.semester || ''}
                  onChange={e => set('semester', e.target.value)}
                />
              </div>
              <div>
                <label className="label">Division / Group</label>
                <input
                  type="text" className="input text-sm"
                  value={form.division || ''}
                  onChange={e => set('division', e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Working Days */}
        <div className="card p-5">
          <h2 className="font-semibold text-slate-800 mb-4">Working Days</h2>
          <div className="flex flex-wrap gap-2">
            {DAYS_OPTIONS.map(d => (
              <button
                key={d} type="button"
                onClick={() => toggleDay(d)}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${(form.days || []).includes(d)
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                  }`}
              >
                {d.slice(0, 3)}
              </button>
            ))}
          </div>
          <p className="text-xs text-slate-400 mt-2">{(form.days || []).length} days selected</p>
        </div>

        {/* Preview */}
        <div className="card p-5 bg-slate-50">
          <h2 className="font-semibold text-slate-700 mb-3 text-sm">Schedule Preview</h2>
          <div className="text-sm text-slate-600 space-y-1">
            <div>Total periods per week: <strong className="text-slate-800">{form.periodsPerDay * (form.days || []).length}</strong></div>
            <div>School starts at: <strong className="text-slate-800">{form.startTime}</strong></div>
            <div>Each period: <strong className="text-slate-800">{form.periodDuration} min</strong></div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button type="submit" className="btn-primary flex items-center gap-2">
            <Save size={15} />
            {saved ? 'Saved!' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  )
}
