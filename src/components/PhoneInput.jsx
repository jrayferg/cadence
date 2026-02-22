/**
 * PhoneInput - Reusable phone input with country selector and auto-formatting.
 *
 * Features:
 * - Country code dropdown with flag + dial code
 * - US/CA numbers auto-format as (XXX) XXX-XXXX
 * - Stores formatted value with country code: "+1 (214) 555-0101"
 * - Non-US/CA countries show raw digits after country code
 *
 * @param {Object} props
 * @param {string} props.value - The full phone string (e.g., "+1 (214) 555-0101")
 * @param {Function} props.onChange - Called with the new full phone string
 * @param {string} props.countryCode - Current country code (e.g., "+1")
 * @param {Function} props.onCountryChange - Called with the new country code
 * @param {string} [props.label] - Label text
 * @param {boolean} [props.required] - Whether the field is required
 * @param {string} [props.inputBg] - Override input background class
 */

const COUNTRIES = [
  { code: '+1', flag: '\u{1F1FA}\u{1F1F8}', name: 'US', format: 'us' },
  { code: '+1', flag: '\u{1F1E8}\u{1F1E6}', name: 'CA', format: 'us' },
  { code: '+44', flag: '\u{1F1EC}\u{1F1E7}', name: 'UK', format: 'other' },
  { code: '+61', flag: '\u{1F1E6}\u{1F1FA}', name: 'AU', format: 'other' },
  { code: '+52', flag: '\u{1F1F2}\u{1F1FD}', name: 'MX', format: 'other' },
  { code: '+91', flag: '\u{1F1EE}\u{1F1F3}', name: 'IN', format: 'other' },
];

/** Strip everything but digits from a string */
function digitsOnly(str) {
  return (str || '').replace(/\D/g, '');
}

/** Format 10-digit US/CA number as (XXX) XXX-XXXX */
function formatUS(digits) {
  if (digits.length === 0) return '';
  if (digits.length <= 3) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
}

/** Parse an existing phone value to extract country code and local digits */
function parsePhone(fullValue, currentCountryCode) {
  if (!fullValue) return { countryCode: currentCountryCode || '+1', digits: '' };

  const str = fullValue.trim();

  // Try to match a known country code at the start
  for (const c of COUNTRIES) {
    if (str.startsWith(c.code)) {
      return { countryCode: c.code, digits: digitsOnly(str.slice(c.code.length)) };
    }
  }

  // If it starts with +, extract the code
  const plusMatch = str.match(/^\+(\d{1,3})/);
  if (plusMatch) {
    return { countryCode: `+${plusMatch[1]}`, digits: digitsOnly(str.slice(plusMatch[0].length)) };
  }

  // No country code found — assume current country code, treat entire value as digits
  return { countryCode: currentCountryCode || '+1', digits: digitsOnly(str) };
}

export default function PhoneInput({
  value,
  onChange,
  countryCode = '+1',
  onCountryChange,
  label,
  required,
  inputBg = 'bg-stone-50 dark:bg-stone-900',
}) {
  const { digits } = parsePhone(value, countryCode);
  const selectedCountry = COUNTRIES.find(c => c.code === countryCode && c.name !== 'CA') || COUNTRIES[0];
  const isUSFormat = selectedCountry.format === 'us' || countryCode === '+1';
  const displayValue = isUSFormat ? formatUS(digits) : digits;

  const handleInput = (e) => {
    const raw = digitsOnly(e.target.value);
    const maxLen = isUSFormat ? 10 : 15;
    const trimmed = raw.slice(0, maxLen);
    const formatted = isUSFormat ? formatUS(trimmed) : trimmed;
    const full = trimmed ? `${countryCode} ${formatted}` : '';
    onChange(full);
  };

  const handleCountrySelect = (e) => {
    const newCode = e.target.value;
    if (onCountryChange) onCountryChange(newCode);
    // Re-format the existing digits with the new country code
    if (digits) {
      const newCountry = COUNTRIES.find(c => c.code === newCode) || COUNTRIES[0];
      const isNewUS = newCountry.format === 'us' || newCode === '+1';
      const formatted = isNewUS ? formatUS(digits.slice(0, 10)) : digits;
      onChange(`${newCode} ${formatted}`);
    }
  };

  return (
    <div className="min-w-0">
      {label && (
        <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="flex min-w-0">
        <select
          value={countryCode}
          onChange={handleCountrySelect}
          className={`w-[4.5rem] flex-shrink-0 px-1.5 py-2 ${inputBg} border border-r-0 border-stone-200 dark:border-stone-600 text-stone-900 dark:text-stone-100 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors text-sm`}
        >
          {COUNTRIES.map((c) => (
            <option key={`${c.name}-${c.code}`} value={c.code}>
              {c.flag} {c.code}
            </option>
          ))}
        </select>
        <input
          type="tel"
          value={displayValue}
          onChange={handleInput}
          placeholder={isUSFormat ? '(555) 123-4567' : 'Phone number'}
          required={required}
          className={`flex-1 min-w-0 px-3 py-2 ${inputBg} border border-stone-200 dark:border-stone-600 text-stone-900 dark:text-stone-100 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors text-sm`}
        />
      </div>
    </div>
  );
}
