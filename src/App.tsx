// =============================================================================
// TYPESCRIPT LESSON FILE: App.tsx
//
// Previously this file had a simple boolean (isRunning: true/false) to track
// which screen to show. Now we have three screens — selector, plan, runner —
// so a boolean isn't expressive enough.
//
// We use a DISCRIMINATED UNION to model the possible views. This is the same
// pattern as Exercise (timer | reps) but applied to app navigation state.
// =============================================================================

import { useState } from 'react';
import { WorkoutSelector } from './components/WorkoutSelector';
import { WorkoutPlan } from './components/WorkoutPlan';
import { WorkoutRunner } from './components/WorkoutRunner';

import { type Workout } from './types/workout';
import workoutsData from './data/workouts.json';

// Cast the JSON array to our typed array.
const workouts = workoutsData as unknown as Workout[];

// =============================================================================
// LESSON: Discriminated Union for App State
//
// Instead of multiple booleans (isShowingPlan, isRunning, selectedWorkout...),
// we use a single type that can only be in ONE valid state at a time.
//
// Each variant has a `screen` property as the discriminant. TypeScript uses it
// to know exactly which other properties are available in each case.
//
// Notice: the 'selector' screen doesn't need a workout, but 'plan' and
// 'runner' both require one. A boolean couldn't express this constraint.
// =============================================================================

type AppView =
  | { screen: 'selector' }
  | { screen: 'plan'; workout: Workout }
  | { screen: 'runner'; workout: Workout };

export function App() {
  // Our state is now a full AppView object, not just a boolean
  const [view, setView] = useState<AppView>({ screen: 'selector' });

  // LESSON: Helper functions that create the next view object.
  // Each one is clearly named and only creates valid transitions.
  const showPlan = (workout: Workout) => setView({ screen: 'plan', workout });
  const showRunner = () => {
    // We can only reach the runner from the plan, so workout is always defined.
    // TypeScript enforces this — you can't call showRunner without having
    // already selected a workout via showPlan.
    if (view.screen === 'plan') {
      setView({ screen: 'runner', workout: view.workout });
    }
  };
  const showSelector = () => setView({ screen: 'selector' });

  // ==========================================================================
  // LESSON: Switch statement on a discriminated union
  //
  // TypeScript narrows the type inside each case branch.
  // Inside `case 'plan'`, TypeScript knows view.workout exists.
  // Inside `case 'selector'`, accessing view.workout would be a compile error.
  // ==========================================================================

  switch (view.screen) {
    case 'selector':
      return (
        <WorkoutSelector
          workouts={workouts}
          onSelect={showPlan}
        />
      );

    case 'plan':
      return (
        <WorkoutPlan
          workout={view.workout}   // TypeScript knows this is safe in 'plan'
          onStart={showRunner}
          onBack={showSelector}
        />
      );

    case 'runner':
      return (
        <WorkoutRunner
          workout={view.workout}   // TypeScript knows this is safe in 'runner'
          onExit={() => showPlan(view.workout)} // Go back to plan, not selector
        />
      );
  }
}
