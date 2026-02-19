// =============================================================================
// TYPESCRIPT LESSON FILE: App.tsx
//
// The root component of the app. It decides which "screen" to show:
//   - WorkoutPlan: the overview before starting
//   - WorkoutRunner: the active workout UI
//
// This pattern (top-level state controlling which view to show) is a simple
// alternative to a router library for small apps.
// =============================================================================

import { useState } from 'react';
import { WorkoutPlan } from './components/WorkoutPlan';
import { WorkoutRunner } from './components/WorkoutRunner';

// LESSON: Importing JSON
// With "resolveJsonModule": true in tsconfig.json, TypeScript can import
// JSON files and will infer the type from the file's structure.
import workoutData from './data/pullup-workout.json';

// We need to cast the JSON to our Workout interface.
// TypeScript infers literal string types from JSON but can't know that
// "timer" and "reps" are discriminant literals without the cast.
// `as unknown as Workout` is a two-step cast: first to `unknown` (the
// universal supertype), then to `Workout`. This is safe here because we
// control the JSON file and know it matches the interface.
import { type Workout } from './types/workout';

// LESSON: `as unknown as T` type assertion
// When TypeScript won't accept a direct cast (e.g. JSON → interface with
// discriminated unions), cast through `unknown` first.
const workout = workoutData as unknown as Workout;

// =============================================================================
// LESSON: React Component with State
//
// `useState<boolean>` creates a state variable.
// The generic parameter `<boolean>` is optional here — TypeScript would infer
// it from the initial value `false`. But it's good to be explicit.
// =============================================================================

export function App() {
  // `isRunning` controls which screen we show.
  // `setIsRunning` is the function to update it.
  const [isRunning, setIsRunning] = useState<boolean>(false);

  // LESSON: Event handler functions
  // These are typed as `() => void` — functions that take no arguments and
  // return nothing. They're passed as props to child components.
  const handleStart = () => setIsRunning(true);
  const handleExit = () => setIsRunning(false);

  return (
    // LESSON: Conditional rendering in JSX
    // The ternary operator `condition ? <A /> : <B />` renders one of two
    // components based on a condition.
    //
    // Alternative: `{condition && <A />}` renders A only if condition is true.
    <>
      {isRunning ? (
        <WorkoutRunner workout={workout} onExit={handleExit} />
      ) : (
        <WorkoutPlan workout={workout} onStart={handleStart} />
      )}
    </>
  );
}
