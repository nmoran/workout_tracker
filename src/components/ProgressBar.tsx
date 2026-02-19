// =============================================================================
// TYPESCRIPT LESSON: A simple, reusable component with typed props
// =============================================================================

interface ProgressBarProps {
  completed: number;
  total: number;
  label?: string; // Optional — show "3 / 6 exercises" above the bar
}

export function ProgressBar({ completed, total, label }: ProgressBarProps) {
  // LESSON: Safe division — guard against dividing by zero
  const percentage = total > 0 ? Math.min((completed / total) * 100, 100) : 0;

  return (
    <div className="w-full">
      {label !== undefined && (
        <div className="flex justify-between text-xs text-slate-400 mb-1.5">
          <span>{label}</span>
          <span>
            {completed} / {total}
          </span>
        </div>
      )}
      <div className="w-full bg-slate-700 rounded-full h-1.5">
        <div
          className="bg-indigo-500 h-1.5 rounded-full transition-all duration-700"
          style={{ width: `${percentage}%` }}
          // LESSON: Accessibility — role and aria-valuenow help screen readers
          role="progressbar"
          aria-valuenow={completed}
          aria-valuemin={0}
          aria-valuemax={total}
        />
      </div>
    </div>
  );
}
