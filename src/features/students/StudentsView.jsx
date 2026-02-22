import { useState } from 'react';
import { Plus, Users, ChevronDown } from '@/components/icons';
import StudentCard from '@/features/students/StudentCard';
import StudentListView from '@/features/students/StudentListView';
import StudentProfileView from '@/features/students/StudentProfileView';
import AddStudentModal from '@/features/students/AddStudentModal';

/**
 * StudentsView - Container component for the Students tab.
 * Manages student search, view mode toggling (cards/list), and orchestrates
 * child components: StudentCard, StudentListView, StudentProfileView, AddStudentModal.
 *
 * @param {Object} props
 * @param {Array} props.students - All students array
 * @param {Array} props.lessons - All lessons array
 * @param {Function} props.setStudents - State setter for students
 * @param {Object} props.user - Current user object (contains lessonTypes, businessName, etc.)
 */
    function StudentsView({ students, lessons, setStudents, user }) {
      const [showAddModal, setShowAddModal] = useState(false);
      const [editingStudent, setEditingStudent] = useState(null);
      const [searchQuery, setSearchQuery] = useState('');
      const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'list'
      const [viewingStudent, setViewingStudent] = useState(null); // NEW - for profile view

      const handleEdit = (student) => {
        setEditingStudent(student);
        setShowAddModal(true);
      };

      const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this student?')) {
          setStudents(students.filter(s => s.id !== id));
        }
      };

      const handleViewProfile = (student) => {
        setViewingStudent(student);
      };

      // Filter students by search
      const filteredStudents = students.filter(student => {
        if (!searchQuery) return true;
        const searchLower = searchQuery.toLowerCase();
        return (
          student.name.toLowerCase().includes(searchLower) ||
          student.email.toLowerCase().includes(searchLower) ||
          (student.parentName && student.parentName.toLowerCase().includes(searchLower))
        );
      });

      return (
        <div className="animate-fade-in space-y-4 sm:space-y-6">
          {/* Students Header - Row 1: Title + Search */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-stone-200 dark:border-stone-700">
            <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-100">Students</h2>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search students..."
                className="pl-10 pr-4 py-2 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-600 text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 w-full sm:w-80 transition-colors"
              />
              <svg className="w-5 h-5 text-stone-400 dark:text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"/>
              </svg>
            </div>
          </div>

          {/* Students Header - Row 2: Add Student (Left) + View Dropdown + Print/Export (Right) */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <button
              onClick={() => {
                setEditingStudent(null);
                setShowAddModal(true);
              }}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-teal-700 dark:bg-teal-600 text-white rounded-lg hover:bg-teal-600 dark:hover:bg-teal-500 transition-colors text-sm sm:text-base"
            >
              <Plus className="w-5 h-5" />
              Add Student
            </button>

            {/* Right: View Dropdown + Print/Export */}
            <div className="flex items-center gap-2 ml-auto">
              {/* View Dropdown */}
              <div className="relative">
                <select
                  value={viewMode}
                  onChange={(e) => setViewMode(e.target.value)}
                  className="appearance-none px-3 sm:px-4 py-2 pr-8 sm:pr-10 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-600 rounded-lg text-sm font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400"
                >
                  <option value="cards">Cards</option>
                  <option value="list">List</option>
                </select>
                <ChevronDown className="w-4 h-4 text-stone-500 dark:text-stone-400 absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Print Button */}
              <button
                onClick={() => window.print()}
                className="p-2 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-600 rounded-lg hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors hidden sm:block"
                title="Print"
              >
                <svg className="w-5 h-5 text-stone-600 dark:text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"/>
                </svg>
              </button>

              {/* Export Button */}
              <button
                onClick={() => {
                  let exportText = `Students - ${user.businessName || 'Music Studio'}\n\n`;
                  filteredStudents.forEach(student => {
                    exportText += `${student.name}\n`;
                    exportText += `Email: ${student.isMinor ? student.parentEmail : student.email}\n`;
                    if (student.phone) exportText += `Phone: ${student.isMinor ? student.parentPhone : student.phone}\n`;
                    exportText += `\n`;
                  });
                  const blob = new Blob([exportText], { type: 'text/plain' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'students-list.txt';
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="p-2 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-600 rounded-lg hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors hidden sm:block"
                title="Export"
              >
                <svg className="w-5 h-5 text-stone-600 dark:text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"/>
                </svg>
              </button>
            </div>
          </div>

          {filteredStudents.length === 0 ? (
            <div className="bg-white dark:bg-stone-800 rounded-xl p-12 border border-stone-200 dark:border-stone-700 text-center transition-colors">
              <Users className="w-16 h-16 text-stone-300 dark:text-stone-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-stone-900 dark:text-stone-100 mb-2">
                {students.length === 0 ? 'No students yet' : 'No students found'}
              </h3>
              <p className="text-stone-600 dark:text-stone-400 mb-6">
                {students.length === 0
                  ? 'Add your first student to get started scheduling lessons.'
                  : 'Try adjusting your search to find students.'
                }
              </p>
              {students.length === 0 && (
                <button
                  onClick={() => setShowAddModal(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-teal-700 dark:bg-teal-600 text-white rounded-lg hover:bg-teal-600 dark:hover:bg-teal-500 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Add Your First Student
                </button>
              )}
            </div>
          ) : viewMode === 'cards' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredStudents.map(student => (
                <StudentCard
                  key={student.id}
                  student={student}
                  lessons={lessons}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onViewProfile={handleViewProfile}
                  lessonTypes={user.lessonTypes}
                />
              ))}
            </div>
          ) : (
            <StudentListView
              students={filteredStudents}
              lessons={lessons}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onViewProfile={handleViewProfile}
            />
          )}

          {/* Student Profile View Modal */}
          {viewingStudent && (
            <StudentProfileView
              student={viewingStudent}
              lessons={lessons}
              onClose={() => setViewingStudent(null)}
              onEdit={(student) => {
                setViewingStudent(null);
                setEditingStudent(student);
                setShowAddModal(true);
              }}
              lessonTypes={user.lessonTypes}
            />
          )}

          {/* Add/Edit Student Modal */}
          {showAddModal && (
            <AddStudentModal
              student={editingStudent}
              onClose={() => {
                setShowAddModal(false);
                setEditingStudent(null);
              }}
              onSave={(student) => {
                if (editingStudent) {
                  setStudents(students.map(s => s.id === student.id ? student : s));
                } else {
                  setStudents([...students, { ...student, id: Date.now() }]);
                }
                setShowAddModal(false);
                setEditingStudent(null);
              }}
              lessonTypes={user.lessonTypes}
            />
          )}
        </div>
      );
    }

export default StudentsView;
