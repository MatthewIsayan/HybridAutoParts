import { createContext, useContext, useMemo, useState } from 'react'
import type { PropsWithChildren } from 'react'
import type { AdminSession } from '@/types/api'

const ADMIN_SESSION_STORAGE_KEY = 'hybrid-admin-session'

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
