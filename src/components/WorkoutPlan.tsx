// =============================================================================
// TYPESCRIPT LESSON FILE: WorkoutPlan.tsx
//
// This component displays the full workout plan before starting.
// It shows how to work with arrays of typed objects in React.
// =============================================================================

import {
  type Workout,
  type Exercise,
  type WorkoutSection,
  isTimerExercise,
  isRepsExercise,
  formatRepCount,
  formatDuration,
} from '../types/workout';

// =============================================================================
// LESSON: Props Interface with Function Types
//
// Components can receive functions as props. `onStart: () => void` means:
//   - `onStart` is a function
//   - It takes no arguments `()`
//   - It returns nothing `void`
// =============================================================================

interface WorkoutPlanProps {
  workout: Workout;
  onStart: () => void;
}

// =============================================================================
// LESSON: Typing Section Colors
//
// We map section IDs to Tailwind CSS class strings.
// Using Record<string, ...> means any string key is valid.
// =============================================================================

interface SectionTheme {
  badge: string;   // Classes for the section badge pill
  border: string;  // Classes for the exercise card border
  icon: string;    // Emoji icon for visual variety
}

const SECTION_THEMES: Record<string, SectionTheme> = {
  warmup: {
    badge: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
    border: 'border-blue-500/20',
    icon: '🔥',
  },
  workout: {
    badge: 'bg-orange-500/20 text-orange-300 border border-orange-500/30',
    border: 'border-orange-500/20',
    icon: '💪',
  },
};

// Fallback theme for sections with unknown IDs
const DEFAULT_THEME: SectionTheme = {
  badge: 'bg-slate-500/20 text-slate-300 border border-slate-500/30',
  border: 'border-slate-500/20',
  icon: '⚡',
};

// =============================================================================
// Sub-component: ExerciseRow
//
// LESSON: Breaking UI into small, focused components is good practice.
// Each component has a clear single responsibility.
// =============================================================================

interface ExerciseRowProps {
  exercise: Exercise;
  index: number;
}

function ExerciseRow({ exercise, index }: ExerciseRowProps) {
  // LESSON: Using type guards in JSX
  // isTimerExercise() is our type guard from workout.ts.
  // After calling it, TypeScript knows which specific type we have.

  let typeLabel: string;
  let typeIcon: string;

  if (isTimerExercise(exercise)) {
    // TypeScript knows exercise.duration exists here (TimerExercise)
    typeLabel = formatDuration(exercise.duration);
    typeIcon = '⏱';
  } else if (isRepsExercise(exercise)) {
    // TypeScript knows exercise.reps exists here (RepsExercise)
    typeLabel = formatRepCount(exercise.reps);
    typeIcon = '🔢';
  } else {
    // LESSON: Exhaustive checks
    // If we ever add a third exercise type, TypeScript will error here
    // because `exercise` would not be `never`. This is a compile-time safety net.
    const _exhaustiveCheck: never = exercise;
    return _exhaustiveCheck;
  }

  const setsLabel = `${exercise.sets} ${exercise.sets === 1 ? 'set' : 'sets'}`;
  const restLabel = `${exercise.restAfterSet}s rest`;

  return (
    <div className="flex items-start gap-3 py-3">
      {/* Exercise number */}
      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-xs text-slate-400 font-mono mt-0.5">
        {index + 1}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-white">{exercise.name}</span>
          {/* Set/rep/timer tags */}
          <span className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full">
            {setsLabel}
          </span>
          <span className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full">
            {typeIcon} {typeLabel}
          </span>
          <span className="text-xs bg-slate-700/50 text-slate-400 px-2 py-0.5 rounded-full">
            {restLabel}
          </span>
        </div>

        {exercise.description && (
          <p className="text-sm text-slate-400 mt-1 leading-relaxed">
            {exercise.description}
          </p>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// Sub-component: SectionCard
// =============================================================================

interface SectionCardProps {
  section: WorkoutSection;
  theme: SectionTheme;
}

function SectionCard({ section, theme }: SectionCardProps) {
  // Compute total sets/time for the section summary
  const totalSets = section.exercises.reduce((sum, ex) => sum + ex.sets, 0);

  return (
    <div className={`bg-slate-800 rounded-xl border ${theme.border} overflow-hidden`}>
      {/* Section header */}
      <div className="px-4 py-3 border-b border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span>{theme.icon}</span>
          <h2 className="font-semibold text-white">{section.name}</h2>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${theme.badge}`}>
            {section.exercises.length} exercises · {totalSets} total sets
          </span>
        </div>
      </div>

      {/* Exercise list */}
      <div className="px-4 divide-y divide-slate-700/50">
        {/* LESSON: Array.map() in JSX
            We convert an array of data into an array of JSX elements.
            The `key` prop is required by React to efficiently update lists. */}
        {section.exercises.map((exercise, index) => (
          <ExerciseRow
            key={exercise.id}  // key must be unique within the list
            exercise={exercise}
            index={index}
          />
        ))}
      </div>
    </div>
  );
}

// =============================================================================
// Main Component: WorkoutPlan
// =============================================================================

export function WorkoutPlan({ workout, onStart }: WorkoutPlanProps) {
  // Compute totals for the summary header
  const totalExercises = workout.sections.reduce(
    (sum, section) => sum + section.exercises.length,
    0
  );
  const totalSets = workout.sections.reduce(
    (sum, section) =>
      sum + section.exercises.reduce((s, ex) => s + ex.sets, 0),
    0
  );

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-block text-4xl mb-3">🏋️</div>
          <h1 className="text-3xl font-bold text-white mb-2">{workout.name}</h1>
          {workout.description && (
            <p className="text-slate-400 text-sm max-w-md mx-auto leading-relaxed">
              {workout.description}
            </p>
          )}

          {/* Quick stats */}
          <div className="flex items-center justify-center gap-6 mt-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-400">{workout.sections.length}</div>
              <div className="text-xs text-slate-400">sections</div>
            </div>
            <div className="w-px h-8 bg-slate-700" />
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-400">{totalExercises}</div>
              <div className="text-xs text-slate-400">exercises</div>
            </div>
            <div className="w-px h-8 bg-slate-700" />
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-400">{totalSets}</div>
              <div className="text-xs text-slate-400">total sets</div>
            </div>
          </div>
        </div>

        {/* Section cards */}
        <div className="space-y-4 mb-8">
          {workout.sections.map(section => {
            // LESSON: Object lookup with fallback
            // If the section ID isn't in our themes map, use DEFAULT_THEME.
            const theme = SECTION_THEMES[section.id] ?? DEFAULT_THEME;
            return (
              <SectionCard key={section.id} section={section} theme={theme} />
            );
          })}
        </div>

        {/* Start button */}
        <button
          onClick={onStart}
          className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-semibold text-lg rounded-xl transition-colors duration-150 shadow-lg shadow-indigo-900/40"
        >
          Start Workout →
        </button>

        <p className="text-center text-xs text-slate-500 mt-4">
          Tap the button above when you&apos;re ready to begin
        </p>
      </div>
    </div>
  );
}
