/**
 * BillingModelBadge.jsx
 * A small colored pill that shows a student's billing model.
 *
 * Colors:
 *   - Blue   = Per Lesson (default)
 *   - Purple = Monthly Subscription
 *   - Amber  = Per Course (Flat Fee)
 */

const MODELS = {
  'per-lesson': {
    label: 'Per Lesson',
    className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  },
  'monthly': {
    label: 'Monthly',
    className: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
  },
  'per-course': {
    label: 'Per Course',
    className: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  },
};

function BillingModelBadge({ model, className = '' }) {
  const config = MODELS[model] || MODELS['per-lesson'];

  return (
    <span className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-full ${config.className} ${className}`}>
      {config.label}
    </span>
  );
}

export default BillingModelBadge;
