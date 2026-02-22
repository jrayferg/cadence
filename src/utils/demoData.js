/**
 * demoData.js
 * Generates a complete demo dataset for the Cadence demo account.
 *
 * Demo credentials: cadence.demo@mail.com / demome123
 *
 * Generates:
 * - 40 students (all minors with parent contacts)
 * - Weekly lessons Mon-Fri from Jan 5 through May 29, 2026
 * - 80 invoices (40 January + 40 February), due on the 1st of the next month
 * - ~52 payments: all January paid, February randomized
 * - Billing settings with next invoice number ready
 *
 * All data is deterministic (seeded random) so the demo is identical every time.
 */

// ── Seeded Random ──────────────────────────────────────────────────────

function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

function seededRandom(seed) {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

function demoId(prefix, index) {
  return `demo_${prefix}_${String(index).padStart(4, '0')}`;
}

// ── Students ───────────────────────────────────────────────────────────

function buildStudents() {
  return [
    // Elementary students (ages 8-12) — IDs 1-10
    { id: 1, name: 'Emma Thompson', parentName: 'Sarah Thompson', phone: '214-555-0101' },
    { id: 2, name: 'Liam Anderson', parentName: 'Michael Anderson', phone: '214-555-0102' },
    { id: 3, name: 'Olivia Martinez', parentName: 'Rosa Martinez', phone: '214-555-0103' },
    { id: 4, name: 'Noah Williams', parentName: 'Jennifer Williams', phone: '214-555-0104' },
    { id: 5, name: 'Ava Johnson', parentName: 'David Johnson', phone: '214-555-0105' },
    { id: 6, name: 'Sophia Chen', parentName: 'Lisa Chen', phone: '214-555-0106' },
    { id: 7, name: 'Jackson Brown', parentName: 'Mark Brown', phone: '214-555-0107' },
    { id: 8, name: 'Isabella Garcia', parentName: 'Maria Garcia', phone: '214-555-0108' },
    { id: 9, name: 'Lucas Davis', parentName: 'Robert Davis', phone: '214-555-0109' },
    { id: 10, name: 'Mia Rodriguez', parentName: 'Carmen Rodriguez', phone: '214-555-0110' },

    // Middle school students (ages 11-14) — IDs 11-20
    { id: 11, name: 'Ethan Wilson', parentName: 'Amanda Wilson', phone: '214-555-0111' },
    { id: 12, name: 'Charlotte Moore', parentName: 'James Moore', phone: '214-555-0112' },
    { id: 13, name: 'Mason Taylor', parentName: 'Patricia Taylor', phone: '214-555-0113' },
    { id: 14, name: 'Amelia Thomas', parentName: 'Karen Thomas', phone: '214-555-0114' },
    { id: 15, name: 'Logan Jackson', parentName: 'Steven Jackson', phone: '214-555-0115' },
    { id: 16, name: 'Harper White', parentName: 'Michelle White', phone: '214-555-0116' },
    { id: 17, name: 'Elijah Harris', parentName: 'Brian Harris', phone: '214-555-0117' },
    { id: 18, name: 'Evelyn Martin', parentName: 'Nancy Martin', phone: '214-555-0118' },
    { id: 19, name: 'Aiden Lee', parentName: 'Susan Lee', phone: '214-555-0119' },
    { id: 20, name: 'Abigail Walker', parentName: 'Paul Walker', phone: '214-555-0120' },

    // High school students (ages 14-18) — IDs 21-30
    { id: 21, name: 'Benjamin Hall', parentName: 'Laura Hall', phone: '214-555-0121' },
    { id: 22, name: 'Emily Allen', parentName: 'George Allen', phone: '214-555-0122' },
    { id: 23, name: 'Sebastian Young', parentName: 'Barbara Young', phone: '214-555-0123' },
    { id: 24, name: 'Ella King', parentName: 'Daniel King', phone: '214-555-0124' },
    { id: 25, name: 'Alexander Wright', parentName: 'Rebecca Wright', phone: '214-555-0125' },
    { id: 26, name: 'Scarlett Lopez', parentName: 'Antonio Lopez', phone: '214-555-0126' },
    { id: 27, name: 'Henry Hill', parentName: 'Dorothy Hill', phone: '214-555-0127' },
    { id: 28, name: 'Grace Scott', parentName: 'Edward Scott', phone: '214-555-0128' },
    { id: 29, name: 'Jack Green', parentName: 'Sandra Green', phone: '214-555-0129' },
    { id: 30, name: 'Chloe Adams', parentName: 'Kevin Adams', phone: '214-555-0130' },

    // More high school students — IDs 31-40
    { id: 31, name: 'Daniel Baker', parentName: 'Angela Baker', phone: '214-555-0131' },
    { id: 32, name: 'Madison Nelson', parentName: 'Timothy Nelson', phone: '214-555-0132' },
    { id: 33, name: 'Samuel Carter', parentName: 'Helen Carter', phone: '214-555-0133' },
    { id: 34, name: 'Lily Mitchell', parentName: 'Joshua Mitchell', phone: '214-555-0134' },
    { id: 35, name: 'Matthew Perez', parentName: 'Melissa Perez', phone: '214-555-0135' },
    { id: 36, name: 'Aria Campbell', parentName: 'Raymond Campbell', phone: '214-555-0136' },
    { id: 37, name: 'Owen Phillips', parentName: 'Diane Phillips', phone: '214-555-0137' },
    { id: 38, name: 'Zoey Evans', parentName: 'Kenneth Evans', phone: '214-555-0138' },
    { id: 39, name: 'Caleb Turner', parentName: 'Sharon Turner', phone: '214-555-0139' },
    { id: 40, name: 'Penelope Collins', parentName: 'Gregory Collins', phone: '214-555-0140' },
  ].map(s => {
    const firstName = s.name.split(' ')[0].toLowerCase();
    const lastName = s.name.split(' ')[1].toLowerCase();
    const parentFirst = s.parentName.split(' ')[0].toLowerCase();
    const parentLast = s.parentName.split(' ')[1].toLowerCase();

    return {
      id: s.id,
      name: s.name,
      email: `${firstName}.${lastName}@email.com`,
      phone: s.phone,
      dateOfBirth: '',
      profileImage: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      zipCode: '',
      isMinor: true,
      parentName: s.parentName,
      parentEmail: `${parentFirst}.${parentLast}@email.com`,
      parentPhone: s.phone,
      parentDateOfBirth: '',
      parentAddressLine1: '',
      parentAddressLine2: '',
      parentCity: '',
      parentState: '',
      parentZipCode: '',
      emergencyContactName: s.parentName,
      emergencyContactPhone: s.phone,
      defaultLessonType: 'Private Lesson',
      customRate: '25',
      billingModel: 'per-lesson',
      monthlyRate: '',
      stripeCustomerId: '',
    };
  });
}

// ── Lessons ────────────────────────────────────────────────────────────

const LESSON_NOTES = [
  'Great progress on scales today!',
  'Working on sight-reading exercises.',
  'Student mastering the assigned piece nicely.',
  'Needs more practice on rhythm — assigned metronome drills.',
  'Excellent recital preparation session.',
  'Reviewed music theory fundamentals.',
  'Introduced new piece — student excited to learn it.',
  'Focused on dynamics and expression.',
  'Good tempo control today, improving steadily.',
  'Worked on posture and hand positioning.',
  'Student performed assigned piece from memory.',
  'Assigned new scales for next week.',
  'Ear training exercises went well.',
  'Practiced duet piece — ready for recital.',
  'Reviewed chord progressions and inversions.',
];

const TIME_SLOTS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
];

function buildLessons(students) {
  const lessons = [];
  let lessonId = 1;
  const startDate = new Date('2026-01-05T00:00:00');
  const endDate = new Date('2026-05-29T00:00:00');
  const today = new Date('2026-02-22T00:00:00');

  // Assign each student a fixed day + time slot
  const schedules = students.map((student, index) => ({
    studentId: student.id,
    dayOfWeek: index % 5,                  // 0=Mon, 1=Tue, 2=Wed, 3=Thu, 4=Fri
    time: TIME_SLOTS[index % TIME_SLOTS.length],
  }));

  const currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    const jsDay = currentDate.getDay(); // 0=Sun ... 6=Sat
    if (jsDay >= 1 && jsDay <= 5) {
      const mondayBased = jsDay - 1; // 0=Mon ... 4=Fri
      const dateStr = currentDate.toISOString().split('T')[0];

      const todayStudents = schedules.filter(s => s.dayOfWeek === mondayBased);
      todayStudents.forEach(schedule => {
        const isPast = currentDate < today;
        const seed = hashCode(`${schedule.studentId}-${dateStr}`);
        const rand = seededRandom(seed);

        let status = 'scheduled';
        let attendance;
        let notes;

        if (isPast) {
          if (rand < 0.08) {
            status = 'cancelled';
          } else {
            status = 'completed';
            attendance = rand > 0.96 ? 'absent' : 'present';
            // ~20% of completed lessons get a note
            const rand2 = seededRandom(seed + 42);
            if (rand2 < 0.20) {
              notes = LESSON_NOTES[Math.floor(seededRandom(seed + 99) * LESSON_NOTES.length)];
            }
          }
        }

        lessons.push({
          id: lessonId++,
          studentId: schedule.studentId,
          date: dateStr,
          time: schedule.time,
          lessonType: 'Private Lesson',
          duration: 30,
          rate: 25,
          status,
          attendance,
          notes,
        });
      });
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return lessons;
}

// ── Invoices & Payments ────────────────────────────────────────────────

const PAYMENT_METHODS = ['venmo', 'venmo', 'venmo', 'zelle', 'zelle', 'zelle', 'card', 'card', 'cash', 'cash', 'cash', 'check'];

function buildInvoicesAndPayments(students, lessons) {
  const invoices = [];
  const payments = [];
  let invoiceSeq = 1;
  let paymentSeq = 1;

  // Count non-cancelled lessons per student per month
  function countLessons(studentId, monthStart, monthEnd) {
    return lessons.filter(l =>
      l.studentId === studentId &&
      l.status !== 'cancelled' &&
      l.date >= monthStart &&
      l.date <= monthEnd
    ).length;
  }

  students.forEach((student, index) => {
    // ── January Invoice ──
    const janCount = countLessons(student.id, '2026-01-01', '2026-01-31');
    const janTotal = janCount * 25;
    const janInvId = demoId('inv', invoiceSeq);
    const janInvNum = `INV-${1000 + invoiceSeq}`;
    invoiceSeq++;

    invoices.push({
      id: janInvId,
      invoiceNumber: janInvNum,
      studentId: student.id,
      status: 'paid',
      createdDate: '2026-01-31',
      dueDate: '2026-02-01',
      items: [{
        description: `January 2026 — Private Lesson (${janCount} lessons)`,
        quantity: janCount,
        rate: 25,
        amount: janTotal,
      }],
      subtotal: janTotal,
      discount: 0,
      tax: 0,
      total: janTotal,
      amountPaid: janTotal,
      balance: 0,
      billingModel: 'per-lesson',
      billingPeriodStart: '2026-01-01',
      billingPeriodEnd: '2026-01-31',
      notes: '',
      stripeInvoiceId: '',
      stripePaymentLink: '',
    });

    // January payment (all paid in full)
    const methodSeed = seededRandom(hashCode(`pay-jan-${student.id}`));
    const methodIdx = Math.floor(methodSeed * PAYMENT_METHODS.length);
    const payDay = 15 + Math.floor(seededRandom(hashCode(`payday-jan-${student.id}`)) * 17); // 15-31
    const payDayStr = `2026-01-${String(Math.min(payDay, 31)).padStart(2, '0')}`;

    payments.push({
      id: demoId('pay', paymentSeq++),
      invoiceId: janInvId,
      studentId: student.id,
      amount: janTotal,
      method: PAYMENT_METHODS[methodIdx],
      date: payDayStr,
      notes: '',
    });

    // ── February Invoice ──
    const febCount = countLessons(student.id, '2026-02-01', '2026-02-28');
    const febTotal = febCount * 25;
    const febInvId = demoId('inv', invoiceSeq);
    const febInvNum = `INV-${1000 + invoiceSeq}`;
    invoiceSeq++;

    // Determine February payment status using seeded random
    const febRand = seededRandom(hashCode(`feb-status-${student.id}`));
    let febStatus, febAmountPaid, febBalance;

    if (febRand < 0.40) {
      // ~40% paid in full
      febStatus = 'paid';
      febAmountPaid = febTotal;
      febBalance = 0;
    } else if (febRand < 0.70) {
      // ~30% partial payment (40-80% of total)
      febStatus = 'partial';
      const partialPct = 0.40 + seededRandom(hashCode(`feb-partial-${student.id}`)) * 0.40;
      febAmountPaid = Math.round(febTotal * partialPct);
      febBalance = febTotal - febAmountPaid;
    } else {
      // ~30% unpaid
      febStatus = 'unpaid';
      febAmountPaid = 0;
      febBalance = febTotal;
    }

    invoices.push({
      id: febInvId,
      invoiceNumber: febInvNum,
      studentId: student.id,
      status: febStatus,
      createdDate: '2026-02-28',
      dueDate: '2026-03-01',
      items: [{
        description: `February 2026 — Private Lesson (${febCount} lessons)`,
        quantity: febCount,
        rate: 25,
        amount: febTotal,
      }],
      subtotal: febTotal,
      discount: 0,
      tax: 0,
      total: febTotal,
      amountPaid: febAmountPaid,
      balance: febBalance,
      billingModel: 'per-lesson',
      billingPeriodStart: '2026-02-01',
      billingPeriodEnd: '2026-02-28',
      notes: '',
      stripeInvoiceId: '',
      stripePaymentLink: '',
    });

    // February payment (only if paid or partial)
    if (febStatus === 'paid' || febStatus === 'partial') {
      const febMethodSeed = seededRandom(hashCode(`pay-feb-${student.id}`));
      const febMethodIdx = Math.floor(febMethodSeed * PAYMENT_METHODS.length);
      const febPayDay = 10 + Math.floor(seededRandom(hashCode(`payday-feb-${student.id}`)) * 13); // 10-22
      const febPayDayStr = `2026-02-${String(Math.min(febPayDay, 28)).padStart(2, '0')}`;

      payments.push({
        id: demoId('pay', paymentSeq++),
        invoiceId: febInvId,
        studentId: student.id,
        amount: febAmountPaid,
        method: PAYMENT_METHODS[febMethodIdx],
        date: febPayDayStr,
        notes: '',
      });
    }
  });

  return { invoices, payments, nextInvoiceNumber: 1000 + invoiceSeq };
}

// ── Main Export ─────────────────────────────────────────────────────────

export function generateDemoData() {
  const students = buildStudents();
  const lessons = buildLessons(students);
  const { invoices, payments, nextInvoiceNumber } = buildInvoicesAndPayments(students, lessons);

  const user = {
    id: 9999,
    email: 'cadence.demo@mail.com',
    name: 'Demo User',
    businessName: 'Harmony Music Studio',
    lessonTypes: [
      { name: 'Private Lesson', duration: 30, rate: 25 },
    ],
  };

  const billingSettings = {
    defaultBillingModel: 'per-lesson',
    invoicePrefix: 'INV',
    nextInvoiceNumber,
    defaultPaymentTermsDays: 30,
    acceptedMethods: ['cash', 'check', 'venmo', 'zelle', 'card'],
    stripeEnabled: false,
    stripeAccountId: '',
  };

  return { user, students, lessons, invoices, payments, billingSettings };
}
