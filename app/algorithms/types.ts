import type { ComponentType } from 'react'

export type Lang = 'js' | 'ts' | 'py' | 'java' | 'cpp'

export const LANGS: { id: Lang; label: string }[] = [
  { id: 'js', label: 'JavaScript' },
  { id: 'ts', label: 'TypeScript' },
  { id: 'py', label: 'Python' },
  { id: 'java', label: 'Java' },
  { id: 'cpp', label: 'C++' },
]

export type Difficulty = 'Easy' | 'Medium' | 'Hard'

export type Category = {
  slug: string
  name: string
  blurb: string
}

export type Algorithm = {
  slug: string
  category: string // category slug
  title: string
  difficulty: Difficulty
  blurb: string
  tags?: string[]
  // Explanation content
  statement: string
  intuition: string[]
  steps: string[]
  complexity: { time: string; space: string }
  // Source per language (primary solution)
  code: Record<Lang, string>
  // Optional additional named solutions shown alongside the primary one
  solutions?: Solution[]
  // Optional interactive walkthrough component
  Visualizer?: ComponentType
}

export type Solution = {
  name: string
  blurb?: string
  code: Record<Lang, string>
}
