import { flushSync } from 'react-dom'
import type { CSSProperties } from 'react'
import type { NavigateFunction } from 'react-router-dom'
import type { Palette, SagaStory, SagaSummary } from './types'

export const storyCache = new Map<string, SagaStory>()
export const sagasCache = new Map<string, SagaSummary[]>()

export function paletteStyle(palette: Palette): CSSProperties & Record<`--saga-${string}`, string> {
  return {
    '--saga-bg': palette.background,
    '--saga-surface': palette.surface,
    '--saga-primary': palette.primary,
    '--saga-accent': palette.accent,
    '--saga-text': palette.text,
  }
}

export function transitionNavigate(navigate: NavigateFunction, target: string) {
  if ('startViewTransition' in document && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.startViewTransition(() => {
      flushSync(() => { void navigate(target) })
      window.scrollTo({ top: 0, behavior: 'instant' })
    })
  } else {
    void navigate(target)
    window.scrollTo({ top: 0, behavior: 'instant' })
  }
}
