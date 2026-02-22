/**
 * OnboardingFlow - First-time setup wizard for new Cadence users.
 *
 * Guides the user through a two-step onboarding process:
 *   Step 1 -- Name their studio / business.
 *   Step 2 -- Define lesson types with default durations and rates.
 *
 * On completion the user profile is updated, and if the account
 * belongs to a demo user (Jennaca) pre-populated sample data is loaded.
 */

import { useState } from 'react';
import { Music, ArrowRight, Plus, X, CheckCircle, ChevronLeft } from '@/components/icons';
import { generateDemoData } from '@/utils/demoData';

function OnboardingFlow({ user, setUser, setSetupComplete, setStudents, setLessons }) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState({
    businessName: '',
    lessonTypes: [
      { name: 'Private Lesson', duration: 30, rate: 50 },
    ],
  });

  const addLessonType = () => {
    setData({
      ...data,
      lessonTypes: [...data.lessonTypes, { name: '', duration: 30, rate: 0 }]
    });
  };

  const updateLessonType = (index, field, value) => {
    const updated = [...data.lessonTypes];
    updated[index][field] = value;
    setData({ ...data, lessonTypes: updated });
  };

  const removeLessonType = (index) => {
    const updated = data.lessonTypes.filter((_, i) => i !== index);
    setData({ ...data, lessonTypes: updated });
  };

  const handleComplete = () => {
    setUser({ ...user, ...data });

    // Check if this is Jennaca's account - load demo data
    if (user.email.toLowerCase().includes('jennaca') || user.name.toLowerCase().includes('jennaca') || data.businessName.toLowerCase().includes('jennaca')) {
      console.log('Loading demo data for Jennaca...');
      const demoData = generateDemoData();
      setStudents(demoData.students);
      setLessons(demoData.lessons);
    }

    setSetupComplete(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-amber-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl animate-slide-up">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-stone-600">Step {step} of 2</span>
            <span className="text-sm text-stone-600">{Math.round((step / 2) * 100)}% Complete</span>
          </div>
          <div className="h-2 bg-stone-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-teal-700 transition-all duration-300"
              style={{ width: `${(step / 2) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-stone-200">
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold text-stone-900 mb-2">Welcome to Cadence!</h2>
                <p className="text-stone-600">Let's get your studio set up in just 2 quick steps.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  What should we call your studio or business?
                </label>
                <input
                  type="text"
                  value={data.businessName}
                  onChange={(e) => setData({ ...data, businessName: e.target.value })}
                  placeholder="e.g., Sarah's Piano Studio"
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <p className="mt-2 text-sm text-stone-500">This will appear on invoices and communications.</p>
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={!data.businessName}
                className="w-full py-3 bg-teal-700 text-white font-medium rounded-lg hover:bg-teal-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                Continue
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold text-stone-900 mb-2">Set Your Lesson Types</h2>
                <p className="text-stone-600">Define your lesson types with default rates and durations.</p>
              </div>

              <div className="space-y-4">
                {data.lessonTypes.map((type, index) => (
                  <div key={index} className="bg-stone-50 p-4 rounded-lg border border-stone-200">
                    <div className="flex items-start gap-4">
                      <div className="flex-1 space-y-3">
                        <input
                          type="text"
                          value={type.name}
                          onChange={(e) => updateLessonType(index, 'name', e.target.value)}
                          placeholder="Lesson type (e.g., Private, Group, Class)"
                          className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs text-stone-600 mb-1">Duration (min)</label>
                            <input
                              type="number"
                              value={type.duration}
                              onChange={(e) => updateLessonType(index, 'duration', parseInt(e.target.value))}
                              className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-stone-600 mb-1">Rate ($)</label>
                            <input
                              type="number"
                              value={type.rate}
                              onChange={(e) => updateLessonType(index, 'rate', parseFloat(e.target.value))}
                              className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                            />
                          </div>
                        </div>
                      </div>
                      {data.lessonTypes.length > 1 && (
                        <button
                          onClick={() => removeLessonType(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                <button
                  onClick={addLessonType}
                  className="w-full py-3 border-2 border-dashed border-stone-300 text-stone-600 rounded-lg hover:border-teal-500 hover:text-teal-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Add Another Lesson Type
                </button>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="px-6 py-3 border border-stone-300 text-stone-700 rounded-lg hover:bg-stone-50 transition-colors flex items-center gap-2"
                >
                  <ChevronLeft className="w-5 h-5" />
                  Back
                </button>
                <button
                  onClick={handleComplete}
                  disabled={data.lessonTypes.some(t => !t.name || !t.rate)}
                  className="flex-1 py-3 bg-teal-700 text-white font-medium rounded-lg hover:bg-teal-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  Complete Setup
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default OnboardingFlow;
