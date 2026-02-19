// =============================================================================
// WorkoutSelector.tsx
//
// The first screen the user sees. Lists all available workouts and lets
// them pick one before viewing the plan.
//
// TYPESCRIPT LESSON: This component is a good example of working with
// arrays of objects — the most common pattern in real apps.
// =============================================================================

import { type Workout, type WorkoutSection } from '../types/workout';

interface WorkoutSelectorProps {
  workouts: Workout[];           // An array — could be 2 items or 200
  onSelect: (workout: Workout) => void; // Callback receives the chosen workout
}

// =============================================================================
// LESSON: Deriving data from types
//
// We compute summary stats from a Workout object in several places.
// Extracting that logic into a small helper function keeps components clean
// and makes the logic easy to test or reuse.
// =============================================================================

interface WorkoutStats {
  totalExercises: number;
  totalSets: number;
  sectionNames: string[];
}

function getWorkoutStats(workout: Workout): WorkoutStats {
  const totalExercises = workout.sections.reduce(
    (sum, section) => sum + section.exercises.length,
    0
  );
  const totalSets = workout.sections.reduce(
    (sum, section) =>
      sum + section.exercises.reduce((s, ex) => s + ex.sets, 0),
    0
  );
  const sectionNames = workout.sections.map(s => s.name);

  return { totalExercises, totalSets, sectionNames };
}

// =============================================================================
// LESSON: Record type for theme lookups
//
// We want a different accent colour per workout. Since workout IDs are strings,
// Record<string, string> gives us a simple colour-lookup table.
// The ?? fallback handles any workout ID not in the map.
// =============================================================================

const WORKOUT_ACCENT: Record<string, { from: string; border: string; badge: string }> = {
  'pullup-training': {
    from: 'from-indigo-500/20',
    border: 'border-indigo-500/30',
    badge: 'bg-indigo-500/20 text-indigo-300',
  },
  'push-core': {
    from: 'from-orange-500/20',
    border: 'border-orange-500/30',
    badge: 'bg-orange-500/20 text-orange-300',
  },
};

const DEFAULT_ACCENT = {
  from: 'from-slate-500/20',
  border: 'border-slate-500/30',
  badge: 'bg-slate-500/20 text-slate-300',
};

// =============================================================================
// Sub-component: WorkoutCard
// =============================================================================

interface WorkoutCardProps {
  workout: Workout;
  onSelect: () => void; // No argument — the parent already knows which workout
}

function WorkoutCard({ workout, onSelect }: WorkoutCardProps) {
  const stats = getWorkoutStats(workout);
  const accent = WORKOUT_ACCENT[workout.id] ?? DEFAULT_ACCENT;

  return (
    // The whole card is a button — clicking anywhere selects this workout
    <button
      onClick={onSelect}
      className={`
        w-full text-left p-5 rounded-xl border bg-gradient-to-br ${accent.from} to-transparent
        ${accent.border} hover:brightness-125 active:scale-[0.98]
        transition-all duration-150 group
      `}
    >
      {/* Workout name + arrow */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <h2 className="text-xl font-bold text-white">{workout.name}</h2>
        <span className="text-slate-400 group-hover:text-white group-hover:translate-x-0.5 transition-all mt-0.5">
          →
        </span>
      </div>

      {/* Description */}
      {workout.description && (
        <p className="text-sm text-slate-400 leading-relaxed mb-4">
          {workout.description}
        </p>
      )}

      {/* Section name pills */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {/* LESSON: Array.map() to render a list of elements
            Each section name becomes a small badge pill */}
        {stats.sectionNames.map(name => (
          <span
            key={name}
            className={`text-xs px-2 py-0.5 rounded-full font-medium ${accent.badge}`}
          >
            {name}
          </span>
        ))}
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-4 text-sm text-slate-400">
        <span>
          <span className="text-white font-medium">{workout.sections.length}</span> sections
        </span>
        <span className="text-slate-600">·</span>
        <span>
          <span className="text-white font-medium">{stats.totalExercises}</span> exercises
        </span>
        <span className="text-slate-600">·</span>
        <span>
          <span className="text-white font-medium">{stats.totalSets}</span> total sets
        </span>
      </div>
    </button>
  );
}

// =============================================================================
// Main Component: WorkoutSelector
// =============================================================================

export function WorkoutSelector({ workouts, onSelect }: WorkoutSelectorProps) {
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="text-5xl mb-4">🏋️</div>
          <h1 className="text-3xl font-bold text-white mb-2">Workout Tracker</h1>
          <p className="text-slate-400">Choose a workout to get started</p>
        </div>

        {/* Workout cards */}
        <div className="space-y-4">
          {/* LESSON: Rendering a list of components from an array
              workouts.map() turns each Workout object into a WorkoutCard.
              The `key` prop must be unique — we use the workout's id. */}
          {workouts.map(workout => (
            <WorkoutCard
              key={workout.id}
              workout={workout}
              onSelect={() => onSelect(workout)}
            />
          ))}
        </div>

        {/* Hint about customising */}
        <p className="text-center text-xs text-slate-600 mt-8">
          Edit <code className="text-slate-500">src/data/workouts.json</code> to add or modify workouts
        </p>
      </div>
    </div>
  );
}
