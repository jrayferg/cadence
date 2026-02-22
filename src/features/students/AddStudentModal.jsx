import { useState } from 'react';
import { X } from '@/components/icons';
import PhoneInput from '@/components/PhoneInput';
import DateInput from '@/components/DateInput';
import StateSelect from '@/components/StateSelect';

/**
 * AddStudentModal - Modal form for adding or editing a student.
 * Includes fields for student info, minor/parent info, emergency contact, and lesson preferences.
 *
 * @param {Object} props
 * @param {Object|null} props.student - Existing student object when editing, null when adding
 * @param {Function} props.onClose - Callback to close the modal
 * @param {Function} props.onSave - Callback with the student form data on submit
 * @param {Array} props.lessonTypes - Available lesson types from user settings
 */
function AddStudentModal({ student, onClose, onSave, lessonTypes }) {
  // When editing, merge existing student data with defaults for new fields
  // so React inputs always start as controlled (never undefined)
  const defaults = {
    // Student Info
    name: '',
    email: '',
    phone: '',
    phoneCountryCode: '+1',
    dateOfBirth: '',
    profileImage: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    zipCode: '',

    // Minor flag — defaults to checked (most music students are minors)
    isMinor: true,

    // Primary Parent Info
    parentName: '',
    parentEmail: '',
    parentPhone: '',
    parentPhoneCountryCode: '+1',
    parentDateOfBirth: '',
    parentAddressLine1: '',
    parentAddressLine2: '',
    parentCity: '',
    parentState: '',
    parentZipCode: '',

    // Secondary Parent Info
    hasSecondaryParent: false,
    secondaryParentName: '',
    secondaryParentEmail: '',
    secondaryParentPhone: '',
    secondaryParentPhoneCountryCode: '+1',
    secondaryParentDateOfBirth: '',
    secondaryParentSameAddress: false,
    secondaryParentAddressLine1: '',
    secondaryParentAddressLine2: '',
    secondaryParentCity: '',
    secondaryParentState: '',
    secondaryParentZipCode: '',

    // Emergency Contact
    emergencyContactName: '',
    emergencyContactRelationship: '',
    emergencyContactPhone: '',
    emergencyContactPhoneCountryCode: '+1',

    // Lesson Preferences
    defaultLessonType: lessonTypes[0]?.name || '',
    customRate: '',

    // Billing Model
    billingModel: 'per-lesson',
    monthlyRate: '',

    // Stripe (future - not shown in UI)
    stripeCustomerId: '',
  };
  const [formData, setFormData] = useState(student ? { ...defaults, ...student } : defaults);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  // When "Same as Primary" is toggled, copy or clear address fields
  const handleSameAddressToggle = (checked) => {
    if (checked) {
      setFormData({
        ...formData,
        secondaryParentSameAddress: true,
        secondaryParentAddressLine1: formData.parentAddressLine1,
        secondaryParentAddressLine2: formData.parentAddressLine2,
        secondaryParentCity: formData.parentCity,
        secondaryParentState: formData.parentState,
        secondaryParentZipCode: formData.parentZipCode,
      });
    } else {
      setFormData({
        ...formData,
        secondaryParentSameAddress: false,
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4" onClick={onClose}>
      <div
        className="bg-white dark:bg-stone-800 rounded-2xl w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* FIXED HEADER */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-stone-200 dark:border-stone-700 flex-shrink-0">
          <h3 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100">
            {student ? 'Edit Student' : 'Add New Student'}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-stone-100 dark:hover:bg-stone-700 rounded-lg transition-colors">
            <X className="w-6 h-6 text-stone-600 dark:text-stone-400" />
          </button>
        </div>

        {/* SCROLLABLE CONTENT */}
        <div className="overflow-y-auto flex-1 p-4 sm:p-5">
          <form id="student-form" onSubmit={handleSubmit} className="space-y-5">
            {/* Student Information Section */}
            <div className="space-y-3">
              <h4 className="text-base font-semibold text-stone-900 dark:text-stone-100 pb-2 border-b border-stone-200 dark:border-stone-700">
                Student Information
              </h4>

              {/* Student Name (full width) */}
              <div>
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Student Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-600 text-stone-900 dark:text-stone-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors"
                  required
                />
              </div>

              {/* Under 18 Checkbox — compact, inline */}
              <div>
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isMinor}
                    onChange={(e) => setFormData({ ...formData, isMinor: e.target.checked })}
                    className="w-4 h-4 accent-teal-700"
                  />
                  <span className="text-sm text-stone-600 dark:text-stone-400">
                    This student is under 18 (requires parent/guardian info)
                  </span>
                </label>
              </div>

              {/* Email / Phone / DOB row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Student Email */}
                <div>
                  <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                    Student Email {!formData.isMinor && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-600 text-stone-900 dark:text-stone-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors"
                    required={!formData.isMinor}
                  />
                </div>

                {/* Student Phone (with country selector) */}
                <PhoneInput
                  label="Student Phone"
                  value={formData.phone}
                  onChange={(val) => setFormData({ ...formData, phone: val })}
                  countryCode={formData.phoneCountryCode}
                  onCountryChange={(code) => setFormData({ ...formData, phoneCountryCode: code })}
                />

                {/* Date of Birth */}
                <DateInput
                  label="Date of Birth"
                  value={formData.dateOfBirth}
                  onChange={(val) => setFormData({ ...formData, dateOfBirth: val })}
                />
              </div>

              {/* Profile Image Preview + URL */}
              <div className="flex items-start gap-3">
                {formData.profileImage && (
                  <img
                    src={formData.profileImage}
                    alt="Profile preview"
                    className="w-16 h-16 rounded-full object-cover border-2 border-stone-200 dark:border-stone-600 flex-shrink-0"
                    onError={(e) => e.target.style.display = 'none'}
                  />
                )}
                <div className="flex-1">
                  <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                    Profile Image URL (optional)
                  </label>
                  <input
                    type="url"
                    value={formData.profileImage}
                    onChange={(e) => setFormData({ ...formData, profileImage: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-3 py-2 text-sm bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-600 text-stone-900 dark:text-stone-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors"
                  />
                  <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">Enter URL to see preview</p>
                </div>
              </div>

              {/* Student Address (only if 18+) */}
              {!formData.isMinor && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="md:col-span-3">
                    <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                      Address Line 1
                    </label>
                    <input
                      type="text"
                      value={formData.addressLine1}
                      onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                      placeholder="123 Main Street"
                      className="w-full px-3 py-2 text-sm bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-600 text-stone-900 dark:text-stone-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors"
                    />
                  </div>

                  <div className="md:col-span-3">
                    <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                      Address Line 2
                    </label>
                    <input
                      type="text"
                      value={formData.addressLine2}
                      onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
                      placeholder="Apt, Suite, Unit (optional)"
                      className="w-full px-3 py-2 text-sm bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-600 text-stone-900 dark:text-stone-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">City</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-3 py-2 text-sm bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-600 text-stone-900 dark:text-stone-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors"
                    />
                  </div>

                  <StateSelect
                    value={formData.state}
                    onChange={(val) => setFormData({ ...formData, state: val })}
                  />

                  <div>
                    <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">ZIP Code</label>
                    <input
                      type="text"
                      value={formData.zipCode}
                      onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                      placeholder="75189"
                      maxLength="10"
                      className="w-full px-3 py-2 text-sm bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-600 text-stone-900 dark:text-stone-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* ─── Primary Parent/Guardian Information (conditional) ─── */}
            {formData.isMinor && (
              <div className="space-y-3 bg-stone-50 dark:bg-stone-900/50 p-4 rounded-lg border border-stone-200 dark:border-stone-700">
                <h4 className="text-base font-semibold text-stone-900 dark:text-stone-100 pb-2 border-b border-stone-200 dark:border-stone-700">
                  Primary Parent/Guardian Information
                </h4>

                {/* Parent Name (full width) */}
                <div>
                  <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                    Parent/Guardian Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.parentName}
                    onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-600 text-stone-900 dark:text-stone-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors"
                    required={formData.isMinor}
                  />
                </div>

                {/* Email / Phone / DOB row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                      Parent Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={formData.parentEmail}
                      onChange={(e) => setFormData({ ...formData, parentEmail: e.target.value })}
                      className="w-full px-3 py-2 text-sm bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-600 text-stone-900 dark:text-stone-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors"
                      required={formData.isMinor}
                    />
                    <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">All emails sent to parent</p>
                  </div>

                  <PhoneInput
                    label="Parent Phone"
                    value={formData.parentPhone}
                    onChange={(val) => setFormData({ ...formData, parentPhone: val })}
                    countryCode={formData.parentPhoneCountryCode}
                    onCountryChange={(code) => setFormData({ ...formData, parentPhoneCountryCode: code })}
                    inputBg="bg-white dark:bg-stone-800"
                  />

                  <DateInput
                    label="Parent Date of Birth"
                    value={formData.parentDateOfBirth}
                    onChange={(val) => setFormData({ ...formData, parentDateOfBirth: val })}
                    inputBg="bg-white dark:bg-stone-800"
                  />
                </div>

                {/* Parent Address */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="md:col-span-3">
                    <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Address Line 1</label>
                    <input
                      type="text"
                      value={formData.parentAddressLine1}
                      onChange={(e) => setFormData({ ...formData, parentAddressLine1: e.target.value })}
                      placeholder="123 Main Street"
                      className="w-full px-3 py-2 text-sm bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-600 text-stone-900 dark:text-stone-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors"
                    />
                  </div>

                  <div className="md:col-span-3">
                    <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Address Line 2</label>
                    <input
                      type="text"
                      value={formData.parentAddressLine2}
                      onChange={(e) => setFormData({ ...formData, parentAddressLine2: e.target.value })}
                      placeholder="Apt, Suite, Unit (optional)"
                      className="w-full px-3 py-2 text-sm bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-600 text-stone-900 dark:text-stone-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">City</label>
                    <input
                      type="text"
                      value={formData.parentCity}
                      onChange={(e) => setFormData({ ...formData, parentCity: e.target.value })}
                      className="w-full px-3 py-2 text-sm bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-600 text-stone-900 dark:text-stone-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors"
                    />
                  </div>

                  <StateSelect
                    value={formData.parentState}
                    onChange={(val) => setFormData({ ...formData, parentState: val })}
                    inputBg="bg-white dark:bg-stone-800"
                  />

                  <div>
                    <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">ZIP Code</label>
                    <input
                      type="text"
                      value={formData.parentZipCode}
                      onChange={(e) => setFormData({ ...formData, parentZipCode: e.target.value })}
                      placeholder="75189"
                      maxLength="10"
                      className="w-full px-3 py-2 text-sm bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-600 text-stone-900 dark:text-stone-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors"
                    />
                  </div>
                </div>

                {/* Add Secondary Parent toggle */}
                <div className="pt-2">
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.hasSecondaryParent}
                      onChange={(e) => setFormData({ ...formData, hasSecondaryParent: e.target.checked })}
                      className="w-4 h-4 accent-teal-700"
                    />
                    <span className="text-sm text-stone-600 dark:text-stone-400">
                      Add a secondary parent/guardian
                    </span>
                  </label>
                </div>
              </div>
            )}

            {/* ─── Secondary Parent/Guardian Information (conditional) ─── */}
            {formData.isMinor && formData.hasSecondaryParent && (
              <div className="space-y-3 bg-stone-50 dark:bg-stone-900/50 p-4 rounded-lg border border-stone-200 dark:border-stone-700">
                <h4 className="text-base font-semibold text-stone-900 dark:text-stone-100 pb-2 border-b border-stone-200 dark:border-stone-700">
                  Secondary Parent/Guardian Information
                </h4>
                {/* Secondary Parent Name (full width) */}
                <div>
                  <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                    Parent/Guardian Name
                  </label>
                  <input
                    type="text"
                    value={formData.secondaryParentName}
                    onChange={(e) => setFormData({ ...formData, secondaryParentName: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-600 text-stone-900 dark:text-stone-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors"
                  />
                </div>

                {/* Email / Phone / DOB row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.secondaryParentEmail}
                      onChange={(e) => setFormData({ ...formData, secondaryParentEmail: e.target.value })}
                      className="w-full px-3 py-2 text-sm bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-600 text-stone-900 dark:text-stone-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors"
                    />
                  </div>

                  <PhoneInput
                    label="Phone"
                    value={formData.secondaryParentPhone}
                    onChange={(val) => setFormData({ ...formData, secondaryParentPhone: val })}
                    countryCode={formData.secondaryParentPhoneCountryCode}
                    onCountryChange={(code) => setFormData({ ...formData, secondaryParentPhoneCountryCode: code })}
                    inputBg="bg-white dark:bg-stone-800"
                  />

                  <DateInput
                    label="Date of Birth"
                    value={formData.secondaryParentDateOfBirth}
                    onChange={(val) => setFormData({ ...formData, secondaryParentDateOfBirth: val })}
                    inputBg="bg-white dark:bg-stone-800"
                  />
                </div>

                {/* Same as Primary checkbox */}
                <div>
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.secondaryParentSameAddress}
                      onChange={(e) => handleSameAddressToggle(e.target.checked)}
                      className="w-4 h-4 accent-teal-700"
                    />
                    <span className="text-sm text-stone-600 dark:text-stone-400">
                      Same address as primary parent/guardian
                    </span>
                  </label>
                </div>

                {/* Secondary Parent Address */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="md:col-span-3">
                    <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Address Line 1</label>
                    <input
                      type="text"
                      value={formData.secondaryParentSameAddress ? formData.parentAddressLine1 : formData.secondaryParentAddressLine1}
                      onChange={(e) => setFormData({ ...formData, secondaryParentAddressLine1: e.target.value })}
                      placeholder="123 Main Street"
                      disabled={formData.secondaryParentSameAddress}
                      className={`w-full px-3 py-2 text-sm border border-stone-200 dark:border-stone-600 text-stone-900 dark:text-stone-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors ${
                        formData.secondaryParentSameAddress
                          ? 'bg-stone-100 dark:bg-stone-700 cursor-not-allowed'
                          : 'bg-white dark:bg-stone-800'
                      }`}
                    />
                  </div>

                  <div className="md:col-span-3">
                    <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Address Line 2</label>
                    <input
                      type="text"
                      value={formData.secondaryParentSameAddress ? formData.parentAddressLine2 : formData.secondaryParentAddressLine2}
                      onChange={(e) => setFormData({ ...formData, secondaryParentAddressLine2: e.target.value })}
                      placeholder="Apt, Suite, Unit (optional)"
                      disabled={formData.secondaryParentSameAddress}
                      className={`w-full px-3 py-2 text-sm border border-stone-200 dark:border-stone-600 text-stone-900 dark:text-stone-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors ${
                        formData.secondaryParentSameAddress
                          ? 'bg-stone-100 dark:bg-stone-700 cursor-not-allowed'
                          : 'bg-white dark:bg-stone-800'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">City</label>
                    <input
                      type="text"
                      value={formData.secondaryParentSameAddress ? formData.parentCity : formData.secondaryParentCity}
                      onChange={(e) => setFormData({ ...formData, secondaryParentCity: e.target.value })}
                      disabled={formData.secondaryParentSameAddress}
                      className={`w-full px-3 py-2 text-sm border border-stone-200 dark:border-stone-600 text-stone-900 dark:text-stone-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors ${
                        formData.secondaryParentSameAddress
                          ? 'bg-stone-100 dark:bg-stone-700 cursor-not-allowed'
                          : 'bg-white dark:bg-stone-800'
                      }`}
                    />
                  </div>

                  <StateSelect
                    value={formData.secondaryParentSameAddress ? formData.parentState : formData.secondaryParentState}
                    onChange={(val) => setFormData({ ...formData, secondaryParentState: val })}
                    disabled={formData.secondaryParentSameAddress}
                    inputBg={formData.secondaryParentSameAddress ? 'bg-stone-100 dark:bg-stone-700' : 'bg-white dark:bg-stone-800'}
                  />

                  <div>
                    <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">ZIP Code</label>
                    <input
                      type="text"
                      value={formData.secondaryParentSameAddress ? formData.parentZipCode : formData.secondaryParentZipCode}
                      onChange={(e) => setFormData({ ...formData, secondaryParentZipCode: e.target.value })}
                      placeholder="75189"
                      maxLength="10"
                      disabled={formData.secondaryParentSameAddress}
                      className={`w-full px-3 py-2 text-sm border border-stone-200 dark:border-stone-600 text-stone-900 dark:text-stone-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors ${
                        formData.secondaryParentSameAddress
                          ? 'bg-stone-100 dark:bg-stone-700 cursor-not-allowed'
                          : 'bg-white dark:bg-stone-800'
                      }`}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Emergency Contact Section */}
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
              <h4 className="text-base font-semibold text-stone-900 dark:text-stone-100 pb-2 border-b border-red-200 dark:border-red-800 mb-3">
                Emergency Contact
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                    Emergency Contact Name
                  </label>
                  <input
                    type="text"
                    value={formData.emergencyContactName}
                    onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                    placeholder="Alternative contact person"
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-600 text-stone-900 dark:text-stone-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                    Relationship
                  </label>
                  <select
                    value={formData.emergencyContactRelationship}
                    onChange={(e) => setFormData({ ...formData, emergencyContactRelationship: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-600 text-stone-900 dark:text-stone-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors text-sm"
                  >
                    <option value="">Select...</option>
                    <option value="parent">Parent</option>
                    <option value="grandparent">Grandparent</option>
                    <option value="sibling">Sibling</option>
                    <option value="aunt-uncle">Aunt / Uncle</option>
                    <option value="family-friend">Family Friend</option>
                    <option value="neighbor">Neighbor</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                {/* Emergency Contact Phone (with country selector) */}
                <PhoneInput
                  label="Emergency Contact Phone"
                  value={formData.emergencyContactPhone}
                  onChange={(val) => setFormData({ ...formData, emergencyContactPhone: val })}
                  countryCode={formData.emergencyContactPhoneCountryCode}
                  onCountryChange={(code) => setFormData({ ...formData, emergencyContactPhoneCountryCode: code })}
                  inputBg="bg-white dark:bg-stone-800"
                />
              </div>
              <p className="mt-2 text-xs text-stone-500 dark:text-stone-400">Person to contact if parent/guardian is unavailable</p>
            </div>

            {/* Lesson Preferences */}
            <div className="bg-teal-50 dark:bg-teal-900/20 p-4 rounded-lg border border-teal-200 dark:border-teal-800">
              <h4 className="text-base font-semibold text-stone-900 dark:text-stone-100 pb-2 border-b border-teal-200 dark:border-teal-800 mb-3">
                Lesson Preferences
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                    Default Lesson Type
                  </label>
                  <select
                    value={formData.defaultLessonType}
                    onChange={(e) => setFormData({ ...formData, defaultLessonType: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-600 text-stone-900 dark:text-stone-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors"
                  >
                    {lessonTypes.map(type => (
                      <option key={type.name} value={type.name}>
                        {type.name} - ${type.rate}/{type.duration}min
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                    Custom Rate (optional)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500 dark:text-stone-400">$</span>
                    <input
                      type="number"
                      value={formData.customRate}
                      onChange={(e) => setFormData({ ...formData, customRate: e.target.value })}
                      placeholder={lessonTypes.find(t => t.name === formData.defaultLessonType)?.rate || ''}
                      className="w-full pl-7 pr-3 py-2 text-sm bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-600 text-stone-900 dark:text-stone-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors"
                    />
                  </div>
                  <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">For scholarships or special pricing</p>
                </div>
              </div>
            </div>

            {/* Billing Model */}
            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
              <h4 className="text-base font-semibold text-stone-900 dark:text-stone-100 pb-2 border-b border-purple-200 dark:border-purple-800 mb-3">
                Billing Model
              </h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                    How is this student billed?
                  </label>
                  <select
                    value={formData.billingModel || 'per-lesson'}
                    onChange={(e) => setFormData({ ...formData, billingModel: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-600 text-stone-900 dark:text-stone-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors"
                  >
                    <option value="per-lesson">Per Lesson — charge based on number of lessons</option>
                    <option value="monthly">Monthly — flat monthly fee</option>
                  </select>
                </div>

                {/* Monthly-specific fields */}
                {formData.billingModel === 'monthly' && (
                  <div>
                    <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                      Monthly Rate
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500 dark:text-stone-400">$</span>
                      <input
                        type="number"
                        value={formData.monthlyRate}
                        onChange={(e) => setFormData({ ...formData, monthlyRate: e.target.value })}
                        placeholder="150"
                        className="w-full pl-7 pr-3 py-2 text-sm bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-600 text-stone-900 dark:text-stone-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors"
                      />
                    </div>
                    <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">Recurring charge per month</p>
                  </div>
                )}
              </div>
            </div>
          </form>
        </div>

        {/* STICKY FOOTER */}
        <div className="p-4 sm:p-5 border-t border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 flex-shrink-0">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 border border-stone-300 dark:border-stone-600 text-stone-700 dark:text-stone-300 rounded-lg hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="student-form"
              className="flex-1 py-2 bg-teal-700 dark:bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-600 dark:hover:bg-teal-500 transition-colors"
            >
              {student ? 'Update Student' : 'Add Student'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddStudentModal;
