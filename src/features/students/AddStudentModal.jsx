import { useState } from 'react';
import { X } from '@/components/icons';

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
        dateOfBirth: '',
        profileImage: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        zipCode: '',

        // Minor flag
        isMinor: false,

        // Parent Info
        parentName: '',
        parentEmail: '',
        parentPhone: '',
        parentDateOfBirth: '',
        parentAddressLine1: '',
        parentAddressLine2: '',
        parentCity: '',
        parentState: '',
        parentZipCode: '',

        // Emergency Contact
        emergencyContactName: '',
        emergencyContactPhone: '',

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

      return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4" onClick={onClose}>
          <div
            className="bg-white dark:bg-stone-800 rounded-2xl w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* FIXED HEADER */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-stone-200 dark:border-stone-700 flex-shrink-0">
              <h3 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100">
                {student ? 'Edit Student' : 'Add New Student'}
              </h3>
              <button onClick={onClose} className="p-2 hover:bg-stone-100 dark:hover:bg-stone-700 rounded-lg transition-colors">
                <X className="w-6 h-6 text-stone-600 dark:text-stone-400" />
              </button>
            </div>

            {/* SCROLLABLE CONTENT */}
            <div className="overflow-y-auto flex-1 p-4 sm:p-6">
              <form id="student-form" onSubmit={handleSubmit} className="space-y-6">
                {/* Student Information Section */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-stone-900 dark:text-stone-100 pb-2 border-b border-stone-200 dark:border-stone-700">
                    Student Information
                  </h4>

                  {/* Profile Image Preview + URL */}
                  <div className="flex items-start gap-4">
                    {formData.profileImage && (
                      <img
                        src={formData.profileImage}
                        alt="Profile preview"
                        className="w-20 h-20 rounded-full object-cover border-2 border-stone-200 dark:border-stone-600 flex-shrink-0"
                        onError={(e) => e.target.style.display = 'none'}
                      />
                    )}
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                        Profile Image URL (optional)
                      </label>
                      <input
                        type="url"
                        value={formData.profileImage}
                        onChange={(e) => setFormData({ ...formData, profileImage: e.target.value })}
                        placeholder="https://example.com/image.jpg"
                        className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-600 text-stone-900 dark:text-stone-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors"
                      />
                      <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">Enter URL to see preview above</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Student Name (full width) */}
                    <div className="md:col-span-3">
                      <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                        Student Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-600 text-stone-900 dark:text-stone-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors"
                        required
                      />
                    </div>

                    {/* Student Email */}
                    <div>
                      <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                        Student Email {!formData.isMinor && <span className="text-red-500">*</span>}
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-600 text-stone-900 dark:text-stone-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors"
                        required={!formData.isMinor}
                      />
                    </div>

                    {/* Student Phone */}
                    <div>
                      <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                        Student Phone
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-600 text-stone-900 dark:text-stone-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors"
                      />
                    </div>

                    {/* Date of Birth */}
                    <div>
                      <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                        className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-600 text-stone-900 dark:text-stone-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors"
                      />
                    </div>

                    {/* Student Address (only if 18+) */}
                    {!formData.isMinor && (
                      <>
                        <div className="md:col-span-3">
                          <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                            Address Line 1
                          </label>
                          <input
                            type="text"
                            value={formData.addressLine1}
                            onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                            placeholder="123 Main Street"
                            className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-600 text-stone-900 dark:text-stone-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors"
                          />
                        </div>

                        <div className="md:col-span-3">
                          <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                            Address Line 2
                          </label>
                          <input
                            type="text"
                            value={formData.addressLine2}
                            onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
                            placeholder="Apt, Suite, Unit (optional)"
                            className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-600 text-stone-900 dark:text-stone-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                            City
                          </label>
                          <input
                            type="text"
                            value={formData.city}
                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                            className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-600 text-stone-900 dark:text-stone-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                            State
                          </label>
                          <input
                            type="text"
                            value={formData.state}
                            onChange={(e) => setFormData({ ...formData, state: e.target.value.toUpperCase() })}
                            placeholder="TX"
                            maxLength="2"
                            className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-600 text-stone-900 dark:text-stone-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors uppercase"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                            ZIP Code
                          </label>
                          <input
                            type="text"
                            value={formData.zipCode}
                            onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                            placeholder="75189"
                            maxLength="10"
                            className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-600 text-stone-900 dark:text-stone-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors"
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Under 18 Checkbox */}
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isMinor}
                      onChange={(e) => setFormData({ ...formData, isMinor: e.target.checked })}
                      className="w-5 h-5 accent-teal-700"
                    />
                    <span className="font-medium text-stone-900 dark:text-stone-100">
                      This student is under 18 (requires parent/guardian info)
                    </span>
                  </label>
                </div>

                {/* Parent/Guardian Information (conditional) */}
                {formData.isMinor && (
                  <div className="space-y-4 bg-stone-50 dark:bg-stone-900/50 p-6 rounded-lg border border-stone-200 dark:border-stone-700">
                    <h4 className="text-lg font-semibold text-stone-900 dark:text-stone-100 pb-2 border-b border-stone-200 dark:border-stone-700">
                      Primary Parent/Guardian Information
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Parent Name */}
                      <div className="md:col-span-3">
                        <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                          Parent/Guardian Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.parentName}
                          onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                          className="w-full px-4 py-3 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-600 text-stone-900 dark:text-stone-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors"
                          required={formData.isMinor}
                        />
                      </div>

                      {/* Parent Email */}
                      <div>
                        <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                          Parent Email <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          value={formData.parentEmail}
                          onChange={(e) => setFormData({ ...formData, parentEmail: e.target.value })}
                          className="w-full px-4 py-3 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-600 text-stone-900 dark:text-stone-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors"
                          required={formData.isMinor}
                        />
                        <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">All emails sent to parent</p>
                      </div>

                      {/* Parent Phone */}
                      <div>
                        <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                          Parent Phone
                        </label>
                        <input
                          type="tel"
                          value={formData.parentPhone}
                          onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                          className="w-full px-4 py-3 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-600 text-stone-900 dark:text-stone-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors"
                        />
                      </div>

                      {/* Parent Date of Birth */}
                      <div>
                        <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                          Parent Date of Birth
                        </label>
                        <input
                          type="date"
                          value={formData.parentDateOfBirth}
                          onChange={(e) => setFormData({ ...formData, parentDateOfBirth: e.target.value })}
                          className="w-full px-4 py-3 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-600 text-stone-900 dark:text-stone-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors"
                        />
                      </div>

                      {/* Parent Address */}
                      <div className="md:col-span-3">
                        <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                          Address Line 1
                        </label>
                        <input
                          type="text"
                          value={formData.parentAddressLine1}
                          onChange={(e) => setFormData({ ...formData, parentAddressLine1: e.target.value })}
                          placeholder="123 Main Street"
                          className="w-full px-4 py-3 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-600 text-stone-900 dark:text-stone-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors"
                        />
                      </div>

                      <div className="md:col-span-3">
                        <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                          Address Line 2
                        </label>
                        <input
                          type="text"
                          value={formData.parentAddressLine2}
                          onChange={(e) => setFormData({ ...formData, parentAddressLine2: e.target.value })}
                          placeholder="Apt, Suite, Unit (optional)"
                          className="w-full px-4 py-3 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-600 text-stone-900 dark:text-stone-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                          City
                        </label>
                        <input
                          type="text"
                          value={formData.parentCity}
                          onChange={(e) => setFormData({ ...formData, parentCity: e.target.value })}
                          className="w-full px-4 py-3 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-600 text-stone-900 dark:text-stone-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                          State
                        </label>
                        <input
                          type="text"
                          value={formData.parentState}
                          onChange={(e) => setFormData({ ...formData, parentState: e.target.value.toUpperCase() })}
                          placeholder="TX"
                          maxLength="2"
                          className="w-full px-4 py-3 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-600 text-stone-900 dark:text-stone-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors uppercase"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                          ZIP Code
                        </label>
                        <input
                          type="text"
                          value={formData.parentZipCode}
                          onChange={(e) => setFormData({ ...formData, parentZipCode: e.target.value })}
                          placeholder="75189"
                          maxLength="10"
                          className="w-full px-4 py-3 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-600 text-stone-900 dark:text-stone-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Emergency Contact Section */}
                <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg border border-red-200 dark:border-red-800">
                  <h4 className="text-lg font-semibold text-stone-900 dark:text-stone-100 pb-2 border-b border-red-200 dark:border-red-800 mb-4">
                    Emergency Contact
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                        Emergency Contact Name
                      </label>
                      <input
                        type="text"
                        value={formData.emergencyContactName}
                        onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                        placeholder="Alternative contact person"
                        className="w-full px-4 py-3 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-600 text-stone-900 dark:text-stone-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                        Emergency Contact Phone
                      </label>
                      <input
                        type="tel"
                        value={formData.emergencyContactPhone}
                        onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
                        className="w-full px-4 py-3 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-600 text-stone-900 dark:text-stone-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors"
                      />
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-stone-500 dark:text-stone-400">Person to contact if parent/guardian is unavailable</p>
                </div>

                {/* Lesson Preferences */}
                <div className="bg-teal-50 dark:bg-teal-900/20 p-6 rounded-lg border border-teal-200 dark:border-teal-800">
                  <h4 className="text-lg font-semibold text-stone-900 dark:text-stone-100 pb-2 border-b border-teal-200 dark:border-teal-800 mb-4">
                    Lesson Preferences
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                        Default Lesson Type
                      </label>
                      <select
                        value={formData.defaultLessonType}
                        onChange={(e) => setFormData({ ...formData, defaultLessonType: e.target.value })}
                        className="w-full px-4 py-3 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-600 text-stone-900 dark:text-stone-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors"
                      >
                        {lessonTypes.map(type => (
                          <option key={type.name} value={type.name}>
                            {type.name} - ${type.rate}/{type.duration}min
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                        Custom Rate (optional)
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-500 dark:text-stone-400">$</span>
                        <input
                          type="number"
                          value={formData.customRate}
                          onChange={(e) => setFormData({ ...formData, customRate: e.target.value })}
                          placeholder={lessonTypes.find(t => t.name === formData.defaultLessonType)?.rate || ''}
                          className="w-full pl-8 pr-4 py-3 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-600 text-stone-900 dark:text-stone-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors"
                        />
                      </div>
                      <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">For scholarships or special pricing</p>
                    </div>
                  </div>
                </div>

                {/* Billing Model */}
                <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-lg border border-purple-200 dark:border-purple-800">
                  <h4 className="text-lg font-semibold text-stone-900 dark:text-stone-100 pb-2 border-b border-purple-200 dark:border-purple-800 mb-4">
                    Billing Model
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                        How is this student billed?
                      </label>
                      <select
                        value={formData.billingModel || 'per-lesson'}
                        onChange={(e) => setFormData({ ...formData, billingModel: e.target.value })}
                        className="w-full px-4 py-3 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-600 text-stone-900 dark:text-stone-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors"
                      >
                        <option value="per-lesson">Per Lesson — charge based on number of lessons</option>
                        <option value="monthly">Monthly — flat monthly fee</option>
                      </select>
                    </div>

                    {/* Monthly-specific fields */}
                    {formData.billingModel === 'monthly' && (
                      <div>
                        <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                          Monthly Rate
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-500 dark:text-stone-400">$</span>
                          <input
                            type="number"
                            value={formData.monthlyRate}
                            onChange={(e) => setFormData({ ...formData, monthlyRate: e.target.value })}
                            placeholder="150"
                            className="w-full pl-8 pr-4 py-3 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-600 text-stone-900 dark:text-stone-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors"
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
            <div className="p-4 sm:p-6 border-t border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 flex-shrink-0">
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 border border-stone-300 dark:border-stone-600 text-stone-700 dark:text-stone-300 rounded-lg hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="student-form"
                  className="flex-1 py-3 bg-teal-700 dark:bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-600 dark:hover:bg-teal-500 transition-colors"
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
