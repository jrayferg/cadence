import React, { useState, useEffect, useRef, useMemo } from 'react';
import { generateRecurringDates } from '@/utils/recurringDates';
import { Calendar, X, Plus } from '@/components/icons';
import BillingModelBadge from '@/features/billing/components/BillingModelBadge';
import AddStudentModal from '@/features/students/AddStudentModal';

/**
 * AddLessonModal - A Google Calendar-style modal for scheduling new lessons.
 * Supports student search with autocomplete, recurring lesson configuration
 * (daily/weekly/biweekly/monthly), repeat-day selection, and end-type options
 * (never, on date, after N occurrences). Shows a preview count of lessons
 * that will be created for recurring schedules.
 *
 * @param {Object} props
 * @param {Object} props.slot - Pre-filled date and time ({date, time})
 * @param {Array} props.students - Array of student objects
 * @param {Array} props.lessonTypes - Array of lesson type definitions from user settings
 * @param {Function} props.onClose - Called to close the modal
 * @param {Function} props.onSave - Called with the new lesson data on save
 * @param {Function} props.setStudents - State setter for students (used by AddStudentModal)
 */
function AddLessonModal({ slot, students, lessonTypes, onClose, onSave, setStudents }) {
      const [showAddStudent, setShowAddStudent] = useState(false);
      const [studentSearch, setStudentSearch] = useState('');
      const [showStudentDropdown, setShowStudentDropdown] = useState(false);
      const studentSearchRef = useRef(null);
      const dropdownRef = useRef(null);

      const initialDay = new Date(slot.date + 'T12:00:00').getDay();
      const [formData, setFormData] = useState({
        date: slot.date,
        time: slot.time,
        studentId: '',
        lessonType: lessonTypes[0]?.name || '',
        duration: lessonTypes[0]?.duration || 30,
        rate: lessonTypes[0]?.rate || 0,
        recurring: false,
        recurringFrequency: 'weekly',
        repeatDays: [initialDay],
        endType: 'after',
        endDate: '',
        recurringCount: 10,
      });

      // Close student dropdown on outside click
      useEffect(() => {
        const handleClickOutside = (e) => {
          if (dropdownRef.current && !dropdownRef.current.contains(e.target) &&
              studentSearchRef.current && !studentSearchRef.current.contains(e.target)) {
            setShowStudentDropdown(false);
          }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
      }, []);

      // Update repeatDays when date changes
      useEffect(() => {
        if (formData.date) {
          const newDay = new Date(formData.date + 'T12:00:00').getDay();
          setFormData(prev => ({
            ...prev,
            repeatDays: prev.repeatDays.length === 1 && prev.repeatDays[0] === initialDay
              ? [newDay] : prev.repeatDays
          }));
        }
      }, [formData.date]);

      const filteredStudents = students.filter(s =>
        s.name.toLowerCase().includes(studentSearch.toLowerCase())
      );

      const selectedStudent = students.find(s => s.id === formData.studentId);

      const handleLessonTypeChange = (typeName) => {
        const type = lessonTypes.find(t => t.name === typeName);
        setFormData({ ...formData, lessonType: typeName, duration: type.duration, rate: type.rate });
      };

      const handleStudentSelect = (student) => {
        setStudentSearch(student.name);
        setShowStudentDropdown(false);
        if (student.customRate) {
          setFormData({ ...formData, studentId: student.id, rate: parseFloat(student.customRate) });
        } else {
          setFormData({ ...formData, studentId: student.id });
        }
      };

      const toggleRepeatDay = (day) => {
        setFormData(prev => {
          const days = prev.repeatDays.includes(day)
            ? prev.repeatDays.filter(d => d !== day)
            : [...prev.repeatDays, day].sort();
          return { ...prev, repeatDays: days.length > 0 ? days : [day] }; // at least one day
        });
      };

      // Compute preview count
      const previewCount = useMemo(() => {
        if (!formData.recurring || !formData.date) return 0;
        try {
          const dates = generateRecurringDates({
            startDate: formData.date,
            frequency: formData.recurringFrequency,
            repeatDays: formData.repeatDays,
            endType: formData.endType,
            endDate: formData.endDate,
            count: formData.recurringCount
          });
          return dates.length;
        } catch { return 0; }
      }, [formData.recurring, formData.date, formData.recurringFrequency, formData.repeatDays, formData.endType, formData.endDate, formData.recurringCount]);

      const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.studentId) return;
        onSave(formData);
      };

      const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

      if (showAddStudent) {
        return (
          <AddStudentModal
            onClose={() => setShowAddStudent(false)}
            onSave={(student) => {
              const newId = Date.now();
              setStudents(prev => [...prev, { ...student, id: newId }]);
              setFormData({ ...formData, studentId: newId });
              setStudentSearch(student.name);
              setShowAddStudent(false);
            }}
            lessonTypes={lessonTypes}
          />
        );
      }

      return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white dark:bg-stone-800 rounded-2xl p-4 sm:p-8 max-w-lg w-full animate-slide-up max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h3 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100">Schedule Lesson</h3>
              <button onClick={onClose} className="p-2 hover:bg-stone-100 dark:hover:bg-stone-700 rounded-lg">
                <X className="w-6 h-6 text-stone-600 dark:text-stone-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Student Search Autocomplete */}
              <div>
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">Student *</label>
                {students.length === 0 ? (
                  <button
                    type="button"
                    onClick={() => setShowAddStudent(true)}
                    className="w-full px-4 py-3 border-2 border-dashed border-teal-300 dark:border-teal-600 text-teal-700 dark:text-teal-400 rounded-lg hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-colors"
                  >
                    + Add Your First Student
                  </button>
                ) : (
                  <div className="relative">
                    <div className="flex gap-2">
                      <div className="flex-1 relative">
                        <input
                          ref={studentSearchRef}
                          type="text"
                          value={studentSearch}
                          onChange={(e) => {
                            setStudentSearch(e.target.value);
                            setShowStudentDropdown(true);
                            if (!e.target.value) setFormData({ ...formData, studentId: '' });
                          }}
                          onFocus={() => setShowStudentDropdown(true)}
                          onKeyDown={(e) => {
                            if (e.key === 'Escape') setShowStudentDropdown(false);
                          }}
                          placeholder="Search students..."
                          className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-700 border border-stone-200 dark:border-stone-600 text-stone-900 dark:text-stone-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                          required={!formData.studentId}
                        />
                        {formData.studentId && (
                          <button
                            type="button"
                            onClick={() => { setStudentSearch(''); setFormData({ ...formData, studentId: '' }); }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-300"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowAddStudent(true)}
                        className="px-4 py-2 border border-stone-200 dark:border-stone-600 text-stone-700 dark:text-stone-300 rounded-lg hover:bg-stone-50 dark:hover:bg-stone-700"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Student Dropdown */}
                    {showStudentDropdown && !formData.studentId && (
                      <div ref={dropdownRef} className="absolute z-10 mt-1 w-full bg-white dark:bg-stone-700 border border-stone-200 dark:border-stone-600 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        {filteredStudents.length === 0 ? (
                          <div className="px-4 py-3 text-sm text-stone-500 dark:text-stone-400">No students found</div>
                        ) : (
                          filteredStudents.slice(0, 6).map(student => (
                            <button
                              key={student.id}
                              type="button"
                              onClick={() => handleStudentSelect(student)}
                              className="w-full text-left px-4 py-3 hover:bg-teal-50 dark:hover:bg-stone-600 transition-colors flex items-center justify-between"
                            >
                              <span className="text-sm font-medium text-stone-900 dark:text-stone-100">{student.name}</span>
                              {student.customRate && (
                                <span className="text-xs text-stone-500 dark:text-stone-400">${student.customRate}/lesson</span>
                              )}
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Billing Model Info (read-only context) */}
              {selectedStudent && (
                <div className="flex items-center gap-2 text-sm text-stone-500 dark:text-stone-400 -mt-2">
                  <BillingModelBadge model={selectedStudent.billingModel || 'per-lesson'} />
                  {selectedStudent.billingModel === 'monthly' && selectedStudent.monthlyRate && (
                    <span>${selectedStudent.monthlyRate}/mo</span>
                  )}
                  {(selectedStudent.billingModel || 'per-lesson') === 'per-lesson' && (
                    <span>${selectedStudent.customRate || formData.rate}/lesson</span>
                  )}
                </div>
              )}

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-700 border border-stone-200 dark:border-stone-600 text-stone-900 dark:text-stone-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">Time</label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-700 border border-stone-200 dark:border-stone-600 text-stone-900 dark:text-stone-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  />
                </div>
              </div>

              {/* Lesson Type */}
              <div>
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">Lesson Type</label>
                <select
                  value={formData.lessonType}
                  onChange={(e) => handleLessonTypeChange(e.target.value)}
                  className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-700 border border-stone-200 dark:border-stone-600 text-stone-900 dark:text-stone-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  {lessonTypes.map(type => (
                    <option key={type.name} value={type.name}>
                      {type.name} - {type.duration} min - ${type.rate}
                    </option>
                  ))}
                </select>
              </div>

              {/* Duration & Rate */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">Duration (min)</label>
                  <input
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-700 border border-stone-200 dark:border-stone-600 text-stone-900 dark:text-stone-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">Rate ($)</label>
                  <input
                    type="number"
                    value={formData.rate}
                    onChange={(e) => setFormData({ ...formData, rate: parseFloat(e.target.value) })}
                    className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-700 border border-stone-200 dark:border-stone-600 text-stone-900 dark:text-stone-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              {/* Recurring Section (Google Calendar-style) */}
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.recurring}
                    onChange={(e) => setFormData({ ...formData, recurring: e.target.checked })}
                    className="w-5 h-5 accent-teal-700"
                  />
                  <span className="font-medium text-stone-900 dark:text-stone-100">Recurring Lesson</span>
                </label>

                {formData.recurring && (
                  <div className="mt-4 space-y-4">
                    {/* Frequency */}
                    <div>
                      <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Repeat</label>
                      <select
                        value={formData.recurringFrequency}
                        onChange={(e) => setFormData({ ...formData, recurringFrequency: e.target.value })}
                        className="w-full px-3 py-2 bg-white dark:bg-stone-700 border border-stone-200 dark:border-stone-600 text-stone-900 dark:text-stone-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="biweekly">Every 2 weeks</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>

                    {/* Repeat On - Day Buttons (weekly/biweekly only) */}
                    {(formData.recurringFrequency === 'weekly' || formData.recurringFrequency === 'biweekly') && (
                      <div>
                        <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">Repeat on</label>
                        <div className="flex gap-1.5 sm:gap-2">
                          {dayLabels.map((label, index) => (
                            <button
                              key={index}
                              type="button"
                              onClick={() => toggleRepeatDay(index)}
                              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full text-sm font-semibold transition-all ${
                                formData.repeatDays.includes(index)
                                  ? 'bg-teal-700 dark:bg-teal-600 text-white shadow-sm'
                                  : 'bg-white dark:bg-stone-600 text-stone-600 dark:text-stone-300 border border-stone-300 dark:border-stone-500 hover:border-teal-400 dark:hover:border-teal-500'
                              }`}
                            >
                              {label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Ends Section */}
                    <div>
                      <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">Ends</label>
                      <div className="space-y-2">
                        {/* Never */}
                        <label className="flex items-center gap-3 cursor-pointer py-1">
                          <input
                            type="radio"
                            name="endType"
                            checked={formData.endType === 'never'}
                            onChange={() => setFormData({ ...formData, endType: 'never' })}
                            className="w-4 h-4 accent-teal-700"
                          />
                          <span className="text-sm text-stone-700 dark:text-stone-300">Never</span>
                        </label>

                        {/* On date */}
                        <label className="flex items-center gap-3 cursor-pointer py-1">
                          <input
                            type="radio"
                            name="endType"
                            checked={formData.endType === 'on'}
                            onChange={() => setFormData({ ...formData, endType: 'on' })}
                            className="w-4 h-4 accent-teal-700"
                          />
                          <span className="text-sm text-stone-700 dark:text-stone-300">On</span>
                          <input
                            type="date"
                            value={formData.endDate}
                            onChange={(e) => setFormData({ ...formData, endDate: e.target.value, endType: 'on' })}
                            onFocus={() => setFormData({ ...formData, endType: 'on' })}
                            min={formData.date}
                            className="flex-1 px-3 py-1.5 bg-white dark:bg-stone-700 border border-stone-200 dark:border-stone-600 text-stone-900 dark:text-stone-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                          />
                        </label>

                        {/* After N occurrences */}
                        <label className="flex items-center gap-3 cursor-pointer py-1">
                          <input
                            type="radio"
                            name="endType"
                            checked={formData.endType === 'after'}
                            onChange={() => setFormData({ ...formData, endType: 'after' })}
                            className="w-4 h-4 accent-teal-700"
                          />
                          <span className="text-sm text-stone-700 dark:text-stone-300">After</span>
                          <input
                            type="number"
                            min="1"
                            max="100"
                            value={formData.recurringCount}
                            onChange={(e) => setFormData({ ...formData, recurringCount: parseInt(e.target.value) || 1, endType: 'after' })}
                            onFocus={() => setFormData({ ...formData, endType: 'after' })}
                            className="w-20 px-3 py-1.5 bg-white dark:bg-stone-700 border border-stone-200 dark:border-stone-600 text-stone-900 dark:text-stone-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm text-center"
                          />
                          <span className="text-sm text-stone-700 dark:text-stone-300">occurrences</span>
                        </label>
                      </div>
                    </div>

                    {/* Preview Count */}
                    {previewCount > 0 && (
                      <div className="flex items-center gap-2 pt-1 text-sm">
                        <Calendar className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                        <span className="text-teal-700 dark:text-teal-400 font-medium">
                          Will create {previewCount} lesson{previewCount !== 1 ? 's' : ''}
                          {formData.endType === 'never' ? ' (max)' : ''}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 border border-stone-300 dark:border-stone-600 text-stone-700 dark:text-stone-300 rounded-lg hover:bg-stone-50 dark:hover:bg-stone-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!formData.studentId}
                  className="flex-1 py-3 bg-teal-700 dark:bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-600 dark:hover:bg-teal-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {formData.recurring ? `Schedule ${previewCount} Lesson${previewCount !== 1 ? 's' : ''}` : 'Schedule Lesson'}
                </button>
              </div>
            </form>
          </div>
        </div>
      );
    }

export default AddLessonModal;
