/**
 * DateInput - Custom date input with Month / Day / Year dropdowns.
 *
 * Replaces the finicky native <input type="date"> with three clean
 * select dropdowns that match the app's UI theme. Ideal for date of birth.
 *
 * @param {Object} props
 * @param {string} props.value - Date string in YYYY-MM-DD format (or empty)
 * @param {Function} props.onChange - Called with YYYY-MM-DD string (or '' if incomplete)
 * @param {string} [props.label] - Label text
 * @param {boolean} [props.required] - Whether the field is required
 * @param {string} [props.inputBg] - Override input background class
 * @param {number} [props.minYear] - Earliest year in dropdown (default: 1940)
 * @param {number} [props.maxYear] - Latest year in dropdown (default: current year)
 */

const MONTHS = [
  { value: '01', label: 'Jan' },
  { value: '02', label: 'Feb' },
  { value: '03', label: 'Mar' },
  { value: '04', label: 'Apr' },
  { value: '05', label: 'May' },
  { value: '06', label: 'Jun' },
  { value: '07', label: 'Jul' },
  { value: '08', label: 'Aug' },
  { value: '09', label: 'Sep' },
  { value: '10', label: 'Oct' },
  { value: '11', label: 'Nov' },
  { value: '12', label: 'Dec' },
];

function parseDate(value) {
  if (!value) return { month: '', day: '', year: '' };
  const parts = value.split('-');
  if (parts.length !== 3) return { month: '', day: '', year: '' };
  return { year: parts[0], month: parts[1], day: parts[2] };
}

function buildDate(month, day, year) {
  if (!month || !day || !year) return '';
  return `${year}-${month}-${day}`;
}

function getDaysInMonth(month, year) {
  if (!month) return 31;
  const m = parseInt(month, 10);
  const y = year ? parseInt(year, 10) : 2000;
  if ([4, 6, 9, 11].includes(m)) return 30;
  if (m === 2) {
    if (y % 4 === 0 && (y % 100 !== 0 || y % 400 === 0)) return 29;
    return 28;
  }
  return 31;
}

export default function DateInput({
  value,
  onChange,
  label,
  required,
  inputBg = 'bg-stone-50 dark:bg-stone-900',
  minYear = 1940,
  maxYear,
}) {
  const currentYear = maxYear || new Date().getFullYear();
  const { month, day, year } = parseDate(value);
  const daysInMonth = getDaysInMonth(month, year);

  const handleChange = (field, val) => {
    const updated = { month, day, year, [field]: val };
    // Clamp day if month changed and day exceeds new max
    if (field === 'month' || field === 'year') {
      const newMax = getDaysInMonth(updated.month, updated.year);
      if (updated.day && parseInt(updated.day, 10) > newMax) {
        updated.day = String(newMax).padStart(2, '0');
      }
    }
    onChange(buildDate(updated.month, updated.day, updated.year));
  };

  const years = [];
  for (let y = currentYear; y >= minYear; y--) {
    years.push(y);
  }

  const selectBase = `px-2 py-2.5 ${inputBg} border border-stone-200 dark:border-stone-600 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors text-sm`;

  return (
    <div className="min-w-0">
      {label && (
        <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="flex min-w-0">
        {/* Month */}
        <select
          value={month}
          onChange={(e) => handleChange('month', e.target.value)}
          required={required}
          className={`flex-1 min-w-0 ${selectBase} rounded-l-lg border-r-0`}
        >
          <option value="">Month</option>
          {MONTHS.map(m => (
            <option key={m.value} value={m.value}>{m.label}</option>
          ))}
        </select>

        {/* Day */}
        <select
          value={day}
          onChange={(e) => handleChange('day', e.target.value)}
          required={required}
          className={`w-16 flex-shrink-0 ${selectBase} border-r-0`}
        >
          <option value="">Day</option>
          {Array.from({ length: daysInMonth }, (_, i) => {
            const d = String(i + 1).padStart(2, '0');
            return <option key={d} value={d}>{i + 1}</option>;
          })}
        </select>

        {/* Year */}
        <select
          value={year}
          onChange={(e) => handleChange('year', e.target.value)}
          required={required}
          className={`w-20 flex-shrink-0 ${selectBase} rounded-r-lg`}
        >
          <option value="">Year</option>
          {years.map(y => (
            <option key={y} value={String(y)}>{y}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
