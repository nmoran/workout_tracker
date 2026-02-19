// =============================================================================
// TYPESCRIPT LESSON FILE: WorkoutRunner.tsx
//
// This is the most complex component. It shows:
//   - Multiple sub-components in one file
//   - useEffect for side effects (starting timers automatically)
//   - Conditional rendering based on discriminated union types
//   - Composing multiple custom hooks together
// =============================================================================

import { useEffect } from 'react';
import { type Workout, type Exercise, type RepsExercise, WorkoutPhase, isTimerExercise, isRepsExercise, formatRepCount } from '../types/workout';
import { useWorkout } from '../hooks/useWorkout';
import { useTimer } from '../hooks/useTimer';
import { CircularTimer } from './CircularTimer';
import { ProgressBar } from './ProgressBar';

// =============================================================================
// LESSON: Props interface with event handler function types
// =============================================================================

interface WorkoutRunnerProps {
  workout: Workout;
  onExit: () => void; // Called when user wants to go back to the plan view
}

// =============================================================================
// Sub-component: TimerExerciseUI
//
// LESSON: Encapsulating timer logic in a child component
//
// This component manages its own timer. When it MOUNTS, the timer starts.
// When it UNMOUNTS (because we changed exercise), the timer is cleaned up.
//
// The parent uses the `key` prop to force a fresh mount when the exercise
// changes. This is a clean React pattern for resetting stateful children.
// =============================================================================

interface TimerExerciseUIProps {
  duration: number;
  onComplete: () => void;
}

function TimerExerciseUI({ duration, onComplete }: TimerExerciseUIProps) {
  const timer = useTimer(duration, onComplete);

  // LESSON: useEffect for side effects
  // The empty dependency array `[]` means this runs ONCE on mount.
  // We intentionally don't include `timer.start` in deps because we only
  // want to trigger this once — on component mount.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    timer.start();
  }, []);

  const isRunning = timer.status === 'running';
  const isPaused = timer.status === 'paused';

  return (
    <div className="flex flex-col items-center gap-6">
      <CircularTimer
        timeRemaining={timer.timeRemaining}
        totalTime={timer.totalTime}
        color="indigo"
        size="lg"
      />

      {/* Pause / Resume control */}
      <div className="flex gap-3">
        {isRunning && (
          <button
            onClick={timer.pause}
            className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors text-sm font-medium"
          >
            ⏸ Pause
          </button>
        )}
        {isPaused && (
          <button
            onClick={timer.resume}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors text-sm font-medium"
          >
            ▶ Resume
          </button>
        )}
        <button
          onClick={onComplete}
          className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors text-sm font-medium"
        >
          Skip →
        </button>
      </div>
    </div>
  );
}

// =============================================================================
// Sub-component: RepsExerciseUI
// =============================================================================

interface RepsExerciseUIProps {
  exercise: RepsExercise;
  onComplete: () => void;
}

function RepsExerciseUI({ exercise, onComplete }: RepsExerciseUIProps) {
  const repLabel = formatRepCount(exercise.reps);

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Large rep count display */}
      <div className="flex flex-col items-center">
        <div className="text-7xl font-bold text-white tabular-nums">
          {/* LESSON: typeof narrowing to display the right format */}
          {typeof exercise.reps === 'number' ? exercise.reps : `${exercise.reps.min}–${exercise.reps.max}`}
        </div>
        <div className="text-slate-400 mt-2 text-lg">reps</div>
      </div>

      {/* Rep guidance */}
      <p className="text-slate-400 text-sm text-center">
        Complete <span className="text-white font-medium">{repLabel}</span> with
        good form, then tap Done
      </p>

      <button
        onClick={onComplete}
        className="px-10 py-4 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-semibold text-lg rounded-xl transition-colors duration-150 shadow-lg shadow-emerald-900/40"
      >
        ✓ Done with Set
      </button>
    </div>
  );
}

// =============================================================================
// Sub-component: RestPeriodUI
//
// Displayed between sets/exercises. Timer starts automatically on mount.
// =============================================================================

interface RestPeriodUIProps {
  duration: number;
  nextExercise: Exercise | null;
  nextSet: number;
  totalSets: number;
  onComplete: () => void;
}

function RestPeriodUI({
  duration,
  nextExercise,
  nextSet,
  totalSets,
  onComplete,
}: RestPeriodUIProps) {
  const timer = useTimer(duration, onComplete);

  // Auto-start on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    timer.start();
  }, []);

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-sm">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-emerald-400 mb-1">Rest</h2>
        <p className="text-slate-400 text-sm">Recover and get ready for the next set</p>
      </div>

      <CircularTimer
        timeRemaining={timer.timeRemaining}
        totalTime={timer.totalTime}
        color="green"
        size="lg"
      />

      {/* Next up preview */}
      {nextExercise && (
        <div className="w-full bg-slate-800 rounded-xl p-4 border border-slate-700">
          <div className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-2">
            Up Next
          </div>
          <div className="font-semibold text-white">{nextExercise.name}</div>
          <div className="text-sm text-slate-400 mt-0.5">
            Set {nextSet} of {totalSets}
            {isTimerExercise(nextExercise) && (
              <span> · Timer exercise</span>
            )}
            {isRepsExercise(nextExercise) && (
              <span> · {formatRepCount(nextExercise.reps)}</span>
            )}
          </div>
        </div>
      )}

      <button
        onClick={onComplete}
        className="w-full py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-colors text-sm font-medium"
      >
        Skip Rest →
      </button>
    </div>
  );
}

// =============================================================================
// Sub-component: CompletionScreen
// =============================================================================

interface CompletionScreenProps {
  workout: Workout;
  onRestart: () => void;
  onExit: () => void;
}

function CompletionScreen({ workout, onRestart, onExit }: CompletionScreenProps) {
  const totalSets = workout.sections.reduce(
    (sum, section) =>
      sum + section.exercises.reduce((s, ex) => s + ex.sets, 0),
    0
  );

  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <div className="text-6xl">🎉</div>
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">Workout Complete!</h2>
        <p className="text-slate-400">
          You finished <span className="text-white font-medium">{workout.name}</span>
        </p>
      </div>

      {/* Summary */}
      <div className="flex gap-8">
        <div className="text-center">
          <div className="text-2xl font-bold text-emerald-400">
            {workout.sections.reduce((s, sec) => s + sec.exercises.length, 0)}
          </div>
          <div className="text-xs text-slate-400">exercises</div>
        </div>
        <div className="w-px bg-slate-700" />
        <div className="text-center">
          <div className="text-2xl font-bold text-emerald-400">{totalSets}</div>
          <div className="text-xs text-slate-400">total sets</div>
        </div>
      </div>

      <div className="flex flex-col gap-3 w-full max-w-xs">
        <button
          onClick={onRestart}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-colors"
        >
          Do it Again
        </button>
        <button
          onClick={onExit}
          className="w-full py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-colors"
        >
          Back to Plan
        </button>
      </div>
    </div>
  );
}

// =============================================================================
// Sub-component: ExerciseHeader
// Displays the exercise name, description, and set progress
// =============================================================================

interface ExerciseHeaderProps {
  exercise: Exercise;
  sectionName: string;
  currentSet: number;
}

function ExerciseHeader({ exercise, sectionName, currentSet }: ExerciseHeaderProps) {
  const exerciseType = isTimerExercise(exercise) ? 'Timer' : 'Reps';
  const typeColor = isTimerExercise(exercise) ? 'text-indigo-400' : 'text-emerald-400';

  return (
    <div className="text-center mb-6 w-full max-w-sm">
      {/* Section + type badge */}
      <div className="flex items-center justify-center gap-2 mb-3">
        <span className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded-full">
          {sectionName}
        </span>
        <span className={`text-xs font-medium ${typeColor}`}>
          {exerciseType}
        </span>
      </div>

      {/* Exercise name */}
      <h2 className="text-2xl font-bold text-white mb-2">{exercise.name}</h2>

      {/* Set counter */}
      <div className="flex items-center justify-center gap-1.5 mb-3">
        {Array.from({ length: exercise.sets }).map((_, i) => (
          <div
            key={i}
            className={`h-2 w-8 rounded-full transition-colors duration-300 ${
              i < currentSet - 1
                ? 'bg-indigo-500'      // completed sets
                : i === currentSet - 1
                ? 'bg-white'           // current set
                : 'bg-slate-700'       // upcoming sets
            }`}
          />
        ))}
        <span className="text-sm text-slate-400 ml-1">
          Set {currentSet} of {exercise.sets}
        </span>
      </div>

      {/* Description */}
      {exercise.description && (
        <p className="text-sm text-slate-400 leading-relaxed px-2">
          {exercise.description}
        </p>
      )}

      {/* Tip */}
      {exercise.tip && (
        <p className="text-sm text-slate-400 leading-relaxed px-2">
          {exercise.tip}
        </p>
      )}
    </div>
  );
}

// =============================================================================
// LESSON: The Ready Screen (IDLE phase)
// Shows first exercise preview and a "Begin" button
// =============================================================================

interface ReadyScreenProps {
  firstExercise: Exercise | null;
  sectionName: string;
  onStart: () => void;
}

function ReadyScreen({ firstExercise, sectionName, onStart }: ReadyScreenProps) {
  return (
    <div className="flex flex-col items-center gap-6 text-center max-w-sm">
      <div className="text-5xl">🏁</div>
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">Ready to Start?</h2>
        <p className="text-slate-400 text-sm">
          First up: {sectionName}
        </p>
      </div>

      {firstExercise && (
        <div className="w-full bg-slate-800 rounded-xl p-4 border border-slate-700 text-left">
          <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">
            First Exercise
          </div>
          <div className="font-semibold text-white">{firstExercise.name}</div>
          <div className="text-sm text-slate-400 mt-0.5">
            {firstExercise.sets} {firstExercise.sets === 1 ? 'set' : 'sets'}
            {isTimerExercise(firstExercise) && ` · Timer exercise`}
            {isRepsExercise(firstExercise) && ` · ${formatRepCount(firstExercise.reps)}`}
          </div>
        </div>
      )}

      <button
        onClick={onStart}
        className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-semibold text-lg rounded-xl transition-colors shadow-lg shadow-indigo-900/40"
      >
        Begin Workout →
      </button>
    </div>
  );
}

// =============================================================================
// Main Component: WorkoutRunner
//
// LESSON: Orchestrating multiple hooks and conditionally rendering sub-components
// =============================================================================

export function WorkoutRunner({ workout, onExit }: WorkoutRunnerProps) {
  const {
    state,
    currentExercise,
    currentSectionName,
    currentTimerDuration,
    progress,
    startWorkout,
    completeSet,
    afterRest,
    restartWorkout,
  } = useWorkout(workout);

  // LESSON: A unique key based on workout position.
  // This is passed as `key` to timer sub-components to force a fresh mount
  // (and therefore a fresh timer) every time the exercise/set changes.
  const exerciseKey = `${state.sectionIndex}-${state.exerciseIndex}-${state.currentSet}`;

  const handleRestart = () => {
    restartWorkout();
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col">
      {/* ================================================================
          Header: back button + progress bar
          ================================================================ */}
      <header className="flex items-center gap-4 px-4 py-4 border-b border-slate-800">
        <button
          onClick={onExit}
          className="text-slate-400 hover:text-white transition-colors text-sm flex items-center gap-1"
          aria-label="Back to workout plan"
        >
          ← Back
        </button>

        <div className="flex-1">
          <ProgressBar
            completed={progress.completedExercises}
            total={progress.totalExercises}
            label={
              state.phase !== WorkoutPhase.IDLE && state.phase !== WorkoutPhase.COMPLETED
                ? 'Exercises'
                : undefined
            }
          />
        </div>

        {/* Phase indicator */}
        <div className="text-xs font-medium min-w-fit">
          {state.phase === WorkoutPhase.EXERCISING && (
            <span className="text-indigo-400">Exercising</span>
          )}
          {state.phase === WorkoutPhase.RESTING && (
            <span className="text-emerald-400">Resting</span>
          )}
          {state.phase === WorkoutPhase.COMPLETED && (
            <span className="text-yellow-400">Done!</span>
          )}
        </div>
      </header>

      {/* ================================================================
          Main Content: changes based on workout phase
          ================================================================ */}
      <main className="flex-1 flex items-center justify-center p-6">
        {/* ---- IDLE: Show ready screen ---- */}
        {state.phase === WorkoutPhase.IDLE && (
          <ReadyScreen
            firstExercise={currentExercise}
            sectionName={currentSectionName}
            onStart={startWorkout}
          />
        )}

        {/* ---- EXERCISING: Show the current exercise ---- */}
        {state.phase === WorkoutPhase.EXERCISING && currentExercise && (
          <div className="flex flex-col items-center w-full max-w-sm">
            <ExerciseHeader
              exercise={currentExercise}
              sectionName={currentSectionName}
              currentSet={state.currentSet}
            />

            {/* LESSON: Discriminated union narrowing in JSX
                We check currentTimerDuration to decide which UI to show.
                We also cast to RepsExercise after confirming with isRepsExercise. */}
            {currentTimerDuration !== null ? (
              // Timer exercise — key forces fresh mount on new exercise/set
              <TimerExerciseUI
                key={exerciseKey}
                duration={currentTimerDuration}
                onComplete={completeSet}
              />
            ) : isRepsExercise(currentExercise) ? (
              // Rep exercise
              <RepsExerciseUI
                key={exerciseKey}
                exercise={currentExercise}
                onComplete={completeSet}
              />
            ) : null}
          </div>
        )}

        {/* ---- RESTING: Show rest timer ---- */}
        {state.phase === WorkoutPhase.RESTING && (
          <RestPeriodUI
            key={`rest-${exerciseKey}`}
            duration={state.restDuration}
            nextExercise={currentExercise}
            nextSet={state.currentSet}
            totalSets={currentExercise?.sets ?? 1}
            onComplete={afterRest}
          />
        )}

        {/* ---- COMPLETED: Show celebration screen ---- */}
        {state.phase === WorkoutPhase.COMPLETED && (
          <CompletionScreen
            workout={workout}
            onRestart={handleRestart}
            onExit={onExit}
          />
        )}
      </main>

      {/* ================================================================
          Footer: Section + exercise name breadcrumb
          ================================================================ */}
      {state.phase === WorkoutPhase.EXERCISING && (
        <footer className="px-4 py-3 border-t border-slate-800 text-center text-xs text-slate-500">
          {currentSectionName} · Exercise {progress.exerciseIndex + 1} of{' '}
          {workout.sections[progress.sectionIndex]?.exercises.length ?? 0}
        </footer>
      )}
    </div>
  );
}
