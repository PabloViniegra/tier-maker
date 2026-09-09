'use client'

import { useCallback, useEffect, type MouseEvent } from 'react'

const UNSAVED_CHANGES_MESSAGE =
  'You have unsaved changes. Are you sure you want to leave?'

export function useUnsavedChangesGuard(isDirty: boolean) {
  useEffect(() => {
    if (!isDirty) return

    function handleBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault()
      event.returnValue = ''
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isDirty])

  return useCallback(
    (event: MouseEvent<HTMLAnchorElement>) => {
      if (!isDirty) return
      if (!window.confirm(UNSAVED_CHANGES_MESSAGE)) event.preventDefault()
    },
    [isDirty]
  )
}
