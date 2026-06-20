// Shared "paper" palette for the Algorithms section.
// Warm editorial look: paper background, ink text, with a few signal colors.
export const C = {
  ink: '#14140F',
  paper: '#F2EEE3',
  signal: '#E0533A',
  trace: '#3B6E8C',
  go: '#4E7A51',
  slate: '#8A8678',
  wire: '#C9C3B2',
  codebg: '#1C1B16',
  codeink: '#E8E3D5',
  codedim: '#6F6A5A',
  codehl: '#3A3526',
} as const

// Difficulty -> color
export const DIFFICULTY_COLOR: Record<string, string> = {
  Easy: C.go,
  Medium: C.trace,
  Hard: C.signal,
}

export const MONO = "'Space Mono', monospace"
export const SANS = "'DM Sans', system-ui, sans-serif"
