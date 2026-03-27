import React, { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, BookOpen, Users, GraduationCap,
  Building2, CalendarDays, Settings, Menu, X,
  Bell, ChevronRight, LogOut
} from 'lucide-react'
import { useApp } from '../store/AppStore'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/classrooms', icon: Building2, label: 'Classrooms' },
  { to: '/subjects', icon: BookOpen, label: 'Subjects' },
  { to: '/faculty', icon: Users, label: 'Faculty' },
  { to: '/batches', icon: GraduationCap, label: 'Batches' },
  { to: '/timetable', icon: CalendarDays, label: 'Timetable' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

export default function Layout({ children, onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { state } = useApp()
  const location = useLocation()

  const conflicts = state.timetable.filter(e => e.status === 'conflict').length

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden print:overflow-visible">
      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-60 bg-white border-r border-slate-200 flex flex-col
        transition-transform duration-200 md:translate-x-0 md:relative md:flex print:hidden
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <CalendarDays size={18} className="text-white" />
          </div>
          <span className="font-bold text-lg text-slate-800">Nexora</span>
          <button className="ml-auto md:hidden" onClick={() => setSidebarOpen(false)}>
            <X size={18} className="text-slate-400" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                }`
              }
            >
              <item.icon size={18} />
              {item.label}
              {item.label === 'Timetable' && conflicts > 0 && (
                <span className="ml-auto bg-red-100 text-red-700 text-xs px-1.5 py-0.5 rounded-full">
                  {conflicts}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm">A</div>
            <div>
              <div className="text-sm font-medium text-slate-800">admin</div>
              <div className="text-xs text-slate-400">Administrator</div>
            </div>
            <button 
              className="ml-auto text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100 transition-colors"
              onClick={onLogout}
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/30 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden print:overflow-visible">
        {/* Topbar */}
        <header className="bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-3 shrink-0 print:hidden">
          <button className="md:hidden p-1" onClick={() => setSidebarOpen(true)}>
            <Menu size={20} className="text-slate-600" />
          </button>

          {/* Breadcrumb */}
          <div className="flex items-center gap-1 text-sm text-slate-500">
            <span className="text-slate-800 font-medium">
              {navItems.find(n => n.to === location.pathname)?.label || 'Nexora'}
            </span>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <button className="relative p-2 rounded-lg hover:bg-slate-100 text-slate-500">
              <Bell size={18} />
              {conflicts > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </button>
            <div className="text-sm font-medium text-slate-600 hidden sm:block">admin</div>
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm">A</div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto print:overflow-visible">
          {children}
        </main>
      </div>
    </div>
  )
}
