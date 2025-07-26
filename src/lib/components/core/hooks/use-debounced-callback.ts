import { useCallback, useRef } from 'react'

export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  return useCallback(
    (...args: Parameters<T>) => {
      if (debounceRef.current !== null) {
        clearTimeout(debounceRef.current)
      }

      debounceRef.current = setTimeout(() => {
        callback(...args)
      }, delay)
    },
    [callback, delay]
  )
}