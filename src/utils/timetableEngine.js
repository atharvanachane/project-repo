/**
 * Nexora Timetable Generation Engine
 * Java-inspired constraint-satisfaction scheduling algorithm
 */

export function generateTimetable(faculty, subjects, batches, classrooms, settings) {
  const { periodsPerDay, days } = settings
  const errors = []
  const timetable = []

  if (!batches.length) { errors.push('No batches defined.'); return { timetable, errors } }
  if (!faculty.length) { errors.push('No faculty defined.'); return { timetable, errors } }
  if (!subjects.length) { errors.push('No subjects defined.'); return { timetable, errors } }

  // Build assignment map: batch -> list of {subject, faculty, weeklyHours}
  const assignments = []
  for (const batch of batches) {
    for (const sa of (batch.subjectAssignments || [])) {
      const subject = subjects.find(s => s.id === sa.subjectId)
      const teacher = faculty.find(f => f.id === sa.facultyId)
      if (subject && teacher) {
        assignments.push({ batch, subject, teacher, weeklyHours: sa.weeklyHours || 3 })
      }
    }
  }

  if (!assignments.length) {
    errors.push('No subject-teacher assignments found in batches. Please assign subjects to batches.')
    return { timetable, errors }
  }

  // Slot tracker: facultyId -> Set of "day-period"
  const facultySlots = {}
  // Slot tracker: batchId -> Set of "day-period"
  const batchSlots = {}
  // Slot tracker: classroomId -> Set of "day-period"
  const roomSlots = {}

  const markSlot = (facultyId, batchId, roomId, day, period) => {
    facultySlots[facultyId] = facultySlots[facultyId] || new Set()
    facultySlots[facultyId].add(`${day}-${period}`)
    batchSlots[batchId] = batchSlots[batchId] || new Set()
    batchSlots[batchId].add(`${day}-${period}`)
    if (roomId) {
      roomSlots[roomId] = roomSlots[roomId] || new Set()
      roomSlots[roomId].add(`${day}-${period}`)
    }
  }

  const isSlotFree = (facultyId, batchId, roomId, day, period) => {
    const fBusy = facultySlots[facultyId]?.has(`${day}-${period}`) || false
    const bBusy = batchSlots[batchId]?.has(`${day}-${period}`) || false
    const rBusy = roomId ? (roomSlots[roomId]?.has(`${day}-${period}`) || false) : false
    return !fBusy && !bBusy && !rBusy
  }

  // Check if teacher works on given day/period based on workingHours
  const isTeacherAvailable = (teacher, day, period) => {
    if (!teacher.workingHours || !teacher.workingHours.length) return true
    const dayHours = teacher.workingHours.find(wh => wh.day === day)
    if (!dayHours) return false
    const startPeriod = dayHours.startPeriod || 1
    const endPeriod = dayHours.endPeriod || periodsPerDay
    return period >= startPeriod && period <= endPeriod
  }

  // Find a classroom for batch
  const findRoom = (batchId, day, period) => {
    if (!classrooms.length) return null
    const available = classrooms.filter(r => !roomSlots[r.id]?.has(`${day}-${period}`))
    return available[0] || null
  }

  const { v4: uuidv4 } = { v4: () => Math.random().toString(36).slice(2) }

  // Shuffle everything for better randomization
  const shuffle = arr => [...arr].sort(() => Math.random() - 0.5)

  // Track scheduled counts per day for batch-subject pairs to prevent theory repetition
  const batchDaySubjectCount = {}

  // Schedule each assignment
  for (const asgn of shuffle(assignments)) {
    let placed = 0
    const target = asgn.weeklyHours
    const isLab = asgn.subject.type?.toLowerCase() === 'lab' || asgn.subject.type?.toLowerCase() === 'practical'
    
    // Create all possible slots and shuffle them for randomization
    const dayPool = shuffle(days)
    
    for (const day of dayPool) {
      if (placed >= target) break

      const key = `${asgn.batch.id}-${day}-${asgn.subject.id}`
      batchDaySubjectCount[key] = batchDaySubjectCount[key] || 0
      
      // If it's a theory class and already scheduled today, skip (unless it's the only way, but usually better to spread)
      if (!isLab && batchDaySubjectCount[key] >= 1) continue

      for (let p = 1; p <= periodsPerDay; p++) {
        if (placed >= target) break

        // For Labs, try to find two consecutive periods
        if (isLab && target - placed >= 2) {
          const p1 = p
          const p2 = p + 1
          
          if (p2 <= periodsPerDay) {
            const room1 = findRoom(asgn.batch.id, day, p1)
            const room2 = findRoom(asgn.batch.id, day, p2)

            const canPlaceP1 = isTeacherAvailable(asgn.teacher, day, p1) && isSlotFree(asgn.teacher.id, asgn.batch.id, room1?.id, day, p1)
            const canPlaceP2 = isTeacherAvailable(asgn.teacher, day, p2) && isSlotFree(asgn.teacher.id, asgn.batch.id, room2?.id, day, p2)

            if (canPlaceP1 && canPlaceP2) {
              [p1, p2].forEach(period => {
                const room = (period === p1) ? room1 : room2
                timetable.push({
                  id: `${asgn.batch.id}-${asgn.subject.id}-${day}-${period}-${Math.random().toString(36).slice(2, 7)}`,
                  batchId: asgn.batch.id,
                  batchName: asgn.batch.name,
                  subjectId: asgn.subject.id,
                  subjectName: asgn.subject.name,
                  subjectCode: asgn.subject.code,
                  subjectColor: asgn.subject.color || '#4F46E5',
                  teacherId: asgn.teacher.id,
                  teacherName: asgn.teacher.name,
                  day,
                  period,
                  classroomId: room?.id || null,
                  classroomName: room?.name || 'TBD',
                  status: 'scheduled',
                  substituteId: null,
                  substituteName: null,
                })
                markSlot(asgn.teacher.id, asgn.batch.id, room?.id, day, period)
              })
              placed += 2
              batchDaySubjectCount[key] += 2
              break // Move to next day after scheduling a lab block
            }
          }
        }

        // Single period placement (Theory or remaining Lab hr)
        const room = findRoom(asgn.batch.id, day, p)
        if (isTeacherAvailable(asgn.teacher, day, p) && isSlotFree(asgn.teacher.id, asgn.batch.id, room?.id, day, p)) {
          timetable.push({
            id: `${asgn.batch.id}-${asgn.subject.id}-${day}-${p}-${Math.random().toString(36).slice(2, 7)}`,
            batchId: asgn.batch.id,
            batchName: asgn.batch.name,
            subjectId: asgn.subject.id,
            subjectName: asgn.subject.name,
            subjectCode: asgn.subject.code,
            subjectColor: asgn.subject.color || '#4F46E5',
            teacherId: asgn.teacher.id,
            teacherName: asgn.teacher.name,
            day,
            period: p,
            classroomId: room?.id || null,
            classroomName: room?.name || 'TBD',
            status: 'scheduled',
            substituteId: null,
            substituteName: null,
          })
          markSlot(asgn.teacher.id, asgn.batch.id, room?.id, day, p)
          placed++
          batchDaySubjectCount[key]++
          break // Move to next day after scheduling a theory session or single lab hour
        }
      }
    }

    if (placed < target) {
      errors.push(`Could not schedule all ${target} periods for ${asgn.subject.name} (${asgn.batch.name}). Placed ${placed}/${target}.`)
    }
  }

  return { timetable, errors }
}

export function computeSubstitute(entry, faculty, timetable, absences) {
  const absentFacultyIds = new Set(absences.filter(a => a.date === entry.date || !a.date).map(a => a.facultyId))
  const busyFacultyIds = new Set(
    timetable
      .filter(e => e.day === entry.day && e.period === entry.period && e.id !== entry.id)
      .map(e => e.teacherId)
  )

  const candidates = faculty.filter(f =>
    f.id !== entry.teacherId &&
    !absentFacultyIds.has(f.id) &&
    !busyFacultyIds.has(f.id)
  )

  return candidates[0] || null
}

export function getPeriodTime(period, settings) {
  const [h, m] = settings.startTime.split(':').map(Number)
  let totalMinutes = h * 60 + m
  const shortBreakAfter = settings.shortBreakAfterPeriod || 2
  const shortBreakDur = settings.shortBreakDuration || 15
  const longBreakAfter = settings.longBreakAfterPeriod || 4
  const longBreakDur = settings.longBreakDuration || 30
  const periodDur = settings.periodDuration || 45

  for (let i = 1; i < period; i++) {
    totalMinutes += periodDur
    if (i === shortBreakAfter) totalMinutes += shortBreakDur
    if (i === longBreakAfter) totalMinutes += longBreakDur
  }

  const startH = Math.floor(totalMinutes / 60)
  const startMin = totalMinutes % 60
  totalMinutes += periodDur
  const endH = Math.floor(totalMinutes / 60)
  const endMin = totalMinutes % 60

  const fmt = (hh, mm) => `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`
  return `${fmt(startH, startMin)} – ${fmt(endH, endMin)}`
}
