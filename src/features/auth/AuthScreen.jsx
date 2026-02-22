/**
 * AuthScreen - Login and signup screen for Cadence.
 *
 * Presents a toggle between Login and Sign Up forms, collects
 * the user's name (sign-up only), email, and password, then
 * creates a user object and passes it up via the setUser callback.
 *
 * Demo account: cadence.demo@mail.com / demome123
 * Bypasses onboarding and loads a fully populated studio.
 */

import { useState } from 'react';
import { Music } from '@/components/icons';
import { generateDemoData } from '@/utils/demoData';

function AuthScreen({ setUser, setStudents, setLessons, setSetupComplete }) {
  const [isLogin, setIsLogin] = useState(false); // Default to signup
  const [formData, setFormData] = useState({ email: '', password: '', name: '' });

  const handleSubmit = (e) => {
    e.preventDefault();

    // Demo account — bypass onboarding, load full dataset
    if (
      formData.email.toLowerCase().trim() === 'cadence.demo@mail.com' &&
      formData.password === 'demome123'
    ) {
      const demoData = generateDemoData();

      // Write billing data directly to localStorage
      // (BillingView reads from localStorage on first mount via useLocalStorage hook)
      window.localStorage.setItem('cadence_invoices', JSON.stringify(demoData.invoices));
      window.localStorage.setItem('cadence_payments', JSON.stringify(demoData.payments));
      window.localStorage.setItem('cadence_billing_settings', JSON.stringify(demoData.billingSettings));

      // Set React state for data that App.jsx manages
      setStudents(demoData.students);
      setLessons(demoData.lessons);
      setSetupComplete(true);
      setUser(demoData.user);
      return;
    }

    // Normal login/signup flow
    const newUser = {
      id: Date.now(),
      email: formData.email,
      name: formData.name || formData.email.split('@')[0],
    };
    setUser(newUser);
  };

  const fillDemoCredentials = () => {
    setIsLogin(true);
    setFormData({ email: 'cadence.demo@mail.com', password: 'demome123', name: '' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-amber-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <div className="inline-flex w-16 h-16 bg-teal-700 rounded-2xl items-center justify-center mb-4">
            <Music className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-stone-900 mb-2">Cadence</h1>
          <p className="text-stone-600">Manage your music lessons effortlessly</p>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-lg border border-stone-200">
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                isLogin ? 'bg-teal-700 text-white' : 'text-stone-600 hover:bg-stone-50'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                !isLogin ? 'bg-teal-700 text-white' : 'text-stone-600 hover:bg-stone-50'
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <input
                type="text"
                placeholder="Your Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              />
            )}
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              required
            />
            <button
              type="submit"
              className="w-full py-3 bg-teal-700 text-white font-medium rounded-lg hover:bg-teal-600 transition-colors"
            >
              {isLogin ? 'Login' : 'Create Account'}
            </button>
          </form>

          <p className="text-center mt-4 text-sm text-stone-500">
            Want to try it out?{' '}
            <button
              type="button"
              onClick={fillDemoCredentials}
              className="text-teal-700 hover:text-teal-600 font-medium"
            >
              Use demo account
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default AuthScreen;
