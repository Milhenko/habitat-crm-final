'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

/**
 * Runs silently on every page. Saves the current pathname to
 * localStorage so the root redirect can send the user back here
 * on their next visit.
 *
 * Excluded paths (login, root splash, privacy) are never saved.
 */

export const LAST_PAGE_KEY  = 'habitat_last_page'
export const DEFAULT_PAGE   = '/comunidad'

const EXCLUDED = new Set(['/', '/login', '/privacy'])

export function clearLastPage() {
  try { localStorage.removeItem(LAST_PAGE_KEY) } catch {}
}

export function getLastPage(): string {
  try {
    return localStorage.getItem(LAST_PAGE_KEY) ?? DEFAULT_PAGE
  } catch {
    return DEFAULT_PAGE
  }
}

export default function PageTracker() {
  const pathname = usePathname()

  useEffect(() => {
    if (EXCLUDED.has(pathname)) return
    try {
      localStorage.setItem(LAST_PAGE_KEY, pathname)
    } catch {}
  }, [pathname])

  return null
}
