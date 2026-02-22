# Cadence - Music Lesson Management Platform

**Version:** 1.0.0 MVP  
**Author:** Jorfio  
**Last Updated:** February 21, 2026  

> **A calendar-first lesson management system built for music teachers**

---

## 📖 Table of Contents

1. [Quick Start](#-quick-start)
2. [Project Overview](#-project-overview)
3. [Technical Architecture](#️-technical-architecture)
4. [File Structure Map](#-file-structure-map)
5. [Component Reference](#-component-reference)
6. [Data Models](#-data-models)
7. [Design System](#-design-system)
8. [Development Guide](#-development-guide)
9. [Deployment Guide](#-deployment-guide)
10. [Future Roadmap](#-future-roadmap)

---

## 🚀 Quick Start

### Installation (Zero Configuration!)

```bash
# Download the file
# Open cadence-mvp.html in any browser
# That's it! No npm, no build, no setup.
```

### First Time Setup

1. Enter your business name
2. Configure lesson types (e.g., "Piano - 60min, $50")
3. App loads with 50 demo students and sample lessons
4. Start scheduling!

### Clear Demo Data

```javascript
// In browser console:
localStorage.clear();
location.reload();
```

---

## 🎯 Project Overview

### What is Cadence?

Cadence is a modern music lesson management app designed for **individual instructors** teaching 10-50 students. Complete rebuild of OMNIS v1 (which served 2,500+ users).

### Core Features

| Feature | Description |
|---------|-------------|
| **📅 Calendar** | 5 views (Day, Week, Month, Year, List) with drag-and-drop |
| **👥 Students** | Full profiles with parent info, emergency contacts, addresses |
| **💰 Billing** | Revenue tracking, student breakdown, financial reports |
| **🌙 Dark Mode** | Complete dark theme throughout |
| **📱 Responsive** | Works on desktop, tablet, mobile |
| **⌨️ Shortcuts** | Keyboard navigation (D/W/M/Y, arrows, P for print) |

### Perfect For

- Private music teachers
- Independent instructors
- Small studios (1-3 teachers)
- Anyone managing 10-50 students

---

## 🏗️ Technical Architecture

### The Stack

```
Single HTML File
├── React 18 (via Babel Standalone)
├── Tailwind CSS (via CDN)
└── localStorage (data persistence)
```

**Zero dependencies. Zero build process. Just open and go.**

### Why Single File?

✅ **Instant deployment** - Upload one file  
✅ **No build step** - Edit and refresh  
✅ **Easy to understand** - Everything in one place  
✅ **Perfect for MVP** - Fast iteration  
✅ **Portable** - Email the file, works anywhere  

### When to Refactor?

Move to Create React App / Next.js when:
- More than 5 developers
- More than 5,000 lines of code
- Need TypeScript
- Backend integration ready
- Need advanced tooling

---

## 📁 File Structure Map

```
cadence-mvp.html (3,861 lines)
│
├── Lines 1-50: HTML Structure
│   └── CDN links, Tailwind config, root div
│
├── Lines 51-109: Custom Styles
│   ├── Scrollbar styling
│   ├── Loading spinner
│   └── Animations (fade-in, slide-up)
│
├── Lines 111-275: Icon Components
│   └── Calendar, Users, DollarSign, Plus, X, Chevron, CheckCircle
│
├── Lines 277-295: Utility Functions
│   └── formatTime12Hour() - Convert 24h to 12h AM/PM
│
├── Lines 297-325: Custom Hooks
│   └── useLocalStorage() - Persistent state management
│
├── Lines 327-513: Main App (CadenceApp)
│   └── Root component - routing, global state, setup wizard
│
├── Lines 516-555: Header Component
│   └── Top nav bar with logo, page title, dark mode toggle
│
├── Lines 558-583: Sidebar Component
│   └── Left navigation menu (Calendar, Students, Billing)
│
├── Lines 586-2536: Calendar System
│   ├── CalendarView - Main container
│   ├── DayView - Hour-by-hour schedule
│   ├── WeekView - 7-day grid
│   ├── MonthView - Monthly calendar
│   ├── YearView - 12-month overview
│   ├── ScheduleListView - Chronological list
│   ├── AddLessonModal - Schedule new lessons
│   ├── RescheduleModal - Move lessons
│   └── RecurringSetupModal - Recurring lessons
│
├── Lines 2539-3155: Student System
│   ├── StudentsView - Main container
│   ├── StudentProfileView - Read-only profile display
│   ├── StudentCard - Grid card component
│   ├── StudentListView - Table view
│   └── AddStudentModal - Add/edit students (scrolling form)
│
├── Lines 3474-3711: Billing System
│   └── BillingView - Revenue dashboard
│
└── Lines 3713-3861: App Initialization
    └── Demo data generation and root render
```

---

## 🧩 Component Reference

### Quick Navigation

| Component | Line | Purpose |
|-----------|------|---------|
| `CadenceApp` | 327 | Root app, routing, state |
| `Header` | 516 | Top navigation bar |
| `Sidebar` | 558 | Left menu |
| `CalendarView` | 586 | Calendar container |
| `DayView` | 1320 | Hourly schedule |
| `WeekView` | 1472 | 7-day grid |
| `MonthView` | 1652 | Monthly calendar |
| `YearView` | 1852 | 12-month overview |
| `ScheduleListView` | 2002 | List view |
| `AddLessonModal` | 2200 | Schedule lessons |
| `StudentsView` | 2539 | Students container |
| `StudentProfileView` | 2829 | Profile display |
| `StudentCard` | 3033 | Card view |
| `StudentListView` | 2721 | Table view |
| `AddStudentModal` | 3157 | Add/edit students |
| `BillingView` | 3474 | Revenue dashboard |

### Component Details

#### `CadenceApp` (Main App)

**Location:** Lines 327-513

**Purpose:** Root component managing global application state

**State:**
```javascript
user              // Business info, lesson types
setupComplete     // First-time setup flag
students          // Array of student objects
lessons           // Array of lesson objects  
currentView       // Active page (calendar/students/billing)
darkMode          // Theme preference
```

**Key Functions:**
```javascript
handleSetupComplete()  // Finish first-time setup
setCurrentView()       // Navigate between pages
setDarkMode()          // Toggle dark theme
```

---

#### `CalendarView` (Calendar Container)

**Location:** Lines 586-1318

**Purpose:** Main calendar with view switching and navigation

**State:**
```javascript
currentDate              // Selected date
view                     // 'day'|'week'|'month'|'year'|'schedule'
searchQuery              // Filter lessons/students
showKeyboardShortcuts    // Help modal
showAddLesson            // Add lesson modal
editingLesson            // Lesson being edited
lessonToReschedule       // Lesson being moved
```

**Features:**
- 5 view modes with dropdown selector
- Date navigation (prev/next/today buttons)
- Live search across lessons and students
- Keyboard shortcuts (see below)
- Print functionality
- Export to text file

**Keyboard Shortcuts:**
```
D = Day view
W = Week view
M = Month view
Y = Year view
S = Schedule (list) view
T = Today (jump to current date)
← = Previous day/week/month
→ = Next day/week/month
P = Print calendar
```

---

#### `DayView` (Hour-by-Hour Schedule)

**Location:** Lines 1320-1470

**Layout:**
```
┌──────────────────────────────┐
│ 12:00 AM                     │
│   [12:15 AM - John - Piano]  │
│   [12:30 AM - Sarah - Guitar]│
├──────────────────────────────┤
│ 1:00 AM                      │
│   (click to schedule)        │
├──────────────────────────────┤
│ 2:00 AM                      │
│ ...continues to 11:00 PM     │
└──────────────────────────────┘
```

**Features:**
- 24-hour coverage (12 AM - 11 PM)
- 15-minute time intervals
- Lessons sorted by time within each hour
- Color-coded by status (blue=scheduled, green=completed, red=cancelled)
- Current time indicator (shows "now" line)
- Click empty time slot to schedule
- Drag lesson to reschedule

**How It Works:**
```javascript
// Groups lessons by hour
const lessonsByHour = {};
for (let hour = 0; hour <= 23; hour++) {
  lessonsByHour[hour] = lessons
    .filter(lesson => lesson hour matches)
    .sort by time;
}
```

---

#### `WeekView` (7-Day Grid)

**Location:** Lines 1472-1650

**Layout:**
```
┌────┬────┬────┬────┬────┬────┬────┐
│ Mon│ Tue│ Wed│ Thu│ Fri│ Sat│ Sun│
├────┼────┼────┼────┼────┼────┼────┤
│ 8am│    │Lsn │    │Lsn │    │    │
│ 9am│Lsn │    │Lsn │    │    │Lsn │
│10am│    │Lsn │    │    │Lsn │    │
│ ... continues ... │
└────┴────┴────┴────┴────┴────┴────┘
```

**Features:**
- Monday - Sunday columns
- Same 24-hour coverage as day view
- Current day highlighted
- Time indicator on today only
- Drag lessons across days

---

#### `MonthView` (Calendar Grid)

**Location:** Lines 1652-1850

**Layout:**
```
┌────────────── February 2026 ──────────────┐
│ Sun  Mon  Tue  Wed  Thu  Fri  Sat         │
├────┬────┬────┬────┬────┬────┬────────────┤
│    │    │    │    │    │    │ 1  [3 lsn] │
├────┼────┼────┼────┼────┼────┼────────────┤
│ 2  │ 3  │ 4  │ 5  │ 6  │ 7  │ 8          │
│[2] │[1] │    │[4] │[2] │[5] │ +3 more    │
└────┴────┴────┴────┴────┴────┴────────────┘
```

**Features:**
- Traditional calendar grid
- Shows lesson count per day
- "+X more" popup when > 3 lessons
- Click day to view all lessons in popup
- Click empty day to schedule new lesson
- Days from other months grayed out

---

#### `YearView` (Annual Overview)

**Location:** Lines 1852-2000

**Purpose:** 12-month overview showing lesson density

**Features:**
- Grid of 12 mini calendars
- Lesson count displayed per month
- Click month to jump to month view
- Current month highlighted

---

#### `ScheduleListView` (Chronological List)

**Location:** Lines 2002-2150

**Purpose:** All lessons in chronological order

**Layout:**
```
February 2026
├── Mon, Feb 3, 2:00 PM - John Smith - Piano 60min - $50
├── Mon, Feb 3, 3:00 PM - Sarah Johnson - Guitar 30min - $30
├── Tue, Feb 4, 10:00 AM - Mike Davis - Drums 60min - $55
└── ...

March 2026
├── Sat, Mar 1, 9:00 AM - Emma Thompson - Piano 45min - $45
└── ...
```

**Features:**
- Grouped by month
- Shows full details (student, type, time, rate)
- Quick status toggle (complete/incomplete)
- Edit and delete actions
- Infinite scroll (all lessons)

---

#### `StudentProfileView` (Read-Only Profile)

**Location:** Lines 2829-3030

**Purpose:** Beautiful student profile display

**Layout:**
```
┌────────────────────────────────────────┐
│ [IMG] John Smith          [Edit] [X]   │
├─────────────────┬──────────────────────┤
│ Left Column     │ Right Column         │
├─────────────────┼──────────────────────┤
│ Contact Info    │ Stats (3 cards)      │
│ - Email         │ - Upcoming: 3        │
│ - Phone         │ - Completed: 25      │
│ - DOB           │ - Revenue: $1,250    │
├─────────────────┼──────────────────────┤
│ Address         │ Upcoming Lessons     │
│ 123 Main St     │ - Mon, Feb 24, 2pm   │
│ Dallas, TX      │ - Wed, Feb 26, 2pm   │
├─────────────────┤ - Fri, Feb 28, 2pm   │
│ Emergency       │                      │
│ Contact         │                      │
├─────────────────┤                      │
│ Lesson          │                      │
│ Preferences     │                      │
└─────────────────┴──────────────────────┘
```

**Features:**
- Profile image display
- Contact information
- Address (student or parent based on age)
- Emergency contact (if provided)
- Lesson preferences
- 3 stat cards (upcoming, completed, revenue)
- Next 5 upcoming lessons
- Edit button opens modal

---

#### `AddStudentModal` (Student Form)

**Location:** Lines 3157-3620

**Purpose:** Comprehensive student form with perfect scrolling

**Structure:**
```
┌─────────────────────────────────┐
│ FIXED HEADER - Edit Student [X]│ ← Always visible
├─────────────────────────────────┤
│ ↕ SCROLLABLE CONTENT            │
│                                 │
│ 1. Student Information          │
│    ┌─────┐                      │
│    │ IMG │ Profile Image URL    │
│    └─────┘ [https://...]        │
│    Name: [________________]     │
│    Email │ Phone │ DOB          │
│    [____] [_____] [________]    │
│    Address (if 18+)              │
│                                 │
│ 2. ☑ Under 18 Checkbox          │
│                                 │
│ 3. Parent Info (if checked)     │
│    Name, email, phone, DOB      │
│    Separate address fields      │
│                                 │
│ 4. Emergency Contact            │
│    Name, phone                  │
│                                 │
│ 5. Lesson Preferences           │
│    Type, custom rate            │
│                                 │
├─────────────────────────────────┤
│ STICKY FOOTER                   │ ← Always visible
│ [Cancel]  [Save Student]        │
└─────────────────────────────────┘
```

**Scroll Implementation:**
```javascript
// Modal container
<div className="max-h-[90vh] flex flex-col">
  
  // Fixed header
  <div className="flex-shrink-0">
    Header content
  </div>
  
  // Scrollable content
  <div className="overflow-y-auto flex-1">
    Form fields
  </div>
  
  // Sticky footer
  <div className="flex-shrink-0">
    Action buttons
  </div>
  
</div>
```

**Form Sections:**

**1. Student Information**
- Profile image URL with live preview
- Name (required)
- Email (required if 18+)
- Phone
- Date of birth
- Address fields (only shown if 18+)

**2. Under 18 Checkbox**
- When checked: Shows parent section, hides student address
- When unchecked: Hides parent section, shows student address

**3. Parent/Guardian Information** (if under 18)
- Name (required)
- Email (required) + helper text
- Phone
- Date of birth
- Separate address fields

**4. Emergency Contact**
- Name
- Phone
- Helper text

**5. Lesson Preferences**
- Default lesson type (dropdown)
- Custom rate (optional)

---

#### `BillingView` (Revenue Dashboard)

**Location:** Lines 3474-3711

**Purpose:** Financial overview and reporting

**Layout:**
```
┌──────────────────────────────────────┐
│ Revenue Cards (3)                    │
├───────────┬───────────┬──────────────┤
│ Earned    │ Scheduled │ Total        │
│ $2,500    │ $800      │ $3,300       │
│ 50 lessons│ 16 lessons│ 66 lessons   │
└───────────┴───────────┴──────────────┘

Revenue by Student
┌────────────────────────────────────┐
│ Sarah Johnson        $650 (13 lsn) │
│ John Smith           $600 (12 lsn) │
│ Mike Davis           $550 (10 lsn) │
│ ...                                │
└────────────────────────────────────┘

Recent Completed Lessons (Last 10)
┌────────────────────────────────────┐
│ Feb 20 - Sarah - Piano - $50       │
│ Feb 19 - John - Guitar - $50       │
│ ...                                │
└────────────────────────────────────┘
```

**Calculations:**
```javascript
// Total Earned (completed lessons only)
completedLessons.reduce((sum, l) => sum + l.rate, 0)

// Scheduled Revenue (upcoming lessons)
scheduledLessons.reduce((sum, l) => sum + l.rate, 0)

// Revenue by Student
students.map(student => ({
  total: sum of student's completed lesson rates,
  count: number of completed lessons,
  avgRate: total / count
})).sort by total (highest first)
```

**Features:**
- 3 summary cards (earned, scheduled, total)
- Revenue by student table (sorted by total)
- Recent completed lessons (last 10)
- Search by student name
- Export billing report

---

## 📊 Data Models

### User Object

```javascript
{
  businessName: "Jorfio's Drum Lessons",
  lessonTypes: [
    {
      name: "Piano - 30min",
      duration: 30,    // minutes
      rate: 30        // dollars
    },
    {
      name: "Piano - 60min",
      duration: 60,
      rate: 50
    }
  ]
}
```

**Stored:** `localStorage.cadence_user`

---

### Student Object

```javascript
{
  id: 1708534800000,  // Timestamp
  
  // Student Info
  name: "Emma Thompson",
  email: "emma@example.com",      // Blank if minor
  phone: "555-0123",
  dateOfBirth: "2015-03-15",
  profileImage: "https://...",
  
  // Student Address (if 18+)
  addressLine1: "123 Oak Street",
  addressLine2: "Apt 4B",
  city: "Dallas",
  state: "TX",
  zipCode: "75201",
  
  // Minor Flag
  isMinor: true,
  
  // Parent Info (if minor)
  parentName: "Sarah Thompson",
  parentEmail: "sarah@example.com",
  parentPhone: "555-0456",
  parentDateOfBirth: "1985-06-20",
  
  // Parent Address (separate from student)
  parentAddressLine1: "123 Oak Street",
  parentAddressLine2: "",
  parentCity: "Dallas",
  parentState: "TX",
  parentZipCode: "75201",
  
  // Emergency Contact
  emergencyContactName: "John Thompson",
  emergencyContactPhone: "555-0789",
  
  // Lesson Preferences
  defaultLessonType: "Piano - 60min",
  customRate: "45"  // Optional scholarship rate
}
```

**Stored:** `localStorage.cadence_students`

---

### Lesson Object

```javascript
{
  id: 1708534800001,
  
  // Relationship
  studentId: 1708534800000,  // Links to student
  
  // Schedule
  date: "2026-02-21",  // YYYY-MM-DD
  time: "14:00",       // HH:MM (24-hour)
  
  // Details
  lessonType: "Piano - 60min",
  duration: 60,        // minutes
  rate: 50,           // dollars
  
  // Status
  status: "scheduled", // 'scheduled'|'completed'|'cancelled'
  
  // Optional
  notes: "Working on scales"
}
```

**Stored:** `localStorage.cadence_lessons`

**Status Values:**
- `scheduled` - Blue - Future lesson
- `completed` - Green - Done, revenue earned
- `cancelled` - Red - Cancelled, no revenue

---

## 🎨 Design System

### Color Palette

```javascript
// Primary
Teal-700:  #0F766E  // Main actions, buttons
Teal-600:  #0D9488  // Hover states
Teal-400:  #2DD4BF  // Dark mode accents

// Backgrounds
Stone-50:  #FAFAF9  // Light page
Stone-900: #1C1917  // Dark page
White:     #FFFFFF  // Light cards
Stone-800: #292524  // Dark cards

// Text
Stone-900: #1C1917  // Light primary
Stone-100: #F5F5F4  // Dark primary
Stone-600: #57534E  // Secondary
Stone-400: #A8A29E  // Tertiary

// Borders
Stone-200: #E7E5E4  // Light
Stone-700: #44403C  // Dark

// Status
Blue-600:  #2563EB  // Scheduled
Green-600: #16A34A  // Completed
Red-600:   #DC2626  // Cancelled
Amber-600: #D97706  // Warnings
```

### Typography

```css
/* Headings */
font-family: 'Fraunces', serif;
font-weight: 700;

/* Body */
font-family: 'DM Sans', sans-serif;
font-weight: 400, 500, 600;
```

### Component Patterns

**Page Header:**
```jsx
<div className="flex justify-between pb-4 border-b">
  <h2 className="text-3xl font-bold">Title</h2>
  <input type="text" placeholder="Search..." />
</div>
```

**Card:**
```jsx
<div className="bg-white dark:bg-stone-800 
                rounded-xl p-6 
                border border-stone-200 dark:border-stone-700">
  Content
</div>
```

**Primary Button:**
```jsx
<button className="px-4 py-2 
                   bg-teal-700 dark:bg-teal-600 
                   text-white rounded-lg 
                   hover:bg-teal-600 dark:hover:bg-teal-500">
  Action
</button>
```

---

## 💻 Development Guide

### Making Changes

1. Open `cadence-mvp.html` in code editor
2. Find component using line numbers in this README
3. Edit JSX/JavaScript
4. Save file
5. Refresh browser (no build!)

### Common Tasks

**Add New Lesson Type:**
```javascript
// Line ~400 in setup or manually edit localStorage
const user = JSON.parse(localStorage.getItem('cadence_user'));
user.lessonTypes.push({
  name: "Voice - 45min",
  duration: 45,
  rate: 40
});
localStorage.setItem('cadence_user', JSON.stringify(user));
```

**Change Color Scheme:**
```
Find: teal-700
Replace: blue-700  (or purple-700, indigo-700)
```

**Add Field to Student:**
1. Update Student Object (line ~3160)
2. Add input to AddStudentModal (line ~3300)
3. Display in StudentProfileView (line ~2900)

### localStorage Keys

```javascript
'cadence_user'                      // Business info
'cadence_students'                  // Student array
'cadence_lessons'                   // Lesson array
'cadence_setup_complete'            // Setup flag
'cadence_dark_mode'                 // Theme
'cadence_show_keyboard_shortcuts'   // Help dismissed
```

---

## 🚀 Deployment Guide

### Netlify (Recommended)

1. Drag `cadence-mvp.html` to netlify.com
2. Get instant URL
3. Done!

### Vercel

1. Upload to GitHub
2. Connect to Vercel
3. Deploy

### Custom Domain

1. Deploy to Netlify/Vercel
2. Buy domain
3. Add in hosting settings
4. Update DNS

### Important Note

This MVP uses `localStorage`:
- ✅ Data persists in browser
- ❌ Doesn't sync across devices
- ❌ Clearing browser = data loss

**For production:** Add backend database.

---

## 🔮 Future Roadmap

### Phase 1: Backend
- [ ] Firebase/Supabase
- [ ] User authentication
- [ ] Cloud database
- [ ] Multi-device sync

### Phase 2: Multi-User
- [ ] Multiple teachers
- [ ] Parent portal
- [ ] Student access
- [ ] Role permissions

### Phase 3: Communication
- [ ] Email reminders
- [ ] SMS notifications
- [ ] In-app messaging

### Phase 4: Payments
- [ ] Stripe integration
- [ ] Invoicing
- [ ] Automated billing

### Phase 5: Advanced
- [ ] Mobile app
- [ ] Calendar sync
- [ ] Advanced reporting
- [ ] White-label branding

---

## 📝 Developer Notes

**Current Architecture:**
- Single file, browser-transpiled React
- Perfect for MVP, prototyping
- Easy to understand and modify

**When to Refactor:**
- 5+ developers
- 10,000+ lines
- Need TypeScript
- Backend ready

**Then Migrate To:**
- Create React App
- Next.js
- Vite

---

## 📞 Support

**Created by:** Jorfio  
**For:** Music teachers  
**Built with:** ❤️ for music educators

---

**Last Updated:** February 21, 2026
