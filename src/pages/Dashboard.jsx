import React from 'react'
import { Link } from 'react-router-dom'
import {
  Building2, BookOpen, Users, GraduationCap,
  CalendarDays, AlertTriangle, Plus, ArrowRight,
  TrendingUp, Clock
} from 'lucide-react'
import { useApp } from '../store/AppStore'

function StatCard({ icon: Icon, label, value, color, to }) {
  return (
    <Link to={to} className="card p-5 hover:shadow-md transition-shadow flex items-center gap-4 group">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={22} className="text-white" />
      </div>
      <div>
        <div className="text-2xl font-bold text-slate-800">{value}</div>
        <div className="text-sm text-slate-500">{label}</div>
      </div>
      <ArrowRight size={16} className="ml-auto text-slate-300 group-hover:text-slate-500 transition-colors" />
    </Link>
  )
}

function QuickAction({ icon: Icon, label, desc, to, color }) {
  return (
    <Link to={to} className="card p-4 hover:shadow-md transition-shadow flex items-center gap-4 group">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={18} className="text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-slate-800">{label}</div>
        <div className="text-xs text-slate-400 truncate">{desc}</div>
      </div>
      <Plus size={16} className="text-slate-300 group-hover:text-indigo-500 transition-colors" />
    </Link>
  )
}

export default function Dashboard() {
  const { state } = useApp()
  const { faculty, subjects, classrooms, batches, timetable, absences } = state

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
  const absentToday = absences.filter(a => {
    if (!a.date) return false
    return new Date(a.date).toDateString() === new Date().toDateString()
  })

  const scheduledToday = timetable.filter(e => {
    const dayMap = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    return e.day === dayMap[new Date().getDay()]
  })

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Welcome to Smart Timetable Scheduler. Here's an overview of your system.</p>
        <p className="text-xs text-slate-400 mt-0.5">{today}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <StatCard icon={Building2} label="Classrooms" value={classrooms.length} color="bg-blue-500" to="/classrooms" />
        <StatCard icon={BookOpen} label="Subjects" value={subjects.length} color="bg-green-500" to="/subjects" />
        <StatCard icon={Users} label="Faculty" value={faculty.length} color="bg-purple-500" to="/faculty" />
        <StatCard icon={GraduationCap} label="Batches" value={batches.length} color="bg-orange-500" to="/batches" />
        <StatCard icon={CalendarDays} label="Scheduled Entries" value={timetable.length} color="bg-red-500" to="/timetable" />
        <StatCard icon={AlertTriangle} label="Absent Today" value={absentToday.length} color="bg-yellow-500" to="/timetable" />
      </div>

      {/* Today's snapshot */}
      {timetable.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Clock size={18} className="text-indigo-500" />
              <h2 className="font-semibold text-slate-800">Today's Schedule</h2>
              <span className="ml-auto badge-blue">{scheduledToday.length} periods</span>
            </div>
            {scheduledToday.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">No classes scheduled today</p>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto">
                {scheduledToday.slice(0, 8).map(e => (
                  <div key={e.id} className="flex items-center gap-3 p-2 rounded-lg bg-slate-50">
                    <div
                      className="w-2 h-8 rounded-full"
                      style={{ backgroundColor: e.subjectColor || '#4F46E5' }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-slate-800 truncate">{e.subjectName}</div>
                      <div className="text-xs text-slate-500">{e.batchName} · Period {e.period}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-medium text-slate-700">{e.teacherName}</div>
                      {e.status === 'absent' && (
                        <span className="badge-yellow">Sub: {e.substituteName || 'TBD'}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={18} className="text-indigo-500" />
              <h2 className="font-semibold text-slate-800">Faculty Load Summary</h2>
            </div>
            {faculty.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">No faculty added yet</p>
            ) : (
              <div className="space-y-3 max-h-56 overflow-y-auto">
                {faculty.map(f => {
                  const load = timetable.filter(e => e.teacherId === f.id).length
                  const maxLoad = state.settings.periodsPerDay * state.settings.daysPerWeek
                  const pct = Math.min(100, Math.round((load / Math.max(1, maxLoad)) * 100))
                  return (
                    <div key={f.id} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs shrink-0">
                        {f.name?.[0]?.toUpperCase() || 'F'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="font-medium text-slate-700 truncate">{f.name}</span>
                          <span className="text-slate-400 shrink-0 ml-2">{load} periods</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5">
                          <div
                            className="bg-indigo-500 h-1.5 rounded-full transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="card p-5">
        <h2 className="font-semibold text-slate-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <QuickAction icon={Building2} label="Add Classroom" desc="Add a new classroom" to="/classrooms" color="bg-blue-500" />
          <QuickAction icon={BookOpen} label="Add Subject" desc="Add a new subject" to="/subjects" color="bg-green-500" />
          <QuickAction icon={Users} label="Add Faculty" desc="Add a new faculty member" to="/faculty" color="bg-purple-500" />
          <QuickAction icon={GraduationCap} label="Add Batch" desc="Add a new batch/class" to="/batches" color="bg-orange-500" />
          <QuickAction icon={CalendarDays} label="Generate Timetable" desc="AI-powered scheduling" to="/timetable" color="bg-indigo-500" />
          <QuickAction icon={AlertTriangle} label="Mark Absence" desc="Report teacher absence" to="/timetable" color="bg-red-500" />
        </div>
      </div>
    </div>
  )
}
