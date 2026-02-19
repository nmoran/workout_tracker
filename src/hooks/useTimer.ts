// =============================================================================
// TYPESCRIPT LESSON FILE: useTimer.ts
//
// This file shows how to write a custom React hook with TypeScript.
// A "custom hook" is a function that:
//   1. Starts with "use" (React convention)
//   2. Can call other hooks (useState, useEffect, etc.)
//   3. Returns data and/or functions for components to use
// =============================================================================

import { useState, useEffect, useCallback, useRef } from 'react';

// =============================================================================
// LESSON: Type Aliases for State
//
// Instead of using raw strings everywhere, we define a type alias for the
// possible timer statuses. This means TypeScript will error if you try to
// set the status to something like 'running ' (typo) or 'stopped' (wrong name).
// =============================================================================

type TimerStatus = 'idle' | 'running' | 'paused' | 'finished';

// =============================================================================
// LESSON: Interfaces for Return Types
//
// Defining the return type of a hook as an interface documents exactly what
// the hook provides. IDEs can show auto-complete based on this interface.
// =============================================================================

export interface TimerState {
  timeRemaining: number; // Seconds left on the countdown
  totalTime: number;     // The full duration (used to compute progress)
  status: TimerStatus;   // Current state of the timer
  progress: number;      // 0.0 → 1.0 (how far through the timer, used for animation)
}

export interface TimerControls {
  // LESSON: Optional Parameters
  // The `?` after a parameter name makes it optional.
  // start() uses the hook's initialDuration; start(45) overrides with 45 seconds.
  start: (duration?: number) => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
}

// LESSON: Intersection Types with `&`
// This combines TimerState and TimerControls into one type.
// A value of type UseTimerReturn has ALL properties from both interfaces.
export type UseTimerReturn = TimerState & TimerControls;

// =============================================================================
// The Hook
// =============================================================================

/**
 * A countdown timer hook.
 *
 * @param initialDuration - Default duration in seconds
 * @param onComplete - Optional callback fired when the timer reaches 0
 *
 * LESSON: Function Type Signatures
 * `onComplete?: () => void` means:
 *   - `?`        → it's optional (may be undefined)
 *   - `() =>`    → it's a function that takes no arguments
 *   - `void`     → it returns nothing (we don't care about the return value)
 */
export function useTimer(
  initialDuration: number,
  onComplete?: () => void
): UseTimerReturn {
  // LESSON: useState<T> Generic
  // The <T> type parameter tells TypeScript what type this state will hold.
  // Without it, TypeScript would infer the type from the initial value.
  const [timeRemaining, setTimeRemaining] = useState<number>(initialDuration);
  const [totalTime, setTotalTime] = useState<number>(initialDuration);
  const [status, setStatus] = useState<TimerStatus>('idle');

  // LESSON: useRef with a Type Parameter
  // useRef holds a mutable value that does NOT cause re-renders when changed.
  // We use it for the interval ID so we can cancel it later.
  //
  // `ReturnType<typeof setInterval>` is a TypeScript utility type that says
  // "whatever type setInterval returns". This is cross-platform safe (it's
  // `number` in browsers but `NodeJS.Timeout` in Node.js).
  //
  // `| null` makes it a union — the ref starts as null (no interval running).
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // We store onComplete in a ref so that if the caller passes a new function
  // each render (e.g. an inline arrow function), we always call the latest
  // version without needing to restart the interval.
  const onCompleteRef = useRef<typeof onComplete>(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  });

  // Cleanup: clear the interval when the component unmounts.
  // Returning a function from useEffect is how you do cleanup in React.
  useEffect(() => {
    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // LESSON: useCallback
  // useCallback memoizes a function — it only creates a new function object
  // when its dependencies change. This prevents unnecessary re-renders in
  // child components that receive the function as a prop.
  const clearIntervalSafe = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []); // Empty deps = this function never changes

  const start = useCallback(
    (duration?: number) => {
      clearIntervalSafe();
      // LESSON: Nullish Coalescing `??`
      // `duration ?? initialDuration` means:
      //   "use duration if it's not null/undefined, otherwise use initialDuration"
      // This is different from `||` which also treats 0 as falsy.
      const d = duration ?? initialDuration;
      setTotalTime(d);
      setTimeRemaining(d);
      setStatus('running');

      intervalRef.current = setInterval(() => {
        // LESSON: Functional State Updates
        // Instead of setTimeRemaining(timeRemaining - 1), we use a function.
        // This ensures we always work with the most recent state value,
        // even if multiple updates are batched together.
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearIntervalSafe();
            setStatus('finished');
            // LESSON: Optional Chaining `?.`
            // `onCompleteRef.current?.()` calls the function ONLY if it's not
            // null or undefined. Without `?.`, you'd need an if-check first.
            onCompleteRef.current?.();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    },
    [clearIntervalSafe, initialDuration]
  );

  const pause = useCallback(() => {
    clearIntervalSafe();
    setStatus('paused');
  }, [clearIntervalSafe]);

  const resume = useCallback(() => {
    if (status !== 'paused') return;
    setStatus('running');

    intervalRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearIntervalSafe();
          setStatus('finished');
          onCompleteRef.current?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [clearIntervalSafe, status]);

  const reset = useCallback(() => {
    clearIntervalSafe();
    setTimeRemaining(initialDuration);
    setTotalTime(initialDuration);
    setStatus('idle');
  }, [clearIntervalSafe, initialDuration]);

  // LESSON: Derived Values
  // We compute `progress` from state instead of storing it separately.
  // This ensures it's always consistent with timeRemaining/totalTime.
  const progress = totalTime > 0 ? (totalTime - timeRemaining) / totalTime : 0;

  // LESSON: Spread Syntax in Return
  // We return an object that satisfies the UseTimerReturn interface.
  // TypeScript will error if we're missing any required properties.
  return {
    timeRemaining,
    totalTime,
    status,
    progress,
    start,
    pause,
    resume,
    reset,
  };
}
