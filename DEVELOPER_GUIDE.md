# Cadence Developer Guide

## 📝 Code Documentation Reference

This guide explains the **inline comments and documentation** throughout `cadence-mvp.html`. Use this to understand how the code is organized and documented.

---

## 🏷️ Documentation Labels Used

Throughout the code, you'll find these standardized comment labels:

### Component Labels

```javascript
// ============================================
// COMPONENT NAME
// ============================================
// Purpose: What this component does
// Props: List of props with types
// State: Local state variables
// Features: Key functionality
// ============================================
```

### Section Labels

```javascript
// -------------------- Section Name --------------------
```

### Function Labels

```javascript
/**
 * Function Name
 * @param {type} paramName - Description
 * @returns {type} Description
 * @description What this function does
 */
```

### State Labels

```javascript
// STATE: Variable purpose
const [variable, setVariable] = useState(initialValue);
```

### Effect Labels

```javascript
// EFFECT: What this effect does and why
useEffect(() => {
  // ...
}, [dependencies]);
```

---

## 📍 Key Documentation Sections

### File Header (Lines 1-50)

```html
<!--
===========================================
CADENCE - Music Lesson Management Platform
===========================================
Version: 1.0.0 MVP
Author: Jorfio
Created: February 2026
Tech Stack: React 18 + Tailwind CSS + localStorage

ARCHITECTURE:
- Single HTML file (zero build process)
- React via Babel Standalone (browser transpilation)
- Tailwind via CDN
- localStorage for data persistence

COMPONENTS:
- Main App (line 327)
- Calendar System (line 586)
- Student System (line 2539)
- Billing System (line 3474)

For full documentation, see README.md
===========================================
-->
```

---

## 🧩 Component Documentation Pattern

Each major component follows this pattern:

```javascript
// ============================================
// CALENDAR VIEW COMPONENT
// ============================================
// Purpose: Main calendar container with view switching
// 
// Props:
//   - students: Array<Student> - List of all students
//   - lessons: Array<Lesson> - List of all lessons
//   - setLessons: Function - Update lessons array
//   - user: User - Business info and lesson types
//
// State:
//   - currentDate: Date - Selected date for calendar
//   - view: string - Current view mode (day/week/month/year/schedule)
//   - searchQuery: string - Search filter text
//   - showAddLesson: object|null - Add lesson modal state
//   - editingLesson: Lesson|null - Lesson being edited
//   - lessonToReschedule: Lesson|null - Lesson being moved
//   - showKeyboardShortcuts: boolean - Help modal visibility
//
// Features:
//   - 5 view modes (Day, Week, Month, Year, List)
//   - Date navigation (prev/next/today)
//   - Live search across lessons and students
//   - Keyboard shortcuts (D/W/M/Y/S, arrows, T, P)
//   - Print and export functionality
//   - Add, edit, delete, reschedule lessons
//
// Keyboard Shortcuts:
//   D = Day view
//   W = Week view
//   M = Month view
//   Y = Year view
//   S = Schedule (list) view
//   T = Today
//   ← = Previous period
//   → = Next period
//   P = Print
// ============================================
function CalendarView({ students, lessons, setLessons, user }) {
  // ... component code
}
```

---

## 📚 Documentation Examples

### Main App Component

```javascript
// ============================================
// MAIN APP COMPONENT (Root)
// ============================================
// Purpose: Application root managing global state and routing
//
// Responsibilities:
//   1. Manage user setup (first-time wizard)
//   2. Store global state (user, students, lessons)
//   3. Handle navigation between pages
//   4. Persist all data to localStorage
//   5. Manage dark mode theme
//
// State:
//   - setupComplete: boolean - Whether setup wizard finished
//   - user: User - Business name and lesson types
//   - students: Student[] - All students
//   - lessons: Lesson[] - All scheduled lessons
//   - currentView: string - Active page (calendar/students/billing)
//   - darkMode: boolean - Theme preference
//
// localStorage Keys Used:
//   - cadence_setup_complete
//   - cadence_user
//   - cadence_students
//   - cadence_lessons
//   - cadence_dark_mode
// ============================================
function CadenceApp() {
  // STATE: Setup wizard completion flag
  const [setupComplete, setSetupComplete] = useLocalStorage('cadence_setup_complete', false);
  
  // STATE: User business info and lesson types
  const [user, setUser] = useLocalStorage('cadence_user', {
    businessName: '',
    lessonTypes: []
  });
  
  // STATE: All students
  const [students, setStudents] = useLocalStorage('cadence_students', []);
  
  // STATE: All lessons
  const [lessons, setLessons] = useLocalStorage('cadence_lessons', []);
  
  // STATE: Current active page
  const [currentView, setCurrentView] = useState('calendar');
  
  // STATE: Dark mode preference
  const [darkMode, setDarkMode] = useLocalStorage('cadence_dark_mode', false);

  // EFFECT: Apply dark mode class to document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // ... rest of component
}
```

---

### Day View Component

```javascript
// ============================================
// DAY VIEW COMPONENT
// ============================================
// Purpose: Hour-by-hour daily schedule view
//
// Features:
//   - 24-hour coverage (12 AM - 11 PM)
//   - 15-minute time intervals
//   - Lessons grouped and sorted by hour
//   - Color-coded by status (blue/green/red)
//   - Current time indicator
//   - Click empty slot to schedule
//   - Drag lesson to reschedule
//
// Layout:
//   Each hour block shows:
//   - Hour label (12-hour format)
//   - All lessons starting in that hour
//   - Sorted by start time
//   - Empty state if no lessons
//
// Color Coding:
//   - Blue: Scheduled (upcoming)
//   - Green: Completed
//   - Red: Cancelled
// ============================================
function DayView({ currentDate, lessons, students, onAddLesson, onEditLesson, onReschedule, onToggleStatus }) {
  // -------------------- Group Lessons by Hour --------------------
  const lessonsByHour = {};
  
  // Initialize all 24 hours
  for (let hour = 0; hour <= 23; hour++) {
    lessonsByHour[hour] = [];
  }
  
  // Filter lessons for current date
  const dayLessons = lessons.filter(lesson => {
    return lesson.date === currentDate.toISOString().split('T')[0];
  });
  
  // Group by hour and sort by time
  dayLessons.forEach(lesson => {
    const hour = parseInt(lesson.time.split(':')[0]);
    lessonsByHour[hour].push(lesson);
  });
  
  // Sort lessons within each hour
  Object.keys(lessonsByHour).forEach(hour => {
    lessonsByHour[hour].sort((a, b) => {
      return a.time.localeCompare(b.time);
    });
  });

  // -------------------- Render Hour Blocks --------------------
  return (
    <div className="space-y-0">
      {Object.entries(lessonsByHour).map(([hour, hourLessons]) => (
        <div key={hour} className="border-b">
          {/* Hour Label */}
          <div className="font-semibold">
            {formatTime12Hour(`${hour.padStart(2, '0')}:00`)}
          </div>
          
          {/* Lessons in This Hour */}
          {hourLessons.map(lesson => {
            const student = students.find(s => s.id === lesson.studentId);
            
            return (
              <LessonBlock
                key={lesson.id}
                lesson={lesson}
                student={student}
                onEdit={onEditLesson}
                onReschedule={onReschedule}
                onToggleStatus={onToggleStatus}
              />
            );
          })}
          
          {/* Empty State - Click to Add */}
          {hourLessons.length === 0 && (
            <div 
              onClick={() => onAddLesson({ 
                date: currentDate.toISOString().split('T')[0], 
                time: `${hour.padStart(2, '0')}:00` 
              })}
              className="cursor-pointer text-stone-400 text-sm"
            >
              Click to schedule
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
```

---

### Add Student Modal

```javascript
// ============================================
// ADD/EDIT STUDENT MODAL COMPONENT
// ============================================
// Purpose: Comprehensive student form with perfect scrolling
//
// Features:
//   - Profile image preview (live URL updates)
//   - Student info (name, email, phone, DOB, address)
//   - Under 18 checkbox (toggles parent section)
//   - Parent info with separate address
//   - Emergency contact section
//   - Lesson preferences
//   - Fixed header + scrollable content + sticky footer
//
// Props:
//   - student: Student|null - Student to edit (null = add new)
//   - onClose: Function - Close modal callback
//   - onSave: Function - Save student callback
//   - lessonTypes: Array<LessonType> - Available lesson types
//
// Form Validation:
//   Required fields:
//   - Student name (always)
//   - Student email (if 18+)
//   - Parent name (if under 18)
//   - Parent email (if under 18)
//
// Scroll Behavior:
//   - Modal max height: 90vh (never exceeds screen)
//   - Header: Fixed at top (flex-shrink-0)
//   - Content: Scrolls independently (overflow-y-auto flex-1)
//   - Footer: Fixed at bottom (flex-shrink-0)
//
// Layout Structure:
//   1. Student Information
//      - Profile image with live preview
//      - Name, email, phone (3-column grid)
//      - Date of birth
//      - Address (only if 18+)
//   2. Under 18 Checkbox (amber-themed)
//   3. Parent Information (if checked)
//      - Name, email, phone, DOB
//      - Separate address fields
//   4. Emergency Contact (red-themed)
//      - Name and phone
//   5. Lesson Preferences (teal-themed)
//      - Default type, custom rate
// ============================================
function AddStudentModal({ student, onClose, onSave, lessonTypes }) {
  // STATE: Form data with all student fields
  const [formData, setFormData] = useState(student || {
    // Student Info
    name: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    profileImage: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    zipCode: '',
    
    // Minor flag
    isMinor: false,
    
    // Parent Info
    parentName: '',
    parentEmail: '',
    parentPhone: '',
    parentDateOfBirth: '',
    parentAddressLine1: '',
    parentAddressLine2: '',
    parentCity: '',
    parentState: '',
    parentZipCode: '',
    
    // Emergency Contact
    emergencyContactName: '',
    emergencyContactPhone: '',
    
    // Lesson Preferences
    defaultLessonType: lessonTypes[0]?.name || '',
    customRate: '',
  });

  /**
   * Handle form submission
   * @param {Event} e - Form submit event
   * @description Validates and saves student data
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-white dark:bg-stone-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ============ FIXED HEADER ============ */}
        <div className="flex items-center justify-between p-6 border-b border-stone-200 dark:border-stone-700 flex-shrink-0">
          <h3 className="text-2xl font-bold text-stone-900 dark:text-stone-100">
            {student ? 'Edit Student' : 'Add New Student'}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-stone-100 dark:hover:bg-stone-700 rounded-lg transition-colors">
            <X className="w-6 h-6 text-stone-600 dark:text-stone-400" />
          </button>
        </div>

        {/* ============ SCROLLABLE CONTENT ============ */}
        <div className="overflow-y-auto flex-1 p-6">
          <form id="student-form" onSubmit={handleSubmit} className="space-y-6">
            {/* ... all form sections ... */}
          </form>
        </div>

        {/* ============ STICKY FOOTER ============ */}
        <div className="p-6 border-t border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 flex-shrink-0">
          <div className="flex gap-3">
            <button type="button" onClick={onClose}>Cancel</button>
            <button type="submit" form="student-form">Save</button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## 🔧 Utility Function Documentation

```javascript
// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Format 24-hour time to 12-hour AM/PM format
 * @param {string} time24 - Time in HH:MM format (e.g., "14:30")
 * @returns {string} Time in 12-hour format (e.g., "2:30 PM")
 * @example
 *   formatTime12Hour("14:30") // "2:30 PM"
 *   formatTime12Hour("09:00") // "9:00 AM"
 *   formatTime12Hour("00:00") // "12:00 AM"
 */
function formatTime12Hour(time24) {
  const [hours, minutes] = time24.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
}
```

---

## 🪝 Custom Hook Documentation

```javascript
// ============================================
// CUSTOM HOOKS
// ============================================

/**
 * useLocalStorage Hook
 * @param {string} key - localStorage key
 * @param {any} initialValue - Default value if key doesn't exist
 * @returns {[any, Function]} Current value and setter function
 * @description
 * Syncs state with localStorage for data persistence.
 * Updates localStorage whenever state changes.
 * Loads from localStorage on mount.
 * 
 * @example
 *   const [name, setName] = useLocalStorage('user_name', 'John');
 *   setName('Jane'); // Saves to localStorage AND updates state
 */
function useLocalStorage(key, initialValue) {
  // STATE: Stored value (initialized from localStorage or default)
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.log(error);
      return initialValue;
    }
  });

  /**
   * Update both state and localStorage
   * @param {any} value - New value to store
   */
  const setValue = (value) => {
    try {
      setStoredValue(value);
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.log(error);
    }
  };

  return [storedValue, setValue];
}
```

---

## 💾 Data Model Documentation

Each data model has inline documentation:

```javascript
// ============================================
// STUDENT DATA MODEL
// ============================================
// Structure of student objects stored in localStorage
//
// Fields:
//   id: number - Timestamp-based unique identifier
//   
//   Student Information:
//     name: string - Full name (required)
//     email: string - Email address (required if 18+)
//     phone: string - Phone number
//     dateOfBirth: string - YYYY-MM-DD format
//     profileImage: string - URL to profile picture
//   
//   Student Address (if 18+):
//     addressLine1: string
//     addressLine2: string
//     city: string
//     state: string - 2-character code (e.g., "TX")
//     zipCode: string
//   
//   Minor Status:
//     isMinor: boolean - Whether student is under 18
//   
//   Parent Information (if isMinor):
//     parentName: string (required)
//     parentEmail: string (required)
//     parentPhone: string
//     parentDateOfBirth: string
//     parentAddressLine1: string
//     parentAddressLine2: string
//     parentCity: string
//     parentState: string
//     parentZipCode: string
//   
//   Emergency Contact:
//     emergencyContactName: string
//     emergencyContactPhone: string
//   
//   Lesson Preferences:
//     defaultLessonType: string - Selected from user.lessonTypes
//     customRate: string - Optional custom rate (e.g., scholarship)
//
// Example:
//   {
//     id: 1708534800000,
//     name: "Emma Thompson",
//     email: "",
//     isMinor: true,
//     parentName: "Sarah Thompson",
//     parentEmail: "sarah@example.com",
//     emergencyContactName: "John Thompson",
//     emergencyContactPhone: "555-0789",
//     defaultLessonType: "Piano - 60min",
//     customRate: "45"
//   }
// ============================================
```

---

## 🎨 Design System Documentation

```javascript
// ============================================
// DESIGN SYSTEM - COLOR PALETTE
// ============================================
// Primary Colors:
//   Teal-700 (#0F766E) - Main buttons, accents, active states
//   Teal-600 (#0D9488) - Hover states
//   Teal-400 (#2DD4BF) - Dark mode accents
//
// Background Colors:
//   Light Mode:
//     Stone-50 (#FAFAF9) - Page background
//     White (#FFFFFF) - Card backgrounds
//   Dark Mode:
//     Stone-900 (#1C1917) - Page background
//     Stone-800 (#292524) - Card backgrounds
//
// Text Colors:
//   Light Mode:
//     Stone-900 (#1C1917) - Primary text
//     Stone-600 (#57534E) - Secondary text
//     Stone-400 (#A8A29E) - Tertiary text
//   Dark Mode:
//     Stone-100 (#F5F5F4) - Primary text
//     Stone-400 (#A8A29E) - Secondary text
//     Stone-500 (#78716C) - Tertiary text
//
// Status Colors:
//   Blue-600 (#2563EB) - Scheduled lessons
//   Green-600 (#16A34A) - Completed lessons
//   Red-600 (#DC2626) - Cancelled lessons
//   Amber-600 (#D97706) - Warnings, alerts
//
// Usage:
//   className="text-stone-900 dark:text-stone-100"  // Adapts to theme
//   className="bg-teal-700 hover:bg-teal-600"       // Primary button
// ============================================
```

---

## 🔍 Finding Components

Use these line number references to jump directly to components:

```javascript
// Quick Reference Guide
// =====================

// Main App & Setup
CadenceApp               // Line 327    - Root component
SetupWizard              // Line 400    - First-time setup

// Layout Components
Header                   // Line 516    - Top navigation
Sidebar                  // Line 558    - Left menu

// Calendar System
CalendarView             // Line 586    - Calendar container
DayView                  // Line 1320   - Hour-by-hour
WeekView                 // Line 1472   - 7-day grid
MonthView                // Line 1652   - Monthly calendar
YearView                 // Line 1852   - 12-month grid
ScheduleListView         // Line 2002   - Chronological list
AddLessonModal           // Line 2200   - Schedule form
RescheduleModal          // Line 2350   - Move lesson
RecurringSetupModal      // Line 2450   - Recurring setup

// Student System
StudentsView             // Line 2539   - Students container
StudentProfileView       // Line 2829   - Profile display
StudentCard              // Line 3033   - Card component
StudentListView          // Line 2721   - Table view
AddStudentModal          // Line 3157   - Student form

// Billing System
BillingView              // Line 3474   - Revenue dashboard

// Utilities & Hooks
formatTime12Hour         // Line 277    - Time formatter
useLocalStorage          // Line 297    - Persistent state hook

// Demo Data
generateDemoData         // Line 3720   - Demo students/lessons
```

---

## 📖 Reading the Code

### Follow This Order:

1. **Start with README.md** - Get high-level overview
2. **Read this guide** - Understand documentation system
3. **Check line numbers** - Jump to specific components
4. **Read component headers** - Understand purpose and props
5. **Follow state flow** - See how data moves through app
6. **Check inline comments** - Detailed explanations throughout

### Code Reading Tips:

**Look for these markers:**
```javascript
// ============================================  Big sections
// --------------------                         Subsections
// STATE:                                       State variables
// EFFECT:                                      Side effects
// RENDER:                                      JSX rendering logic
/**                                             Function documentation
 *
 */
```

**Component Pattern:**
```javascript
// 1. Component header documentation
// 2. State declarations
// 3. Effects
// 4. Helper functions
// 5. Event handlers
// 6. Render logic
```

---

## 🛠️ Making Changes

### Step-by-Step Process:

1. **Find the component** using line numbers
2. **Read the documentation header** to understand purpose
3. **Check state and props** to understand data flow
4. **Make your changes** to the code
5. **Update comments** if you change behavior
6. **Test thoroughly** - refresh browser to see changes
7. **Document new features** following the patterns above

### Adding New Features:

```javascript
// When adding a new component:

// ============================================
// YOUR COMPONENT NAME
// ============================================
// Purpose: What it does
// Props: What it receives
// State: What it manages
// Features: Key functionality
// ============================================
function YourComponent({ props }) {
  // STATE: Explain each piece of state
  const [state, setState] = useState(initial);
  
  // EFFECT: Explain why this effect exists
  useEffect(() => {
    // ...
  }, [deps]);
  
  /**
   * Function documentation
   * @param {type} name - Description
   */
  const handleSomething = () => {
    // ...
  };
  
  // RENDER: Component UI
  return (
    // ...
  );
}
```

---

## ✅ Documentation Checklist

When writing code, ensure:

- [ ] Component has header documentation
- [ ] Props are listed and explained
- [ ] State variables have `// STATE:` comments
- [ ] Effects have `// EFFECT:` comments
- [ ] Complex logic has explanatory comments
- [ ] Functions have JSDoc documentation
- [ ] Data models are documented
- [ ] Line numbers are referenced in README

---

## 📞 Getting Help

**Can't find something?**
1. Check the line number quick reference above
2. Search for the component name in the file
3. Look for `// ============================================` markers
4. Read the README.md for high-level overview

**Need to understand data flow?**
1. Start at CadenceApp (line 327)
2. Follow props down to child components
3. Look for `useLocalStorage` calls to see persistence
4. Check `// STATE:` comments for state purpose

---

**This guide covers the documentation system used throughout cadence-mvp.html. Follow these patterns when making changes to maintain consistency!**
