import { formatTime12Hour } from '@/utils/formatTime';
import { X } from '@/components/icons';

/**
 * StudentProfileView - Read-only modal displaying a student's full profile.
 * Shows contact info, address, emergency contact, lesson preferences, stats, and upcoming lessons.
 *
 * @param {Object} props
 * @param {Object} props.student - The student object to display
 * @param {Array} props.lessons - All lessons array
 * @param {Function} props.onClose - Callback to close the modal
 * @param {Function} props.onEdit - Callback to switch to edit mode for this student
 * @param {Array} props.lessonTypes - Available lesson types from user settings
 */
    function StudentProfileView({ student, lessons, onClose, onEdit, lessonTypes }) {
      const upcomingLessons = lessons
        .filter(l => l.studentId === student.id && l.status === 'scheduled')
        .filter(l => new Date(l.date + 'T' + l.time) >= new Date())
        .sort((a, b) => new Date(a.date + 'T' + a.time) - new Date(b.date + 'T' + b.time))
        .slice(0, 5);

      const completedLessons = lessons
        .filter(l => l.studentId === student.id && l.status === 'completed')
        .length;

      const totalRevenue = lessons
        .filter(l => l.studentId === student.id && l.status === 'completed')
        .reduce((sum, l) => sum + (l.rate || 0), 0);

      return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4" onClick={onClose}>
          <div
            className="bg-white dark:bg-stone-800 rounded-2xl w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* FIXED HEADER */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-stone-200 dark:border-stone-700">
              <div className="flex items-center gap-3 sm:gap-4">
                {student.profileImage && (
                  <img
                    src={student.profileImage}
                    alt={student.name}
                    className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-stone-200 dark:border-stone-600"
                    onError={(e) => e.target.style.display = 'none'}
                  />
                )}
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100">{student.name}</h3>
                  {student.isMinor && student.parentName && (
                    <p className="text-sm text-stone-500 dark:text-stone-400">Parent: {student.parentName}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => onEdit(student)}
                  className="px-4 py-2 bg-teal-700 dark:bg-teal-600 text-white rounded-lg hover:bg-teal-600 dark:hover:bg-teal-500 transition-colors"
                >
                  Edit Profile
                </button>
                <button onClick={onClose} className="p-2 hover:bg-stone-100 dark:hover:bg-stone-700 rounded-lg">
                  <X className="w-6 h-6 text-stone-600 dark:text-stone-400" />
                </button>
              </div>
            </div>

            {/* SCROLLABLE CONTENT */}
            <div className="overflow-y-auto p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* Contact Information */}
                  <div className="bg-stone-50 dark:bg-stone-900 p-4 rounded-lg border border-stone-200 dark:border-stone-700">
                    <h4 className="font-semibold text-stone-900 dark:text-stone-100 mb-3">Contact Information</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-stone-500 dark:text-stone-400">Email:</span>
                        <span className="ml-2 text-stone-900 dark:text-stone-100">{student.isMinor ? student.parentEmail : student.email}</span>
                      </div>
                      {(student.phone || student.parentPhone) && (
                        <div>
                          <span className="text-stone-500 dark:text-stone-400">Phone:</span>
                          <span className="ml-2 text-stone-900 dark:text-stone-100">{student.isMinor ? student.parentPhone : student.phone}</span>
                        </div>
                      )}
                      {student.dateOfBirth && (
                        <div>
                          <span className="text-stone-500 dark:text-stone-400">Date of Birth:</span>
                          <span className="ml-2 text-stone-900 dark:text-stone-100">{new Date(student.dateOfBirth + 'T00:00').toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Address */}
                  {((student.isMinor && student.parentAddressLine1) || (!student.isMinor && student.addressLine1)) && (
                    <div className="bg-stone-50 dark:bg-stone-900 p-4 rounded-lg border border-stone-200 dark:border-stone-700">
                      <h4 className="font-semibold text-stone-900 dark:text-stone-100 mb-3">Address</h4>
                      <div className="text-sm text-stone-900 dark:text-stone-100">
                        {student.isMinor ? (
                          <>
                            <p>{student.parentAddressLine1}</p>
                            {student.parentAddressLine2 && <p>{student.parentAddressLine2}</p>}
                            <p>{student.parentCity}, {student.parentState} {student.parentZipCode}</p>
                          </>
                        ) : (
                          <>
                            <p>{student.addressLine1}</p>
                            {student.addressLine2 && <p>{student.addressLine2}</p>}
                            <p>{student.city}, {student.state} {student.zipCode}</p>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Emergency Contact */}
                  {student.emergencyContactName && (
                    <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
                      <h4 className="font-semibold text-stone-900 dark:text-stone-100 mb-3">Emergency Contact</h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-stone-500 dark:text-stone-400">Name:</span>
                          <span className="ml-2 text-stone-900 dark:text-stone-100">{student.emergencyContactName}</span>
                        </div>
                        {student.emergencyContactPhone && (
                          <div>
                            <span className="text-stone-500 dark:text-stone-400">Phone:</span>
                            <span className="ml-2 text-stone-900 dark:text-stone-100">{student.emergencyContactPhone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Lesson Preferences */}
                  <div className="bg-teal-50 dark:bg-teal-900/20 p-4 rounded-lg border border-teal-200 dark:border-teal-800">
                    <h4 className="font-semibold text-stone-900 dark:text-stone-100 mb-3">Lesson Preferences</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-stone-500 dark:text-stone-400">Type:</span>
                        <span className="ml-2 text-stone-900 dark:text-stone-100">{student.defaultLessonType}</span>
                      </div>
                      {student.customRate && (
                        <div>
                          <span className="text-stone-500 dark:text-stone-400">Custom Rate:</span>
                          <span className="ml-2 text-stone-900 dark:text-stone-100">${student.customRate}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column - Stats & Lessons */}
                <div className="space-y-6">
                  {/* Stats Cards */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg text-center border border-blue-200 dark:border-blue-800">
                      <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                        {upcomingLessons.length}
                      </div>
                      <div className="text-xs text-stone-600 dark:text-stone-400">Upcoming</div>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg text-center border border-green-200 dark:border-green-800">
                      <div className="text-2xl font-bold text-green-700 dark:text-green-400">
                        {completedLessons}
                      </div>
                      <div className="text-xs text-stone-600 dark:text-stone-400">Completed</div>
                    </div>
                    <div className="bg-teal-50 dark:bg-teal-900/20 p-3 rounded-lg text-center border border-teal-200 dark:border-teal-800">
                      <div className="text-2xl font-bold text-teal-700 dark:text-teal-400">
                        ${totalRevenue.toFixed(0)}
                      </div>
                      <div className="text-xs text-stone-600 dark:text-stone-400">Revenue</div>
                    </div>
                  </div>

                  {/* Upcoming Lessons */}
                  <div className="bg-stone-50 dark:bg-stone-900 p-4 rounded-lg border border-stone-200 dark:border-stone-700">
                    <h4 className="font-semibold text-stone-900 dark:text-stone-100 mb-3">Upcoming Lessons</h4>
                    {upcomingLessons.length === 0 ? (
                      <p className="text-sm text-stone-500 dark:text-stone-400">No upcoming lessons</p>
                    ) : (
                      <div className="space-y-2">
                        {upcomingLessons.map(lesson => (
                          <div
                            key={lesson.id}
                            className="flex justify-between items-center p-2 bg-white dark:bg-stone-800 rounded border border-stone-200 dark:border-stone-700"
                          >
                            <div className="text-sm">
                              <div className="font-medium text-stone-900 dark:text-stone-100">
                                {new Date(lesson.date + 'T00:00').toLocaleDateString('en-US', {
                                  weekday: 'short',
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </div>
                              <div className="text-xs text-stone-500 dark:text-stone-400">
                                {formatTime12Hour(lesson.time)} • {lesson.lessonType}
                              </div>
                            </div>
                            <div className="text-sm font-bold text-teal-700 dark:text-teal-400">
                              ${lesson.rate}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

export default StudentProfileView;
