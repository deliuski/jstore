import { useCallback, useState, useSyncExternalStore } from 'react'
import { NavigationType, useNavigationType } from 'react-router'

export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const list = window.matchMedia(query)
      list.addEventListener('change', onChange)
      return () => list.removeEventListener('change', onChange)
    },
    [query],
  )
  return useSyncExternalStore(subscribe, () => window.matchMedia(query).matches)
}

/**
 * Local text for an input whose value lives in the URL. The router updates the
 * location inside a transition, which can't drive a controlled input, so the input
 * keeps its own state. Typing writes with replace navigation; any other URL change
 * (back button, a removed chip, reset, header links) is copied into the input.
 */
export function useUrlDraft(urlValue: string): [string, (value: string) => void] {
  const navigationType = useNavigationType()
  const [draft, setDraft] = useState(urlValue)
  const [seen, setSeen] = useState(urlValue)

  if (urlValue !== seen) {
    setSeen(urlValue)
    if (navigationType !== NavigationType.Replace) setDraft(urlValue)
  }
  return [draft, setDraft]
}
