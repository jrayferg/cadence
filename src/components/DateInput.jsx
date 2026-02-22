/**
 * DateInput - Masked date input with auto-formatting, validation, and calendar picker.
 *
 * Single text input that formats as MM / DD / YYYY as the user types.
 * Validates dates in real-time (no impossible dates like 02/30 or 13/01).
 * Includes a calendar icon that opens the native date picker as a fallback.
 *
 * @param {Object} props
 * @param {string} props.value - Date string in YYYY-MM-DD format (or empty)
 * @param {Function} props.onChange - Called with YYYY-MM-DD string (or '' if cleared)
 * @param {string} [props.label] - Label text
 * @param {boolean} [props.required] - Whether the field is required
 * @param {string} [props.inputBg] - Override input background class
 */

import { useState, useRef } from 'react';
import { Calendar } from '@/components/icons';

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
  return `${digits.slice(4, 8)}-${digits.slice(0, 2)}-${digits.slice(2, 4)}`;
}

/** Get max days in a given month/year */
function getDaysInMonth(month, year) {
  if ([4, 6, 9, 11].includes(month)) return 30;
  if (month === 2) {
    const y = year || 2000;
    if (y % 4 === 0 && (y % 100 !== 0 || y % 400 === 0)) return 29;
    return 28;
  }
  return 31;
}

/** Validate a complete 8-digit date string. Returns { valid, message } */
function validateDate(digits) {
  if (digits.length !== 8) return { valid: null, message: '' };

  const mm = parseInt(digits.slice(0, 2), 10);
  const dd = parseInt(digits.slice(2, 4), 10);
  const yyyy = parseInt(digits.slice(4, 8), 10);
  const currentYear = new Date().getFullYear();

  if (mm < 1 || mm > 12) return { valid: false, message: 'Month must be 01–12' };
  if (yyyy < 1920 || yyyy > currentYear) return { valid: false, message: `Year must be 1920–${currentYear}` };

  const maxDays = getDaysInMonth(mm, yyyy);
  if (dd < 1 || dd > maxDays) return { valid: false, message: `Day must be 01–${maxDays} for this month` };

  return { valid: true, message: '' };
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
  const [error, setError] = useState('');
  const datePickerRef = useRef(null);

  // Sync from parent when value changes externally (form reset, edit different student)
  if (value !== prevValue) {
    setPrevValue(value);
    setRaw(storedToDigits(value));
    setError('');
  }

  const handleInput = (e) => {
    const digits = digitsOnly(e.target.value).slice(0, 8);
    setRaw(digits);

    if (digits.length === 8) {
      const result = validateDate(digits);
      if (result.valid) {
        const stored = digitsToStored(digits);
        setPrevValue(stored);
        onChange(stored);
        setError('');
      } else {
        setError(result.message);
      }
    } else {
      setError('');
      if (digits.length === 0) {
        setPrevValue('');
        onChange('');
      }
    }
  };

  /** When user picks from native calendar, populate the masked input */
  const handleDatePicker = (e) => {
    const val = e.target.value; // YYYY-MM-DD
    if (val) {
      const digits = storedToDigits(val);
      setRaw(digits);
      setPrevValue(val);
      onChange(val);
      setError('');
    }
  };

  const currentYear = new Date().getFullYear();
  const borderClass = error
    ? 'border-red-400 dark:border-red-500 focus:ring-red-400'
    : 'border-stone-200 dark:border-stone-600 focus:ring-teal-500';

  return (
    <div className="min-w-0">
      {label && (
        <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          type="text"
          inputMode="numeric"
          value={formatDisplay(raw)}
          onChange={handleInput}
          placeholder="MM / DD / YYYY"
          required={required}
          className={`w-full px-3 py-2 pr-9 ${inputBg} border ${borderClass} text-stone-900 dark:text-stone-100 rounded-lg focus:outline-none focus:ring-2 transition-colors text-sm`}
        />
        <button
          type="button"
          onClick={() => datePickerRef.current?.showPicker?.()}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 dark:text-stone-500 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
          tabIndex={-1}
        >
          <Calendar className="w-4 h-4" />
        </button>
        {/* Hidden native date picker — opened by the calendar icon */}
        <input
          ref={datePickerRef}
          type="date"
          className="sr-only"
          value={value || ''}
          onChange={handleDatePicker}
          min="1920-01-01"
          max={`${currentYear}-12-31`}
          tabIndex={-1}
        />
      </div>
      {error && <p className="text-xs text-red-500 mt-0.5">{error}</p>}
    </div>
  );
}
