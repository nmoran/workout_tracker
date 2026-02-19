// =============================================================================
// TYPESCRIPT LESSON FILE: CircularTimer.tsx
//
// This file shows how to type React component props and use SVG in React.
// =============================================================================

// LESSON: React imports
// With modern JSX transform (configured in tsconfig.json as "jsx": "react-jsx"),
// you no longer need `import React from 'react'` in every file.
// TypeScript knows JSX is React.createElement calls automatically.

// =============================================================================
// LESSON: Props Interface
//
// "Props" are the inputs to a React component — like function parameters.
// We define them as an interface so TypeScript can check that:
//   1. The parent passes all required props
//   2. The parent doesn't pass unknown props
//   3. The component uses props with the right types
// =============================================================================

interface CircularTimerProps {
  timeRemaining: number; // Seconds left on the countdown
  totalTime: number;     // Total seconds (for computing the arc length)
  color?: 'indigo' | 'green' | 'orange'; // Union of allowed color strings
  size?: 'sm' | 'lg'; // Optional size variant
}

// LESSON: Record<K, V> Utility Type
// Record<K, V> creates an object type where keys are type K and values are type V.
// It's like writing `{ [key: K]: V }` but more readable.
// Here: keys must be 'indigo' | 'green' | 'orange', values must be strings.
const COLOR_CLASSES: Record<string, string> = {
  indigo: '#818cf8', // indigo-400
  green: '#34d399',  // emerald-400
  orange: '#fb923c', // orange-400
};

export function CircularTimer({
  timeRemaining,
  totalTime,
  color = 'indigo', // Default parameter value
  size = 'lg',
}: CircularTimerProps) {
  // SVG math for the circular progress arc
  const isLarge = size === 'lg';
  const svgSize = isLarge ? 200 : 120;
  const cx = svgSize / 2;
  const cy = svgSize / 2;
  const radius = isLarge ? 80 : 48;
  const strokeWidth = isLarge ? 10 : 7;

  const circumference = 2 * Math.PI * radius;

  // How much of the circle should be filled?
  // When timeRemaining === totalTime → progress = 1 (full circle)
  // When timeRemaining === 0        → progress = 0 (empty circle)
  const fillProgress = totalTime > 0 ? timeRemaining / totalTime : 0;

  // strokeDashoffset controls how much of the dashed stroke is visible.
  // At 0 offset: full circle visible. At circumference offset: nothing visible.
  const strokeDashoffset = circumference * (1 - fillProgress);

  const strokeColor = COLOR_CLASSES[color] ?? COLOR_CLASSES['indigo'];

  // LESSON: Template Literal Types
  // We compute the CSS class string dynamically.
  const containerClass = isLarge ? 'w-48 h-48' : 'w-28 h-28';
  const textClass = isLarge ? 'text-5xl' : 'text-3xl';

  return (
    // LESSON: JSX with TypeScript
    // className is the React prop for the HTML `class` attribute.
    // All HTML attribute names are camelCase in JSX (className, onClick, etc.)
    <div className={`relative ${containerClass}`}>
      {/* The SVG is rotated -90° so the arc starts at the top (12 o'clock position)
          instead of the default right (3 o'clock position) */}
      <svg
        className="w-full h-full -rotate-90"
        viewBox={`0 0 ${svgSize} ${svgSize}`}
        // LESSON: `aria-*` attributes for accessibility
        aria-hidden="true"
      >
        {/* Background track — always full circle, dimmed */}
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke="#1e293b" // slate-800
          strokeWidth={strokeWidth}
        />

        {/* Progress arc — shrinks as time runs out */}
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          // CSS transition makes the arc animate smoothly each second
          style={{ transition: 'stroke-dashoffset 0.8s ease' }}
        />
      </svg>

      {/* The time number is absolutely positioned over the SVG */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`${textClass} font-bold text-white tabular-nums`}>
          {timeRemaining}
        </span>
        <span className="text-xs text-slate-400 mt-1">seconds</span>
      </div>
    </div>
  );
}
