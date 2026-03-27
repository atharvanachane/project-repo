import React, { useState, useMemo } from 'react'
import {
  CalendarDays, Zap, RefreshCw, AlertTriangle, UserX, UserCheck,
  Download, Filter, ChevronDown, Clock, User, BookOpen, Building2,
  CheckCircle, XCircle, Info, Loader, Printer
} from 'lucide-react'
import { useApp } from '../store/AppStore'
import Modal from '../components/Modal'
import { generateTimetable, computeSubstitute, getPeriodTime } from '../utils/timetableEngine'

// ── Absence Modal ────────────────────────────────────────────────────────────
function AbsenceModal({ onClose }) {
  const { state, dispatch } = useApp()
  const [form, setForm] = useState({ facultyId: '', date: new Date().toISOString().split('T')[0], reason: '' })

  const submit = (e) => {
    e.preventDefault()
    if (!form.facultyId) return
    dispatch({ type: 'ADD_ABSENCE', payload: form })

    // Auto-assign substitutes for all periods that day
    const faculty = state.faculty.find(f => f.id === form.facultyId)
    if (!faculty) { onClose(); return }

    const dayMap = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const targetDay = dayMap[new Date(form.date + 'T00:00:00').getDay()]

    const affectedEntries = state.timetable.filter(e =>
      e.teacherId === form.facultyId && e.day === targetDay
    )

    // Build new absences list for substitute computation
    const newAbsences = [...state.absences, { facultyId: form.facultyId, date: form.date }]

    for (const entry of affectedEntries) {
      const sub = computeSubstitute(
        { ...entry, date: form.date },
        state.faculty,
        state.timetable,
        newAbsences
      )
      dispatch({
        type: 'UPDATE_TIMETABLE_ENTRY',
        payload: {
          ...entry,
          status: 'absent',
          substituteName: sub?.name || 'No substitute available',
          substituteId: sub?.id || null,
        }
      })
    }

    onClose()
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex gap-2">
        <AlertTriangle size={16} className="text-amber-500 shrink-0 mt-0.5" />
        <p className="text-sm text-amber-700">
          Marking a teacher absent will automatically assign the best available substitute teacher for all their periods on that day.
        </p>
      </div>
      <div>
        <label className="label">Faculty Member *</label>
        <select className="input" value={form.facultyId} onChange={e => setForm(p => ({ ...p, facultyId: e.target.value }))} required>
          <option value="">Select faculty...</option>
          {state.faculty.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
        </select>
      </div>
      <div>
        <label className="label">Date</label>
        <input className="input" type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} />
      </div>
      <div>
        <label className="label">Reason (optional)</label>
        <input className="input" value={form.reason} onChange={e => setForm(p => ({ ...p, reason: e.target.value }))} placeholder="Medical, Personal, etc." />
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
        <button type="submit" className="btn-danger flex items-center gap-2">
          <UserX size={15} /> Mark Absent
        </button>
      </div>
    </form>
  )
}

// ── Period Cell ───────────────────────────────────────────────────────────────
function PeriodCell({ entry, settings, onMarkAbsent }) {
  const [showDetail, setShowDetail] = useState(false)
  if (!entry) return <div className="h-full min-h-[60px] bg-slate-50 rounded-lg border border-dashed border-slate-200" />

  const isAbsent = entry.status === 'absent'
  const time = getPeriodTime(entry.period, settings)

  return (
    <>
      <div
        onClick={() => setShowDetail(true)}
        className={`rounded-lg p-2 cursor-pointer transition-all hover:opacity-90 hover:shadow-sm min-h-[60px] border ${
          isAbsent ? 'border-amber-300 bg-amber-50' : 'border-transparent'
        }`}
        style={!isAbsent ? { backgroundColor: entry.subjectColor + '18', borderColor: entry.subjectColor + '40' } : {}}
      >
        <div className="flex items-start justify-between gap-1">
          <div
            className="text-xs font-bold truncate"
            style={{ color: isAbsent ? '#B45309' : entry.subjectColor }}
          >
            {entry.subjectCode || entry.subjectName?.slice(0, 6)}
          </div>
          {isAbsent && <AlertTriangle size={11} className="text-amber-500 shrink-0" />}
        </div>
        <div className="text-xs text-slate-600 truncate mt-0.5">{entry.teacherName?.split(' ')[0]}</div>
        {isAbsent && entry.substituteName && (
          <div className="text-xs text-amber-700 truncate mt-0.5">
            Sub: {entry.substituteName?.split(' ')[0]}
          </div>
        )}
        <div className="text-xs text-slate-400 truncate">{entry.classroomName}</div>
      </div>

      {showDetail && (
        <Modal title="Period Details" onClose={() => setShowDetail(false)} size="sm">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                style={{ backgroundColor: entry.subjectColor }}>
                {entry.subjectCode?.slice(0, 2) || entry.subjectName?.[0]}
              </div>
              <div>
                <div className="font-semibold text-slate-800">{entry.subjectName}</div>
                {entry.subjectCode && <div className="text-xs text-slate-400">{entry.subjectCode}</div>}
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-slate-600">
                <Clock size={14} className="text-slate-400" /> {time} · Period {entry.period}
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <User size={14} className="text-slate-400" />
                <span>{entry.teacherName}</span>
                {isAbsent && <span className="badge-red ml-1">ABSENT</span>}
              </div>
              {isAbsent && entry.substituteName && (
                <div className="flex items-center gap-2 text-amber-700 bg-amber-50 p-2 rounded-lg">
                  <UserCheck size={14} />
                  <span className="font-medium">Substitute: {entry.substituteName}</span>
                </div>
              )}
              {isAbsent && !entry.substituteId && (
                <div className="flex items-center gap-2 text-red-700 bg-red-50 p-2 rounded-lg">
                  <XCircle size={14} />
                  <span className="text-sm">No substitute available</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-slate-600">
                <Building2 size={14} className="text-slate-400" /> {entry.classroomName || 'TBD'}
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <BookOpen size={14} className="text-slate-400" /> {entry.batchName}
              </div>
            </div>

            {!isAbsent && (
              <button
                onClick={() => { onMarkAbsent(entry.teacherId); setShowDetail(false) }}
                className="w-full btn-danger flex items-center justify-center gap-2 mt-2"
              >
                <UserX size={15} /> Mark Teacher Absent
              </button>
            )}
          </div>
        </Modal>
      )}
    </>
  )
}

// ── Official Print-Ready Timetable ──────────────────────────────────────────
function getInitials(name) {
  if (!name) return ''
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
}

// Helper for vertical stacked text
const VerticalText = ({ text }) => (
  <div className="flex flex-col items-center justify-center leading-none text-[9px] font-bold uppercase tracking-tight py-1">
    {text.split('').map((char, i) => (
      <span key={i} className={char === ' ' ? 'h-1' : ''}>{char}</span>
    ))}
  </div>
)

function OfficialTimetable({ timetable, settings, activeDays, periods, subjects, faculty }) {
  const {
    universityName = 'UNIVERSITY NAME',
    schoolName = 'SCHOOL NAME',
    session = '2024-2025',
    semester = 'SEMESTER',
    division = 'DIV',
    wefDate = 'DATE',
  } = settings || {}

  const gridData = {}
  activeDays.forEach(day => {
    gridData[day] = {}
    periods.forEach(p => {
      gridData[day][p] = timetable.find(e => e.day === day && e.period === p)
    })
  })

  // Mapping of subjects to faculty for the footer table
  const usedSubjects = useMemo(() => {
    const map = new Map()
    timetable.forEach(e => {
      if (!map.has(e.subjectId)) {
        map.set(e.subjectId, {
          name: e.subjectName,
          code: e.subjectCode,
          faculty: e.teacherName,
          facultyInitials: getInitials(e.teacherName)
        })
      }
    })
    return Array.from(map.values())
  }, [timetable])

  const shortBreakAfter = settings?.shortBreakAfterPeriod || 2
  const longBreakAfter = settings?.longBreakAfterPeriod || 4

  return (
    <div className="bg-white p-8 border shadow-sm max-w-5xl mx-auto text-slate-900 font-serif overflow-x-auto print:p-0 print:border-0 print:shadow-none print:max-w-none print:w-full print:overflow-visible">
      <style>{`
        @media print {
          @page { size: A4 landscape; margin: 10mm; }
          body { 
            margin: 0; padding: 0; 
            overflow: visible !important; 
            height: auto !important;
          }
          .official-sheet-container { 
            width: 100% !important; 
            overflow: visible !important;
            display: block !important;
          }
          .print-section { 
            break-inside: avoid; 
            page-break-inside: avoid; 
            display: block;
            width: 100%;
          }
        }
      `}</style>
      
      <div className="official-sheet-container">
        {/* Official Header */}
        <div className="text-center mb-6 space-y-1 print-section">
          <h2 className="text-xl font-bold uppercase tracking-tight">{universityName}</h2>
          <h3 className="text-md font-semibold uppercase">{schoolName} ({semester})</h3>
          <div className="text-sm font-medium italic">Session : {session}</div>
          
          <div className="grid grid-cols-4 border-y border-slate-800 mt-4 py-1 text-[10px] font-bold uppercase italic">
            <div className="border-r border-slate-800">{semester}</div>
            <div className="border-r border-slate-800">{division}</div>
            <div className="border-r border-slate-800">A.Y. - {session?.split(' ')[0] || session}</div>
            <div>W.E.F. {wefDate}</div>
          </div>
        </div>

        {/* Main Table */}
        <div className="print-section">
          <table className="w-full border-collapse border-2 border-slate-800 text-[10px]">
          <thead>
            <tr className="bg-slate-50">
              <th className="border border-slate-800 p-2 w-20">Day</th>
              <th className="border border-slate-800 p-2 w-16">Class/Time</th>
              {periods.map(p => (
                <React.Fragment key={p}>
                  <th className="border border-slate-800 p-2 min-w-[100px]">
                    <div className="font-bold">Lecture No. {p}</div>
                    <div className="font-normal mt-1 italic">{getPeriodTime(p, settings)}</div>
                  </th>
                  {p === shortBreakAfter && (
                    <th className="border border-slate-800 p-0 w-6 bg-slate-100">
                      <VerticalText text="BIO BREAK" />
                    </th>
                  )}
                  {p === longBreakAfter && (
                    <th className="border border-slate-800 p-0 w-6 bg-slate-100">
                      <VerticalText text="LUNCH BREAK" />
                    </th>
                  )}
                </React.Fragment>
              ))}
            </tr>
          </thead>
          <tbody>
            {activeDays.map(day => (
              <tr key={day} className="h-16">
                <td className="border border-slate-800 font-bold text-center uppercase p-1">{day}</td>
                <td className="border border-slate-800 text-center font-bold p-1 line-clamp-1 h-16 flex items-center justify-center">{division}</td>
                {periods.map(p => {
                  const entry = gridData[day][p]
                  return (
                    <React.Fragment key={p}>
                      <td className="border border-slate-800 p-2 text-center align-middle">
                        {entry ? (
                          <div className="space-y-1">
                            <div className={`font-bold uppercase leading-tight ${entry.status === 'absent' ? 'text-amber-700' : ''}`}>
                              {entry.subjectCode ? `${entry.subjectCode} : ` : ''}{entry.subjectName} ({getInitials(entry.status === 'absent' ? (entry.substituteName || entry.teacherName) : entry.teacherName)})
                            </div>
                            <div className={`text-[9px] font-semibold italic ${entry.status === 'absent' ? 'text-amber-600' : 'text-slate-600'}`}>
                              ({entry.classroomName})
                              {entry.status === 'absent' && <span className="ml-1 text-[8px] opacity-70">(SUB)</span>}
                            </div>
                          </div>
                        ) : (
                          <div className="text-slate-300">-</div>
                        )}
                      </td>
                      {p === shortBreakAfter && <td className="border border-slate-800 bg-slate-50" />}
                      {p === longBreakAfter && <td className="border border-slate-800 bg-slate-50" />}
                    </React.Fragment>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Subject Mapping Table (Footer) */}
        <div className="mt-8 grid grid-cols-2 gap-8">
          <div>
            <table className="w-full border-collapse border border-slate-800 text-[9px]">
              <thead className="bg-slate-50">
                <tr>
                  <th className="border border-slate-800 p-1 w-10 text-center">SR. NO.</th>
                  <th className="border border-slate-800 p-1 text-center">SUBJECT</th>
                  <th className="border border-slate-800 p-1 text-center">FACULTY NAME</th>
                </tr>
              </thead>
              <tbody>
                {usedSubjects.map((s, idx) => (
                  <tr key={idx}>
                    <td className="border border-slate-800 p-1 text-center font-bold">{idx + 1}</td>
                    <td className="border border-slate-800 p-1 font-medium">{s.name} {s.code ? `(${s.code})` : ''}</td>
                    <td className="border border-slate-800 p-1 uppercase">PROF. {s.faculty} ({s.facultyInitials})</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Placeholder for Batch size or other info if needed */}
          <div className="space-y-4">
            <table className="w-full border-collapse border border-slate-800 text-[9px]">
              <thead className="bg-slate-50">
                <tr>
                  <th className="border border-slate-800 p-1 text-center">BATCH SIZE / INFO</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-slate-800 p-2 h-16 italic text-slate-400 text-center">
                    Batch details and specialized group information here...
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Signature Section */}
        <div className="mt-12 grid grid-cols-3 gap-4 text-center text-[10px] items-end font-bold uppercase">
           <div className="space-y-12">
              <div className="italic text-slate-200 text-lg font-serif opacity-30">Signature</div>
              <div className="border-t border-slate-300 pt-2">
                 <div>Timetable In-Charge</div>
                 <div className="mt-1 font-normal opacity-70 italic">Prof. Neha Madgundi</div>
              </div>
           </div>
           <div className="space-y-12">
              <div className="italic text-slate-200 text-lg font-serif opacity-30">Signature</div>
              <div className="border-t border-slate-300 pt-2">
                 <div>HOD</div>
                 <div className="mt-1 font-normal opacity-70 italic">Dr. S. S. Balwant</div>
              </div>
           </div>
           <div className="space-y-12">
              <div className="italic text-slate-200 text-lg font-serif opacity-30">Signature</div>
              <div className="border-t border-slate-300 pt-2">
                 <div>Dy. Director</div>
                 <div className="mt-1 font-normal opacity-70 italic">Dr. Praveen Jangade</div>
              </div>
           </div>
        </div>
      </div>
    </div>
  )
}

// ── Main Timetable Page ───────────────────────────────────────────────────────
export default function TimetablePage() {
  const { state, dispatch } = useApp()
  const [generating, setGenerating] = useState(false)
  const [errors, setErrors] = useState([])
  const [showAbsence, setShowAbsence] = useState(false)
  const [absenceFacultyPreset, setAbsenceFacultyPreset] = useState(null)
  const [filterBatch, setFilterBatch] = useState('all')
  const [filterDay, setFilterDay] = useState('all')
  const [view, setView] = useState('grid') // grid | list | official
  const { settings, timetable, faculty, subjects, batches, classrooms, absences } = state

  const handleGenerate = () => {
    setGenerating(true)
    setErrors([])
    setTimeout(() => {
      const result = generateTimetable(faculty, subjects, batches, classrooms, settings)
      dispatch({ type: 'SET_TIMETABLE', payload: result.timetable })
      setErrors(result.errors)
      setGenerating(false)
    }, 800)
  }

  const handleClear = () => {
    if (confirm('Clear all timetable entries?')) {
      dispatch({ type: 'CLEAR_TIMETABLE' })
      dispatch({ type: 'LOAD_STATE', payload: { ...state, timetable: [], absences: [] } })
      setErrors([])
    }
  }

  const openAbsenceModal = (facultyId = null) => {
    setAbsenceFacultyPreset(facultyId)
    setShowAbsence(true)
  }

  const handlePrint = () => {
    window.print()
  }

  const restoreTeacher = (entryId) => {
    const entry = timetable.find(e => e.id === entryId)
    if (!entry) return
    dispatch({ type: 'UPDATE_TIMETABLE_ENTRY', payload: { ...entry, status: 'scheduled', substituteId: null, substituteName: null } })
  }

  const days = settings.days || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
  const periods = Array.from({ length: settings.periodsPerDay || 8 }, (_, i) => i + 1)

  const filteredTimetable = useMemo(() => {
    let tt = timetable
    if (filterBatch !== 'all') tt = tt.filter(e => e.batchId === filterBatch)
    if (filterDay !== 'all') tt = tt.filter(e => e.day === filterDay)
    return tt
  }, [timetable, filterBatch, filterDay])

  const absentCount = timetable.filter(e => e.status === 'absent').length
  const activeDays = filterDay !== 'all' ? [filterDay] : days

  // Group for grid view: day -> period -> [entries]
  const gridData = useMemo(() => {
    const map = {}
    for (const day of activeDays) {
      map[day] = {}
      for (const p of periods) {
        map[day][p] = filteredTimetable.filter(e => e.day === day && e.period === p)
      }
    }
    return map
  }, [filteredTimetable, activeDays, periods])

  const todayAbsences = useMemo(() => {
    return absences.filter(a => {
      if (!a.date) return false
      return new Date(a.date).toDateString() === new Date().toDateString()
    })
  }, [absences])

  return (
    <div className="p-6 max-w-full">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6 print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Timetable</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {timetable.length} scheduled entries
            {absentCount > 0 && ` · `}
            {absentCount > 0 && <span className="text-amber-600 font-medium">{absentCount} absent</span>}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 print:hidden">
          {timetable.length > 0 && (
            <button
              onClick={() => openAbsenceModal()}
              className="btn-secondary flex items-center gap-2 border-amber-200 text-amber-700 hover:bg-amber-50"
            >
              <UserX size={16} /> Mark Absence
            </button>
          )}
          {view === 'official' && (
            <button onClick={handlePrint} className="btn-primary flex items-center gap-2 bg-slate-800 hover:bg-slate-900 border-0">
              <Printer size={16} /> Print PDF
            </button>
          )}
          {timetable.length > 0 && (
            <button onClick={handleClear} className="btn-secondary flex items-center gap-2 text-red-600">
              <RefreshCw size={16} className="rotate-180" /> Clear
            </button>
          )}
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="btn-primary flex items-center gap-2"
          >
            {generating ? <Loader size={16} className="animate-spin" /> : <Zap size={16} />}
            {generating ? 'Generating...' : timetable.length > 0 ? 'Regenerate' : 'Generate Timetable'}
          </button>
        </div>
      </div>

      {/* Errors */}
      {errors.length > 0 && (
        <div className="card p-4 mb-5 border-amber-200 bg-amber-50">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={16} className="text-amber-600" />
            <span className="font-medium text-amber-800 text-sm">Scheduling Notes</span>
          </div>
          <ul className="space-y-1">
            {errors.map((e, i) => <li key={i} className="text-xs text-amber-700 flex gap-1"><span>•</span>{e}</li>)}
          </ul>
        </div>
      )}

      {/* Absent Today Alert */}
      {todayAbsences.length > 0 && (
        <div className="card p-4 mb-5 border-red-200 bg-red-50">
          <div className="flex items-center gap-2 mb-2">
            <UserX size={16} className="text-red-600" />
            <span className="font-medium text-red-800 text-sm">Absent Today</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {todayAbsences.map(a => {
              const f = faculty.find(f => f.id === a.facultyId)
              return (
                <div key={a.id} className="flex items-center gap-2 bg-white rounded-lg px-3 py-1.5 border border-red-200">
                  <span className="text-sm font-medium text-red-700">{f?.name || 'Unknown'}</span>
                  {a.reason && <span className="text-xs text-red-400">{a.reason}</span>}
                  <button
                    onClick={() => dispatch({ type: 'REMOVE_ABSENCE', payload: a.id })}
                    className="text-red-300 hover:text-red-500 ml-1"
                    title="Remove absence"
                  >
                    <XCircle size={14} />
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {timetable.length === 0 && !generating && (
        <div className="card p-16 text-center">
          <CalendarDays size={56} className="mx-auto text-slate-200 mb-4" />
          <h2 className="text-lg font-semibold text-slate-700 mb-2">No Timetable Generated</h2>
          <p className="text-sm text-slate-400 max-w-md mx-auto mb-6">
            Set up your faculty, subjects, and batches with subject assignments, then click Generate Timetable.
          </p>
          <div className="flex justify-center gap-3 flex-wrap">
            {faculty.length === 0 && <span className="badge-red">Add Faculty</span>}
            {subjects.length === 0 && <span className="badge-red">Add Subjects</span>}
            {batches.length === 0 && <span className="badge-red">Add Batches</span>}
            {batches.length > 0 && !batches.some(b => (b.subjectAssignments || []).length > 0) && (
              <span className="badge-yellow">Assign subjects to batches</span>
            )}
          </div>
          <button onClick={handleGenerate} className="btn-primary mt-6 inline-flex items-center gap-2">
            <Zap size={16} /> Generate Timetable
          </button>
        </div>
      )}

      {timetable.length > 0 && (
        <>
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3 mb-5 print:hidden">
            <select
              className="input w-auto py-1.5 text-sm"
              value={filterBatch}
              onChange={e => setFilterBatch(e.target.value)}
            >
              <option value="all">All Batches</option>
              {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
            <select
              className="input w-auto py-1.5 text-sm"
              value={filterDay}
              onChange={e => setFilterDay(e.target.value)}
            >
              <option value="all">All Days</option>
              {days.map(d => <option key={d}>{d}</option>)}
            </select>
            <div className="flex rounded-lg border border-slate-200 overflow-hidden ml-auto print:hidden">
              {['grid', 'list', 'official'].map(v => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`px-3 py-1.5 text-sm font-medium capitalize transition-colors ${
                    view === v ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >{v === 'official' ? 'Official Sheet' : v}</button>
              ))}
            </div>
          </div>

          {/* Official Sheet View */}
          {view === 'official' && (
            <OfficialTimetable
              timetable={filteredTimetable}
              settings={settings}
              activeDays={activeDays}
              periods={periods}
              subjects={subjects}
              faculty={faculty}
            />
          )}

          {/* Grid View */}
          {view === 'grid' && (
            <div className="overflow-x-auto">
              <div className="min-w-[700px]">
                {/* Header row */}
                <div
                  className="grid gap-2 mb-2"
                  style={{ gridTemplateColumns: `80px repeat(${activeDays.length}, 1fr)` }}
                >
                  <div />
                  {activeDays.map(day => (
                    <div key={day} className="text-center text-sm font-semibold text-slate-700 py-1">{day}</div>
                  ))}
                </div>

                {/* Period rows */}
                {periods.map(p => (
                  <div
                    key={p}
                    className="grid gap-2 mb-2"
                    style={{ gridTemplateColumns: `80px repeat(${activeDays.length}, 1fr)` }}
                  >
                    {/* Period label */}
                    <div className="flex flex-col items-center justify-center text-center pr-2">
                      <div className="text-xs font-bold text-slate-700">P{p}</div>
                      <div className="text-xs text-slate-400 leading-tight">{getPeriodTime(p, settings)}</div>
                    </div>

                    {/* Cells */}
                    {activeDays.map(day => {
                      const cellEntries = gridData[day]?.[p] || []
                      return (
                        <div key={day} className="space-y-1">
                          {cellEntries.length === 0 ? (
                            <div className="min-h-[60px] bg-slate-50 rounded-lg border border-dashed border-slate-200" />
                          ) : (
                            cellEntries.map(entry => (
                              <PeriodCell
                                key={entry.id}
                                entry={entry}
                                settings={settings}
                                onMarkAbsent={(fId) => openAbsenceModal(fId)}
                              />
                            ))
                          )}
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* List View */}
          {view === 'list' && (
            <div className="space-y-2">
              {filteredTimetable.length === 0 ? (
                <div className="card p-8 text-center text-slate-400">No entries match your filters.</div>
              ) : (
                filteredTimetable
                  .sort((a, b) => {
                    const di = days.indexOf(a.day) - days.indexOf(b.day)
                    return di !== 0 ? di : a.period - b.period
                  })
                  .map(entry => (
                    <div key={entry.id} className={`card p-4 flex items-center gap-4 ${entry.status === 'absent' ? 'border-amber-200 bg-amber-50' : ''}`}>
                      <div
                        className="w-2 h-10 rounded-full shrink-0"
                        style={{ backgroundColor: entry.subjectColor || '#4F46E5' }}
                      />
                      <div className="w-20 shrink-0">
                        <div className="text-xs font-medium text-slate-700">{entry.day}</div>
                        <div className="text-xs text-slate-500">P{entry.period}</div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-slate-800 text-sm truncate">{entry.subjectName}</div>
                        <div className="text-xs text-slate-500 truncate">{entry.batchName} · {entry.classroomName}</div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-sm text-slate-700">{entry.teacherName}</div>
                        {entry.status === 'absent' && (
                          <div className="text-xs text-amber-600">
                            Sub: {entry.substituteName || 'TBD'}
                          </div>
                        )}
                      </div>
                      <div className="shrink-0">
                        {entry.status === 'absent' ? (
                          <span className="badge-yellow flex items-center gap-1">
                            <AlertTriangle size={10} /> Absent
                          </span>
                        ) : (
                          <span className="badge-green flex items-center gap-1">
                            <CheckCircle size={10} /> OK
                          </span>
                        )}
                      </div>
                      <div className="shrink-0 flex gap-1">
                        {entry.status === 'absent' ? (
                          <button
                            onClick={() => restoreTeacher(entry.id)}
                            className="btn-ghost text-green-600 p-1.5 text-xs"
                            title="Restore teacher"
                          >
                            <UserCheck size={14} />
                          </button>
                        ) : (
                          <button
                            onClick={() => openAbsenceModal(entry.teacherId)}
                            className="btn-ghost text-amber-600 p-1.5 text-xs"
                            title="Mark absent"
                          >
                            <UserX size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
              )}
            </div>
          )}

          {/* Legend */}
          <div className="mt-6 card p-4 flex flex-wrap gap-4 text-xs text-slate-600 print:hidden">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-indigo-100 border border-indigo-300" />
              Scheduled
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-amber-100 border border-amber-300" />
              Absent (substitute assigned)
            </div>
            <div className="flex items-center gap-1.5">
              <AlertTriangle size={12} className="text-amber-500" />
              Click a cell for details
            </div>
          </div>
        </>
      )}

      {/* Absent Today Alert */}
      {todayAbsences.length > 0 && (
        <div className="card p-4 mb-5 border-red-200 bg-red-50 print:hidden">
          <div className="flex items-center gap-2 mb-2">
            <UserX size={16} className="text-red-600" />
            <span className="font-medium text-red-800 text-sm">Absent Today</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {todayAbsences.map(a => {
              const f = faculty.find(f => f.id === a.facultyId)
              return (
                <div key={a.id} className="flex items-center gap-2 bg-white rounded-lg px-3 py-1.5 border border-red-200">
                  <span className="text-sm font-medium text-red-700">{f?.name || 'Unknown'}</span>
                  {a.reason && <span className="text-xs text-red-400">{a.reason}</span>}
                  <button
                    onClick={() => dispatch({ type: 'REMOVE_ABSENCE', payload: a.id })}
                    className="text-red-300 hover:text-red-500 ml-1"
                    title="Remove absence"
                  >
                    <XCircle size={14} />
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Modals */}
      {showAbsence && (
        <Modal title="Mark Teacher Absent" onClose={() => setShowAbsence(false)}>
          <AbsenceModal onClose={() => setShowAbsence(false)} />
        </Modal>
      )}
    </div>
  )
}
