import { useEffect, useState } from 'react'
import { ApiError, apiRequest, errorMessage, isAbortError } from './api'
import { useToken } from './auth'

export function useResource<T>(path: string, seed?: T) {
  const token = useToken()
  const [result, setResult] = useState<{ path: string; data: T } | null>(seed ? { path, data: seed } : null)
  const [error, setError] = useState('')
  const [locked, setLocked] = useState(false)
  const [loading, setLoading] = useState(true)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    if (seed && attempt === 0) {
      setResult({ path, data: seed })
      setLoading(false)
      return
    }
    const controller = new AbortController()
    setLoading(true)
    setError('')
    setLocked(false)
    apiRequest<T>(path, { token, signal: controller.signal })
      .then((data) => {
        if (!controller.signal.aborted) setResult({ path, data })
      })
      .catch((reason: unknown) => {
        if (isAbortError(reason) || controller.signal.aborted) return
        setLocked(reason instanceof ApiError && reason.status === 423)
        setError(errorMessage(reason))
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
  }, [path, token, attempt, seed])

  return {
    data: result?.path === path ? result.data : null,
    error,
    locked,
    loading,
    retry: () => setAttempt((value) => value + 1),
  }
}
