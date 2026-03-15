import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { PropsWithChildren } from 'react'
import type { AdminSession } from '@/types/api'

const ADMIN_SESSION_STORAGE_KEY = 'hybrid-admin-session'
const ADMIN_AUTH_NOTICE_STORAGE_KEY = 'hybrid-admin-auth-notice'
export const ADMIN_SESSION_EXPIRED_EVENT = 'hybrid-admin-session-expired'

interface AdminAuthContextValue {
  session: AdminSession | null
  adminToken: string | null
  isAuthenticated: boolean
  setSession: (session: AdminSession) => void
  clearSession: () => void
}

const AdminAuthContext = createContext<AdminAuthContextValue | undefined>(undefined)

export function AdminAuthProvider({ children }: PropsWithChildren) {
  const [session, setSessionState] = useState<AdminSession | null>(() => readStoredSession())

  useEffect(() => {
    function handleSessionExpired() {
      setSessionState(null)
      window.localStorage.removeItem(ADMIN_SESSION_STORAGE_KEY)
      window.sessionStorage.setItem(ADMIN_AUTH_NOTICE_STORAGE_KEY, 'Your admin session expired. Please sign in again.')
    }

    window.addEventListener(ADMIN_SESSION_EXPIRED_EVENT, handleSessionExpired)
    return () => window.removeEventListener(ADMIN_SESSION_EXPIRED_EVENT, handleSessionExpired)
  }, [])

  const value = useMemo<AdminAuthContextValue>(
    () => ({
      session,
      adminToken: session?.accessToken ?? null,
      isAuthenticated: Boolean(session?.accessToken),
      setSession: (nextSession) => {
        setSessionState(nextSession)
        window.localStorage.setItem(ADMIN_SESSION_STORAGE_KEY, JSON.stringify(nextSession))
      },
      clearSession: () => {
        setSessionState(null)
        window.localStorage.removeItem(ADMIN_SESSION_STORAGE_KEY)
      },
    }),
    [session],
  )

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext)

  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider')
  }

  return context
}

export function consumeAdminAuthNotice() {
  if (typeof window === 'undefined') {
    return null
  }

  const message = window.sessionStorage.getItem(ADMIN_AUTH_NOTICE_STORAGE_KEY)
  if (!message) {
    return null
  }

  window.sessionStorage.removeItem(ADMIN_AUTH_NOTICE_STORAGE_KEY)
  return message
}

function readStoredSession(): AdminSession | null {
  if (typeof window === 'undefined') {
    return null
  }

  const rawSession = window.localStorage.getItem(ADMIN_SESSION_STORAGE_KEY)
  if (!rawSession) {
    return null
  }

  try {
    const parsedSession = JSON.parse(rawSession) as AdminSession
    if (!parsedSession.accessToken || isExpired(parsedSession.expiresAt)) {
      window.localStorage.removeItem(ADMIN_SESSION_STORAGE_KEY)
      return null
    }

    return parsedSession
  } catch {
    window.localStorage.removeItem(ADMIN_SESSION_STORAGE_KEY)
    return null
  }
}

function isExpired(expiresAt?: string) {
  if (!expiresAt) {
    return false
  }

  return new Date(expiresAt).getTime() <= Date.now()
}
