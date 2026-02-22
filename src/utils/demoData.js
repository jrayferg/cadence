/**
 * demoData.js
 * Creates 50 sample students and their lesson schedules.
 * Used during onboarding when logging in as "Jennaca" to populate
 * the app with realistic data for testing and demos.
 *
 * Students are organized by age group:
 * - Elementary (ages 8-12): IDs 1-10, all have parents
 * - Middle school (ages 11-14): IDs 11-20, all have parents
 * - High school (ages 14-18): IDs 21-35, all have parents
 * - Adults: IDs 36-50, no parent info
 *
 * Lessons are generated Monday-Friday, 8 AM - 4 PM, from Feb 18 through June 30, 2026.
 */

export const generateDemoData = () => {
  const students = [
    // Elementary students (ages 8-12) - mostly have parents
    { id: 1, name: 'Emma Thompson', email: 'emma.thompson@email.com', phone: '214-555-0101', isMinor: true, parentName: 'Sarah Thompson', parentEmail: 'sarah.thompson@email.com', parentPhone: '214-555-0101', defaultLessonType: 'Private Lesson', customRate: '' },
    { id: 2, name: 'Liam Anderson', email: 'liam.anderson@email.com', phone: '214-555-0102', isMinor: true, parentName: 'Michael Anderson', parentEmail: 'michael.anderson@email.com', parentPhone: '214-555-0102', defaultLessonType: 'Private Lesson', customRate: '' },
    { id: 3, name: 'Olivia Martinez', email: 'olivia.martinez@email.com', phone: '214-555-0103', isMinor: true, parentName: 'Rosa Martinez', parentEmail: 'rosa.martinez@email.com', parentPhone: '214-555-0103', defaultLessonType: 'Private Lesson', customRate: '45' },
    { id: 4, name: 'Noah Williams', email: 'noah.williams@email.com', phone: '214-555-0104', isMinor: true, parentName: 'Jennifer Williams', parentEmail: 'jennifer.williams@email.com', parentPhone: '214-555-0104', defaultLessonType: 'Private Lesson', customRate: '' },
    { id: 5, name: 'Ava Johnson', email: 'ava.johnson@email.com', phone: '214-555-0105', isMinor: true, parentName: 'David Johnson', parentEmail: 'david.johnson@email.com', parentPhone: '214-555-0105', defaultLessonType: 'Private Lesson', customRate: '' },
    { id: 6, name: 'Sophia Chen', email: 'sophia.chen@email.com', phone: '214-555-0106', isMinor: true, parentName: 'Lisa Chen', parentEmail: 'lisa.chen@email.com', parentPhone: '214-555-0106', defaultLessonType: 'Private Lesson', customRate: '' },
    { id: 7, name: 'Jackson Brown', email: 'jackson.brown@email.com', phone: '214-555-0107', isMinor: true, parentName: 'Mark Brown', parentEmail: 'mark.brown@email.com', parentPhone: '214-555-0107', defaultLessonType: 'Group Lesson', customRate: '' },
    { id: 8, name: 'Isabella Garcia', email: 'isabella.garcia@email.com', phone: '214-555-0108', isMinor: true, parentName: 'Maria Garcia', parentEmail: 'maria.garcia@email.com', parentPhone: '214-555-0108', defaultLessonType: 'Private Lesson', customRate: '' },
    { id: 9, name: 'Lucas Davis', email: 'lucas.davis@email.com', phone: '214-555-0109', isMinor: true, parentName: 'Robert Davis', parentEmail: 'robert.davis@email.com', parentPhone: '214-555-0109', defaultLessonType: 'Group Lesson', customRate: '' },
    { id: 10, name: 'Mia Rodriguez', email: 'mia.rodriguez@email.com', phone: '214-555-0110', isMinor: true, parentName: 'Carmen Rodriguez', parentEmail: 'carmen.rodriguez@email.com', parentPhone: '214-555-0110', defaultLessonType: 'Private Lesson', customRate: '' },

    // Middle school students (ages 11-14)
    { id: 11, name: 'Ethan Wilson', email: 'ethan.wilson@email.com', phone: '214-555-0111', isMinor: true, parentName: 'Amanda Wilson', parentEmail: 'amanda.wilson@email.com', parentPhone: '214-555-0111', defaultLessonType: 'Private Lesson', customRate: '' },
    { id: 12, name: 'Charlotte Moore', email: 'charlotte.moore@email.com', phone: '214-555-0112', isMinor: true, parentName: 'James Moore', parentEmail: 'james.moore@email.com', parentPhone: '214-555-0112', defaultLessonType: 'Private Lesson', customRate: '' },
    { id: 13, name: 'Mason Taylor', email: 'mason.taylor@email.com', phone: '214-555-0113', isMinor: true, parentName: 'Patricia Taylor', parentEmail: 'patricia.taylor@email.com', parentPhone: '214-555-0113', defaultLessonType: 'Group Lesson', customRate: '' },
    { id: 14, name: 'Amelia Thomas', email: 'amelia.thomas@email.com', phone: '214-555-0114', isMinor: true, parentName: 'Karen Thomas', parentEmail: 'karen.thomas@email.com', parentPhone: '214-555-0114', defaultLessonType: 'Private Lesson', customRate: '' },
    { id: 15, name: 'Logan Jackson', email: 'logan.jackson@email.com', phone: '214-555-0115', isMinor: true, parentName: 'Steven Jackson', parentEmail: 'steven.jackson@email.com', parentPhone: '214-555-0115', defaultLessonType: 'Private Lesson', customRate: '' },
    { id: 16, name: 'Harper White', email: 'harper.white@email.com', phone: '214-555-0116', isMinor: true, parentName: 'Michelle White', parentEmail: 'michelle.white@email.com', parentPhone: '214-555-0116', defaultLessonType: 'Private Lesson', customRate: '' },
    { id: 17, name: 'Elijah Harris', email: 'elijah.harris@email.com', phone: '214-555-0117', isMinor: true, parentName: 'Brian Harris', parentEmail: 'brian.harris@email.com', parentPhone: '214-555-0117', defaultLessonType: 'Group Lesson', customRate: '' },
    { id: 18, name: 'Evelyn Martin', email: 'evelyn.martin@email.com', phone: '214-555-0118', isMinor: true, parentName: 'Nancy Martin', parentEmail: 'nancy.martin@email.com', parentPhone: '214-555-0118', defaultLessonType: 'Private Lesson', customRate: '' },
    { id: 19, name: 'Aiden Lee', email: 'aiden.lee@email.com', phone: '214-555-0119', isMinor: true, parentName: 'Susan Lee', parentEmail: 'susan.lee@email.com', parentPhone: '214-555-0119', defaultLessonType: 'Private Lesson', customRate: '' },
    { id: 20, name: 'Abigail Walker', email: 'abigail.walker@email.com', phone: '214-555-0120', isMinor: true, parentName: 'Paul Walker', parentEmail: 'paul.walker@email.com', parentPhone: '214-555-0120', defaultLessonType: 'Group Lesson', customRate: '' },

    // High school students (ages 14-18)
    { id: 21, name: 'Benjamin Hall', email: 'benjamin.hall@email.com', phone: '214-555-0121', isMinor: true, parentName: 'Laura Hall', parentEmail: 'laura.hall@email.com', parentPhone: '214-555-0121', defaultLessonType: 'Private Lesson', customRate: '' },
    { id: 22, name: 'Emily Allen', email: 'emily.allen@email.com', phone: '214-555-0122', isMinor: true, parentName: 'George Allen', parentEmail: 'george.allen@email.com', parentPhone: '214-555-0122', defaultLessonType: 'Private Lesson', customRate: '' },
    { id: 23, name: 'Sebastian Young', email: 'sebastian.young@email.com', phone: '214-555-0123', isMinor: true, parentName: 'Barbara Young', parentEmail: 'barbara.young@email.com', parentPhone: '214-555-0123', defaultLessonType: 'Private Lesson', customRate: '' },
    { id: 24, name: 'Ella King', email: 'ella.king@email.com', phone: '214-555-0124', isMinor: true, parentName: 'Daniel King', parentEmail: 'daniel.king@email.com', parentPhone: '214-555-0124', defaultLessonType: 'Private Lesson', customRate: '' },
    { id: 25, name: 'Alexander Wright', email: 'alexander.wright@email.com', phone: '214-555-0125', isMinor: true, parentName: 'Rebecca Wright', parentEmail: 'rebecca.wright@email.com', parentPhone: '214-555-0125', defaultLessonType: 'Private Lesson', customRate: '' },
    { id: 26, name: 'Scarlett Lopez', email: 'scarlett.lopez@email.com', phone: '214-555-0126', isMinor: true, parentName: 'Antonio Lopez', parentEmail: 'antonio.lopez@email.com', parentPhone: '214-555-0126', defaultLessonType: 'Group Lesson', customRate: '' },
    { id: 27, name: 'Henry Hill', email: 'henry.hill@email.com', phone: '214-555-0127', isMinor: true, parentName: 'Dorothy Hill', parentEmail: 'dorothy.hill@email.com', parentPhone: '214-555-0127', defaultLessonType: 'Private Lesson', customRate: '' },
    { id: 28, name: 'Grace Scott', email: 'grace.scott@email.com', phone: '214-555-0128', isMinor: true, parentName: 'Edward Scott', parentEmail: 'edward.scott@email.com', parentPhone: '214-555-0128', defaultLessonType: 'Private Lesson', customRate: '' },
    { id: 29, name: 'Jack Green', email: 'jack.green@email.com', phone: '214-555-0129', isMinor: true, parentName: 'Sandra Green', parentEmail: 'sandra.green@email.com', parentPhone: '214-555-0129', defaultLessonType: 'Group Lesson', customRate: '' },
    { id: 30, name: 'Chloe Adams', email: 'chloe.adams@email.com', phone: '214-555-0130', isMinor: true, parentName: 'Kevin Adams', parentEmail: 'kevin.adams@email.com', parentPhone: '214-555-0130', defaultLessonType: 'Private Lesson', customRate: '' },

    // More high school students
    { id: 31, name: 'Daniel Baker', email: 'daniel.baker@email.com', phone: '214-555-0131', isMinor: true, parentName: 'Angela Baker', parentEmail: 'angela.baker@email.com', parentPhone: '214-555-0131', defaultLessonType: 'Private Lesson', customRate: '' },
    { id: 32, name: 'Madison Nelson', email: 'madison.nelson@email.com', phone: '214-555-0132', isMinor: true, parentName: 'Timothy Nelson', parentEmail: 'timothy.nelson@email.com', parentPhone: '214-555-0132', defaultLessonType: 'Private Lesson', customRate: '' },
    { id: 33, name: 'Samuel Carter', email: 'samuel.carter@email.com', phone: '214-555-0133', isMinor: true, parentName: 'Helen Carter', parentEmail: 'helen.carter@email.com', parentPhone: '214-555-0133', defaultLessonType: 'Group Lesson', customRate: '' },
    { id: 34, name: 'Lily Mitchell', email: 'lily.mitchell@email.com', phone: '214-555-0134', isMinor: true, parentName: 'Joshua Mitchell', parentEmail: 'joshua.mitchell@email.com', parentPhone: '214-555-0134', defaultLessonType: 'Private Lesson', customRate: '' },
    { id: 35, name: 'Matthew Perez', email: 'matthew.perez@email.com', phone: '214-555-0135', isMinor: true, parentName: 'Melissa Perez', parentEmail: 'melissa.perez@email.com', parentPhone: '214-555-0135', defaultLessonType: 'Private Lesson', customRate: '' },

    // Adult students (no parents)
    { id: 36, name: 'Rachel Cooper', email: 'rachel.cooper@email.com', phone: '214-555-0136', isMinor: false, defaultLessonType: 'Private Lesson', customRate: '' },
    { id: 37, name: 'Andrew Richardson', email: 'andrew.richardson@email.com', phone: '214-555-0137', isMinor: false, defaultLessonType: 'Private Lesson', customRate: '' },
    { id: 38, name: 'Victoria Cox', email: 'victoria.cox@email.com', phone: '214-555-0138', isMinor: false, defaultLessonType: 'Private Lesson', customRate: '55' },
    { id: 39, name: 'Ryan Howard', email: 'ryan.howard@email.com', phone: '214-555-0139', isMinor: false, defaultLessonType: 'Group Lesson', customRate: '' },
    { id: 40, name: 'Natalie Ward', email: 'natalie.ward@email.com', phone: '214-555-0140', isMinor: false, defaultLessonType: 'Private Lesson', customRate: '' },
    { id: 41, name: 'Christopher Torres', email: 'chris.torres@email.com', phone: '214-555-0141', isMinor: false, defaultLessonType: 'Private Lesson', customRate: '' },
    { id: 42, name: 'Hannah Peterson', email: 'hannah.peterson@email.com', phone: '214-555-0142', isMinor: false, defaultLessonType: 'Private Lesson', customRate: '' },
    { id: 43, name: 'Nicholas Gray', email: 'nicholas.gray@email.com', phone: '214-555-0143', isMinor: false, defaultLessonType: 'Group Lesson', customRate: '' },
    { id: 44, name: 'Samantha Ramirez', email: 'samantha.ramirez@email.com', phone: '214-555-0144', isMinor: false, defaultLessonType: 'Private Lesson', customRate: '' },
    { id: 45, name: 'Tyler James', email: 'tyler.james@email.com', phone: '214-555-0145', isMinor: false, defaultLessonType: 'Private Lesson', customRate: '' },
    { id: 46, name: 'Lauren Watson', email: 'lauren.watson@email.com', phone: '214-555-0146', isMinor: false, defaultLessonType: 'Private Lesson', customRate: '' },
    { id: 47, name: 'Brandon Brooks', email: 'brandon.brooks@email.com', phone: '214-555-0147', isMinor: false, defaultLessonType: 'Group Lesson', customRate: '' },
    { id: 48, name: 'Ashley Kelly', email: 'ashley.kelly@email.com', phone: '214-555-0148', isMinor: false, defaultLessonType: 'Private Lesson', customRate: '' },
    { id: 49, name: 'Justin Sanders', email: 'justin.sanders@email.com', phone: '214-555-0149', isMinor: false, defaultLessonType: 'Private Lesson', customRate: '' },
    { id: 50, name: 'Stephanie Price', email: 'stephanie.price@email.com', phone: '214-555-0150', isMinor: false, defaultLessonType: 'Private Lesson', customRate: '60' },
  ];

  // Generate lessons Monday-Friday 8am-4pm through June 30, 2026
  const lessons = [];
  let lessonId = 1;
  const startDate = new Date('2026-02-18'); // Start from tomorrow
  const endDate = new Date('2026-06-30');

  // Time slots available each day (8am-4pm, 30-min intervals)
  const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30'
  ];

  // Assign each student a recurring weekly time slot
  const studentSchedules = students.map((student, index) => {
    const dayOfWeek = index % 5; // 0=Mon, 1=Tue, 2=Wed, 3=Thu, 4=Fri
    const timeSlot = timeSlots[index % timeSlots.length];
    const lessonType = student.defaultLessonType;
    const duration = lessonType === 'Private Lesson' ? 30 : lessonType === 'Group Lesson' ? 45 : 60;
    const rate = student.customRate || (lessonType === 'Private Lesson' ? 50 : lessonType === 'Group Lesson' ? 40 : 25);

    return {
      studentId: student.id,
      dayOfWeek,
      time: timeSlot,
      lessonType,
      duration,
      rate: parseFloat(rate)
    };
  });

  // Generate lessons for each week
  const currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    const dayOfWeek = currentDate.getDay();

    // Skip weekends
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      const mondayBasedDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

      // Find students scheduled for this day
      const todayStudents = studentSchedules.filter(s => s.dayOfWeek === mondayBasedDay);

      todayStudents.forEach(schedule => {
        const dateStr = currentDate.toISOString().split('T')[0];
        const isPast = currentDate < new Date();

        lessons.push({
          id: lessonId++,
          studentId: schedule.studentId,
          date: dateStr,
          time: schedule.time,
          lessonType: schedule.lessonType,
          duration: schedule.duration,
          rate: schedule.rate,
          status: isPast ? 'completed' : 'scheduled',
          attendance: isPast ? (Math.random() > 0.1 ? 'present' : 'absent') : undefined,
          notes: isPast && Math.random() > 0.7 ? 'Great progress! Student is mastering scales.' : undefined
        });
      });
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return { students, lessons };
};
