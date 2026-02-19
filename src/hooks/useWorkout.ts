// =============================================================================
// TYPESCRIPT LESSON FILE: useWorkout.ts
//
// This hook manages all workout state using a "state machine" pattern.
// A state machine has:
//   - A set of possible STATES (WorkoutPhase enum)
//   - A set of TRANSITIONS (functions that move between states)
//   - Logic that only allows valid transitions
// =============================================================================

import { useState, useCallback } from 'react';
import {
  type Workout,
  type Exercise,
  type WorkoutProgress,
  WorkoutPhase,
  WorkoutState,
  isTimerExercise,
  getTimerDuration,
} from '../types/workout';

// =============================================================================
// LESSON: The `type` Import Modifier
//
// `import { type Foo }` tells TypeScript this is used only as a type,
// not a runtime value. TypeScript can erase it without side effects.
// This is good practice to make imports explicit about their purpose.
// =============================================================================

// =============================================================================
// LESSON: Initial State with `as const`
//
// Defining initial state as a constant outside the hook means it's created
// once and reused on every restart — no new object allocation.
// =============================================================================
const INITIAL_STATE: WorkoutState = {
  phase: WorkoutPhase.IDLE,
  sectionIndex: 0,
  exerciseIndex: 0,
  currentSet: 1,
  restDuration: 0,
};

// =============================================================================
// Return type interface — documents exactly what this hook provides
// =============================================================================

export interface UseWorkoutReturn {
  state: WorkoutState;
  currentExercise: Exercise | null;    // null when workout hasn't started or is done
  currentSectionName: string;
  currentTimerDuration: number | null; // null for rep-based exercises
  progress: WorkoutProgress;
  startWorkout: () => void;
  completeSet: () => void;
  afterRest: () => void;
  restartWorkout: () => void;
}

// =============================================================================
// The Hook
// =============================================================================

export function useWorkout(workout: Workout): UseWorkoutReturn {
  const [state, setState] = useState<WorkoutState>(INITIAL_STATE);

  // ==========================================================================
  // LESSON: Helper function inside a hook
  //
  // This is a plain function (not a hook) that computes a value from arguments.
  // We pass `s` explicitly rather than closing over `state` so it can be
  // called safely inside setState callbacks (which receive the latest state).
  // ==========================================================================

  // LESSON: Return type annotation `Exercise | null`
  // The function either returns an Exercise or null. TypeScript forces callers
  // to handle both cases before accessing exercise properties.
  function getExercise(s: WorkoutState): Exercise | null {
    // LESSON: Optional Chaining on Array Access
    // `workout.sections[s.sectionIndex]?.exercises[s.exerciseIndex]`
    // If sections[index] is undefined (out of bounds), ?. short-circuits to undefined.
    // The `?? null` converts undefined to null (our explicit "no value" sentinel).
    return workout.sections[s.sectionIndex]?.exercises[s.exerciseIndex] ?? null;
  }

  const currentExercise = getExercise(state);
  const currentSectionName = workout.sections[state.sectionIndex]?.name ?? '';

  // If current exercise is a timer exercise, compute the actual duration in seconds.
  // The result is null for rep-based exercises (no timer needed).
  //
  // LESSON: Conditional (ternary) type computation
  // `isTimerExercise(currentExercise)` is our type guard — after it returns true,
  // TypeScript knows `currentExercise` is a TimerExercise (has .duration).
  const currentTimerDuration: number | null =
    currentExercise && isTimerExercise(currentExercise)
      ? getTimerDuration(currentExercise.duration)
      : null;

  // Compute overall progress stats for the progress bar
  const totalExercises = workout.sections.reduce(
    (sum, section) => sum + section.exercises.length,
    0
  );

  // How many exercises (not sets!) have been fully completed?
  // We sum exercises in all sections BEFORE the current section,
  // then add the current exerciseIndex (exercises done in current section).
  const completedExercises =
    workout.sections
      .slice(0, state.sectionIndex)
      .reduce((sum, section) => sum + section.exercises.length, 0) +
    state.exerciseIndex;

  const progress: WorkoutProgress = {
    phase: state.phase,
    sectionIndex: state.sectionIndex,
    exerciseIndex: state.exerciseIndex,
    currentSet: state.currentSet,
    totalExercises,
    completedExercises,
  };

  // ==========================================================================
  // State Transitions
  // ==========================================================================

  const startWorkout = useCallback(() => {
    setState(prev => ({ ...prev, phase: WorkoutPhase.EXERCISING }));
  }, []);

  // Called when the user finishes a set (timer ran out, or they tapped "Done")
  const completeSet = useCallback(() => {
    // LESSON: setState with a function
    // When new state depends on previous state, always use the function form.
    // This avoids stale closures — React guarantees `prev` is the latest state.
    setState(prev => {
      const section = workout.sections[prev.sectionIndex];
      const exercise = section?.exercises[prev.exerciseIndex];

      if (!section || !exercise) return prev; // Safety guard

      const restDuration = exercise.restAfterSet;

      // Case 1: More sets remain for this exercise
      // Pre-increment currentSet here so when rest finishes, we're already
      // pointing to the correct next set.
      if (prev.currentSet < exercise.sets) {
        return {
          ...prev,
          phase: WorkoutPhase.RESTING,
          currentSet: prev.currentSet + 1,
          restDuration,
        };
      }

      // Case 2: Last set — move to next exercise in this section
      if (prev.exerciseIndex < section.exercises.length - 1) {
        return {
          ...prev,
          phase: WorkoutPhase.RESTING,
          exerciseIndex: prev.exerciseIndex + 1,
          currentSet: 1,
          restDuration,
        };
      }

      // Case 3: Last exercise in section — move to next section
      if (prev.sectionIndex < workout.sections.length - 1) {
        return {
          ...prev,
          phase: WorkoutPhase.RESTING,
          sectionIndex: prev.sectionIndex + 1,
          exerciseIndex: 0,
          currentSet: 1,
          restDuration,
        };
      }

      // Case 4: Everything is done!
      return { ...prev, phase: WorkoutPhase.COMPLETED };
    });
  }, [workout]);

  // Called when rest timer finishes (or user skips rest)
  const afterRest = useCallback(() => {
    setState(prev => {
      if (prev.phase !== WorkoutPhase.RESTING) return prev;
      return { ...prev, phase: WorkoutPhase.EXERCISING };
    });
  }, []);

  const restartWorkout = useCallback(() => {
    setState(INITIAL_STATE);
  }, []);

  return {
    state,
    currentExercise,
    currentSectionName,
    currentTimerDuration,
    progress,
    startWorkout,
    completeSet,
    afterRest,
    restartWorkout,
  };
}
