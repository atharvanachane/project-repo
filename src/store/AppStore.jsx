import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'

const STORAGE_KEY = 'nexora_data'

const initialState = {
  faculty: [],
  subjects: [],
  classrooms: [],
  batches: [],
  timetable: [],
  absences: [],
  settings: {
    periodsPerDay: 8,
    daysPerWeek: 5,
    startTime: '08:00',
    periodDuration: 45,
    shortBreakAfterPeriod: 2,
    shortBreakDuration: 15,
    longBreakAfterPeriod: 4,
    longBreakDuration: 30,
    days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    universityName: 'G H RAISONI INTERNATIONAL SKILL TECH UNIVERSITY, PUNE',
    schoolName: 'SCHOOL OF ENGINEERING & TECHNOLOGY',
    session: '2025-2026 [EVEN TERM]',
    wefDate: '09/01/2026',
    semester: 'B.Tech SEM-III',
    division: 'DIV - SA1',
  }
}

function reducer(state, action) {
  switch (action.type) {
    // FACULTY
    case 'ADD_FACULTY':
      return { ...state, faculty: [...state.faculty, { ...action.payload, id: uuidv4(), createdAt: Date.now() }] }
    case 'UPDATE_FACULTY':
      return { ...state, faculty: state.faculty.map(f => f.id === action.payload.id ? { ...f, ...action.payload } : f) }
    case 'DELETE_FACULTY':
      return { ...state, faculty: state.faculty.filter(f => f.id !== action.payload) }

    // SUBJECTS
    case 'ADD_SUBJECT':
      return { ...state, subjects: [...state.subjects, { ...action.payload, id: uuidv4(), createdAt: Date.now() }] }
    case 'UPDATE_SUBJECT':
      return { ...state, subjects: state.subjects.map(s => s.id === action.payload.id ? { ...s, ...action.payload } : s) }
    case 'DELETE_SUBJECT':
      return { ...state, subjects: state.subjects.filter(s => s.id !== action.payload) }

    // CLASSROOMS
    case 'ADD_CLASSROOM':
      return { ...state, classrooms: [...state.classrooms, { ...action.payload, id: uuidv4(), createdAt: Date.now() }] }
    case 'UPDATE_CLASSROOM':
      return { ...state, classrooms: state.classrooms.map(c => c.id === action.payload.id ? { ...c, ...action.payload } : c) }
    case 'DELETE_CLASSROOM':
      return { ...state, classrooms: state.classrooms.filter(c => c.id !== action.payload) }

    // BATCHES
    case 'ADD_BATCH':
      return { ...state, batches: [...state.batches, { ...action.payload, id: uuidv4(), createdAt: Date.now() }] }
    case 'UPDATE_BATCH':
      return { ...state, batches: state.batches.map(b => b.id === action.payload.id ? { ...b, ...action.payload } : b) }
    case 'DELETE_BATCH':
      return { ...state, batches: state.batches.filter(b => b.id !== action.payload) }

    // TIMETABLE
    case 'SET_TIMETABLE':
      return { ...state, timetable: action.payload }
    case 'CLEAR_TIMETABLE':
      return { ...state, timetable: [] }

    // ABSENCES
    case 'ADD_ABSENCE':
      return { ...state, absences: [...state.absences, { ...action.payload, id: uuidv4(), createdAt: Date.now() }] }
    case 'REMOVE_ABSENCE':
      return { ...state, absences: state.absences.filter(a => a.id !== action.payload) }
    case 'UPDATE_TIMETABLE_ENTRY':
      return {
        ...state,
        timetable: state.timetable.map(entry =>
          entry.id === action.payload.id ? { ...entry, ...action.payload } : entry
        )
      }

    // SETTINGS
    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.payload } }

    // LOAD
    case 'LOAD_STATE':
      return { ...initialState, ...action.payload }

    default:
      return state
  }
}

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState, (initial) => {
    try {
      let saved = localStorage.getItem(STORAGE_KEY)
      if (!saved) {
        // Migration check for old app name data
        const oldData = localStorage.getItem('smarttt_data')
        if (oldData) {
          localStorage.setItem(STORAGE_KEY, oldData)
          localStorage.removeItem('smarttt_data')
          saved = oldData
        }
      }
      return saved ? { ...initial, ...JSON.parse(saved) } : initial
    } catch {
      return initial
    }
  })

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)) } catch { }
  }, [state])

  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be inside AppProvider')
  return ctx
}
