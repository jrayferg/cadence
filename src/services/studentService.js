/**
 * studentService.js
 * All student-related business logic lives here.
 *
 * Same pattern as lessonService: functions take the current array
 * and return a NEW one. Components call setStudents() with the result.
 */

/**
 * Add a new student.
 */
export function addStudent(students, studentData) {
  const newStudent = {
    ...studentData,
    id: Date.now(),
  };
  return [...students, newStudent];
}

/**
 * Update an existing student's info.
 */
export function updateStudent(students, updatedStudent) {
  return students.map(student =>
    student.id === updatedStudent.id ? { ...student, ...updatedStudent } : student
  );
}

/**
 * Delete a student by ID.
 */
export function deleteStudent(students, studentId) {
  return students.filter(student => student.id !== studentId);
}

/**
 * Find a student by ID.
 */
export function getStudentById(students, studentId) {
  return students.find(student => student.id === studentId);
}

/**
 * Search students by name (case-insensitive).
 */
export function searchStudents(students, query) {
  if (!query) return students;
  const lower = query.toLowerCase();
  return students.filter(student =>
    student.name.toLowerCase().includes(lower)
  );
}
