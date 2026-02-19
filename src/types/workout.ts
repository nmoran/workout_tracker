// =============================================================================
// TYPESCRIPT LESSON FILE: workout.ts
//
// This file is the heart of our app's type system. Read through the comments
// to learn core TypeScript concepts used in real-world projects.
// =============================================================================

// =============================================================================
// LESSON 1: Type Aliases
// =============================================================================
//
// The `type` keyword creates a "type alias" — a name for a type expression.
// Think of it as a variable, but for types instead of values.
//
// We use `|` to create a "union type" — meaning "this OR that".
// Here, a RepCount can be either a plain number OR an object with min/max.
//
// Examples:
//   const fixedReps: RepCount = 5;               // ✅ a plain number
//   const repRange: RepCount = { min: 6, max: 8 }; // ✅ an object with min/max
//   const badReps: RepCount = "five";              // ❌ TypeScript error!

export type RepCount = number | { min: number; max: number };

// Same idea for duration (measured in seconds).
export type Duration = number | { min: number; max: number };

// =============================================================================
// LESSON 2: Interfaces
// =============================================================================
//
// An `interface` defines the "shape" of an object — what properties it has
// and what types those properties are.
//
// Think of it as a blueprint: any object that matches this shape is valid.
//
// INTERFACE vs TYPE:
//   - Both can describe object shapes
//   - Interfaces can be `extend`ed (see BaseExercise below)
//   - Types can represent unions, intersections, primitives
//   - In practice, use interfaces for objects and type for unions/aliases

// Properties shared by EVERY exercise, regardless of whether it's timed or reps-based.
interface BaseExercise {
  // `readonly` means this property cannot be changed after the object is created.
  // It's like `const` but for object properties.
  readonly id: string;

  name: string;

  // The `?` makes a property OPTIONAL — it might exist, or might not.
  // TypeScript forces you to check if it's defined before using it.
  description?: string;
  tip?: string;
  sets: number;
  restAfterSet: number; // seconds to rest after each set
}

// =============================================================================
// LESSON 3: Interface Inheritance with `extends`
// =============================================================================
//
// Just like classes, interfaces can extend other interfaces.
// TimerExercise gets ALL properties from BaseExercise, plus its own.
//
// The `type: 'timer'` property uses a "literal type" — it can ONLY be the
// exact string 'timer', not any other string. This is the key to discriminated
// unions (Lesson 4 below).

export interface TimerExercise extends BaseExercise {
  type: 'timer'; // Literal type: can ONLY be exactly 'timer'
  duration: Duration;
}

export interface RepsExercise extends BaseExercise {
  type: 'reps'; // Literal type: can ONLY be exactly 'reps'
  reps: RepCount;
}

// =============================================================================
// LESSON 4: Discriminated Unions
// =============================================================================
//
// A discriminated union is a union of types that share a common "discriminant"
// property — here, `type` is either 'timer' or 'reps'.
//
// This lets TypeScript narrow the type in conditionals:
//
//   function handleExercise(ex: Exercise) {
//     if (ex.type === 'timer') {
//       ex.duration; // ✅ TypeScript knows ex is TimerExercise here
//       ex.reps;     // ❌ Error! TimerExercise doesn't have reps
//     } else {
//       ex.reps;     // ✅ TypeScript knows ex is RepsExercise here
//     }
//   }

export type Exercise = TimerExercise | RepsExercise;

// =============================================================================
// LESSON 5: Type Guard Functions
// =============================================================================
//
// A type guard is a function that tells TypeScript what specific type
// something is at runtime. The "type predicate" return type `exercise is TimerExercise`
// is the special TypeScript syntax that makes this work.
//
// After calling isTimerExercise(ex) in an `if`, TypeScript knows ex is a
// TimerExercise inside the true branch, and RepsExercise in the false branch.

export function isTimerExercise(exercise: Exercise): exercise is TimerExercise {
  return exercise.type === 'timer';
}

export function isRepsExercise(exercise: Exercise): exercise is RepsExercise {
  return exercise.type === 'reps';
}

// =============================================================================
// LESSON 6: Type Narrowing with `typeof`
// =============================================================================
//
// `typeof` in TypeScript (and JavaScript) checks the runtime type of a value.
// TypeScript uses this to "narrow" union types within if/else blocks.
//
// Here, RepCount is `number | { min: number; max: number }`.
// Inside `if (typeof reps === 'number')`, TypeScript knows reps is a number.
// In the else branch, it knows reps must be the object form.

export function formatRepCount(reps: RepCount): string {
  if (typeof reps === 'number') {
    return `${reps} rep${reps !== 1 ? 's' : ''}`;
  }
  // reps is narrowed to { min: number; max: number } here
  return `${reps.min}–${reps.max} reps`;
}

export function formatDuration(duration: Duration): string {
  if (typeof duration === 'number') {
    return `${duration}s`;
  }
  return `${duration.min}–${duration.max}s`;
}

// Returns a single number to use for the timer countdown.
// For ranges, uses the midpoint (e.g., 40–60s → 50s).
export function getTimerDuration(duration: Duration): number {
  if (typeof duration === 'number') {
    return duration;
  }
  return Math.round((duration.min + duration.max) / 2);
}

// =============================================================================
// LESSON 7: Nested Interfaces (Composing Types)
// =============================================================================
//
// Interfaces can reference other interfaces, building up complex structures.
// Exercise[] means "an array where every element is an Exercise".

export interface WorkoutSection {
  id: string;
  name: string;
  exercises: Exercise[]; // Array of Exercise (TimerExercise | RepsExercise)
}

export interface Workout {
  id: string;           // Unique identifier, used as React key and for theme lookup
  name: string;
  description?: string; // Optional — the workout may or may not have a description
  sections: WorkoutSection[];
}

// =============================================================================
// LESSON 8: Enums
// =============================================================================
//
// An `enum` is a named set of constant values. They're great when you have
// a fixed set of states, options, or categories.
//
// We model all possible phases a workout can be in:

export enum WorkoutPhase {
  IDLE = 'IDLE',           // Workout hasn't started yet
  EXERCISING = 'EXERCISING', // Actively doing an exercise
  RESTING = 'RESTING',     // Resting between sets/exercises
  COMPLETED = 'COMPLETED', // All exercises are done!
}

// =============================================================================
// LESSON 9: Using Interfaces for State Objects
// =============================================================================
//
// It's best practice to define the shape of your application state
// with an interface. This documents what data exists and prevents mistakes.

export interface WorkoutState {
  phase: WorkoutPhase;
  sectionIndex: number;   // Which section (0 = warmup, 1 = workout, etc.)
  exerciseIndex: number;  // Which exercise within the current section
  currentSet: number;     // Which set we're on (1-indexed)
  restDuration: number;   // How many seconds to rest (0 when not resting)
}

// Progress data passed to UI components for display
export interface WorkoutProgress {
  phase: WorkoutPhase;
  sectionIndex: number;
  exerciseIndex: number;
  currentSet: number;
  totalExercises: number;     // Total exercises across all sections
  completedExercises: number; // How many exercises fully finished
}
