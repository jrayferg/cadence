/**
 * DateInput - Masked date input with auto-formatting.
 *
 * Single text input that formats as MM / DD / YYYY as the user types.
 * Replaces multi-dropdown approach with a clean, consistent input that
 * matches the style of email and phone fields.
 *
 * @param {Object} props
 * @param {string} props.value - Date string in YYYY-MM-DD format (or empty)
 * @param {Function} props.onChange - Called with YYYY-MM-DD string (or '' if incomplete)
 * @param {string} [props.label] - Label text
 * @param {boolean} [props.required] - Whether the field is required
 * @param {string} [props.inputBg] - Override input background class
 */

import { useState } from 'react';

function digitsOnly(str) {
  return (str || '').replace(/\D/g, '');
}

/** Format raw digits (MMDDYYYY) → display string "MM / DD / YYYY" */
function formatDisplay(digits) {
  if (digits.length === 0) return '';
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)} / ${digits.slice(2)}`;
  return `${digits.slice(0, 2)} / ${digits.slice(2, 4)} / ${digits.slice(4, 8)}`;
}

/** Convert stored YYYY-MM-DD → raw MMDDYYYY digits */
function storedToDigits(value) {
  if (!value) return '';
  const parts = value.split('-');
  if (parts.length !== 3) return '';
  return `${parts[1]}${parts[2]}${parts[0]}`;
}

/** Convert raw MMDDYYYY digits → stored YYYY-MM-DD (only when complete) */
function digitsToStored(digits) {
  if (digits.length !== 8) return '';
  const mm = digits.slice(0, 2);
  const dd = digits.slice(2, 4);
  const yyyy = digits.slice(4, 8);
  return `${yyyy}-${mm}-${dd}`;
}

export default function DateInput({
  value,
  onChange,
  label,
  required,
  inputBg = 'bg-stone-50 dark:bg-stone-900',
}) {
  const [raw, setRaw] = useState(() => storedToDigits(value));
  const [prevValue, setPrevValue] = useState(value);

  // Sync from parent when value changes externally (form reset, edit different student)
  if (value !== prevValue) {
    setPrevValue(value);
    setRaw(storedToDigits(value));
  }

  const handleInput = (e) => {
    const digits = digitsOnly(e.target.value).slice(0, 8);
    setRaw(digits);
    if (digits.length === 8) {
      const stored = digitsToStored(digits);
      setPrevValue(stored);
      onChange(stored);
    } else if (digits.length === 0) {
      setPrevValue('');
      onChange('');
    }
  };

  return (
    <div className="min-w-0">
      {label && (
        <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <input
        type="text"
        inputMode="numeric"
        value={formatDisplay(raw)}
        onChange={handleInput}
        placeholder="MM / DD / YYYY"
        required={required}
        className={`w-full px-3 py-2 ${inputBg} border border-stone-200 dark:border-stone-600 text-stone-900 dark:text-stone-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors text-sm`}
      />
    </div>
  );
}
