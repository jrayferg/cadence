# Calendar Page Overhaul Design

**Date:** 2026-02-22
**Scope:** Bug fixes + UI/UX improvements to the Calendar page

---

## 1. Bug Fix: Hover Tooltip Flickering

**Problem:** Hovering over a lesson block in Day/Week view causes the tooltip to flicker or the lesson to visually disappear. The `onMouseMove` handler updates `hoveredLesson` state on every pixel of movement, triggering full re-renders of CalendarView and its children. During re-render, `onMouseLeave` fires, clearing the state, creating a render loop.

**Solution:**
- Store tooltip **position** (x, y) in a `useRef` and update the tooltip DOM element directly (bypassing React re-renders for mouse movement)
- Store tooltip **content** (lesson + student identity) in state, but only update on `onMouseEnter` / `onMouseLeave`
- Add a 50ms debounce to `onMouseLeave` so brief re-render-induced leave events don't clear the tooltip
- Remove `onMouseMove` handler from LessonBlock entirely

**Files:** `CalendarView.jsx`, `LessonBlock.jsx`, `DayView.jsx`, `WeekView.jsx`

---

## 2. Scheduling Conflict Detection

**Problem:** Teachers can accidentally double-book time slots with no warning.

**Solution:** Warn + confirm approach.

### Conflict detection utility
Create `detectConflicts(newLesson, existingLessons)` in a new file `src/utils/conflictDetection.js`:
- Inputs: a lesson object `{ date, time, duration }` and the full lessons array
- For the same date, compute time ranges: `[startMinutes, endMinutes)` for both new and existing lessons
- Return array of overlapping lessons (only `status === 'scheduled'` lessons count as conflicts)

### Integration in AddLessonModal
- On form submit, run `detectConflicts` before calling `onSave`
- If conflicts found, show an inline warning panel (amber background) listing each conflicting lesson: student name, time, and duration
- Two buttons: "Go Back" (dismiss warning) and "Schedule Anyway" (proceed with save)
- For recurring lessons: check each generated date, collect all conflicts, show grouped by date

### Integration in drag-and-drop
- On drop in CalendarView, run `detectConflicts` for the new date/time
- If conflicts, show a confirmation dialog before completing the move

**Files:** New `src/utils/conflictDetection.js`, `AddLessonModal.jsx`, `CalendarView.jsx`

---

## 3. Week View Column Alignment

**Problem:** The day header columns and the scrollable time grid columns are in separate containers. When the time grid has a vertical scrollbar, it steals ~15px of width, making grid columns narrower than header columns.

**Solution:**
- Move the day header row inside the scrollable container
- Apply `position: sticky; top: 0; z-index: 10` with a background color to the header row
- This keeps the header visible while scrolling vertically and perfectly aligned with the grid columns since they share the same scroll context

**Files:** `WeekView.jsx`

---

## 4. Month View: Click Any Day to Schedule

**Problem:** `handleDayClick` in MonthView only opens the Schedule Lesson modal when a day has zero lessons.

**Solution:**
- Remove the `dayLessons.length === 0` guard from `handleDayClick` — always open AddLessonModal on day-number click
- Add a small "+" icon button that appears on hover in each day cell for visual affordance
- Clicking a lesson still opens LessonDetailModal (these are separate click targets: day number vs. lesson button)

**Files:** `MonthView.jsx`

---

## 5. Calendar Starts at 7:00 AM

**Problem:** Day and Week views render from 12:00 AM, forcing the user to scroll down every time.

**Solution:**
- Add a `useRef` to the scrollable time grid container in both DayView and WeekView
- On mount, use `useEffect` to scroll to the 7 AM row: `scrollRef.current.scrollTop = 7 * hourHeight`
- Still render all 24 hours so early/late lessons remain accessible
- The hour height is 60px (see Section 6), so scroll to `7 * 60 = 420px`

**Files:** `DayView.jsx`, `WeekView.jsx`

---

## 6. Google Calendar-Style Lesson Blocks

**Problem:** All lesson blocks are the same height regardless of duration. A 15-minute lesson looks identical to a 60-minute lesson.

**Solution:** Absolute positioning within a fixed-height-per-hour grid.

### Hour grid layout
- Each hour row has a **fixed height of 60px** (1px per minute)
- Hour rows are `position: relative` to serve as positioning context
- Remove the 4-quarter subdivision — lessons now position freely within the continuous grid

### Lesson block positioning
- Each lesson is `position: absolute` within a day column
- `top` = `(startHour * 60 + startMinute) * 1px` from the top of the full grid
- `height` = `duration * 1px` (e.g., 30 min = 30px, 60 min = 60px, 15 min = 15px)
- Lessons that span across hour boundaries naturally extend visually

### Lesson block content
- **Line 1:** Student Name (bold, truncated)
- **Line 2:** Lesson Type (e.g., "Private Lesson")
- **Line 3:** Lesson Time (e.g., "3:30 PM")
- For short lessons (15 min / 15px height): show only student name, single line, smaller font
- For medium lessons (30 min / 30px): show student name + lesson type
- For long lessons (45+ min): show all three lines

### Overlap handling
- When multiple lessons overlap on the same day, divide available column width equally
- First overlapping lesson gets `left: 0; width: 50%`, second gets `left: 50%; width: 50%`
- For 3+ overlaps, divide into thirds, etc.

### Click targets for empty slots
- Empty areas remain clickable to schedule new lessons
- On click, compute the time from the click's Y position within the day column
- Snap to nearest 15-minute interval

### Status colors (unchanged)
- Blue: Scheduled
- Green: Completed
- Red: Cancelled

**Files:** `DayView.jsx`, `WeekView.jsx`, `LessonBlock.jsx`

---

## 7. Sidebar & Layout: More Space for Calendar

**Problem:** The sidebar uses `w-64` (256px), leaving less room for the calendar grid.

**Solution:**
- Reduce desktop sidebar from `w-64` to `w-48` (192px)
- Tighten internal padding from `p-6` to `p-4`
- Keep icon + text layout, just more compact
- Remove `max-h-[600px]` on week view time grid — let it breathe with more vertical space (auto-scroll to 7 AM handles the initial position)
- Net gain: ~64px more horizontal space for calendar content

**Files:** `Sidebar.jsx`, `WeekView.jsx`

---

## Summary of Files Touched

| File | Changes |
|------|---------|
| `src/utils/conflictDetection.js` | **New** — conflict detection utility |
| `src/features/calendar/CalendarView.jsx` | Hover ref system, conflict check on drag-drop |
| `src/features/calendar/DayView.jsx` | Absolute positioning grid, auto-scroll to 7 AM |
| `src/features/calendar/WeekView.jsx` | Sticky header, absolute positioning grid, auto-scroll, remove max-h |
| `src/features/calendar/MonthView.jsx` | Always-open day click, hover "+" button |
| `src/features/calendar/AddLessonModal.jsx` | Conflict warning panel with confirm |
| `src/components/ui/LessonBlock.jsx` | Absolute positioning, 3-line content, size-adaptive display |
| `src/components/layout/Sidebar.jsx` | Reduce width to w-48 |
