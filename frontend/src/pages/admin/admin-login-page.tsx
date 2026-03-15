import { useState } from 'react'
import type { FormEvent } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useAdminAuth } from '@/lib/auth'
import { ApiClientError } from '@/lib/http'
import { loginAdmin } from '@/lib/admin-api'

export function AdminLoginPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { isAuthenticated, setSession } = useAdminAuth()
  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('password')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const loginMutation = useMutation({
    mutationFn: loginAdmin,
    onSuccess: (session) => {
      setSession(session)
      navigate(searchParams.get('redirectTo') || '/admin', { replace: true })
    },
    onError: (error) => {
      if (error instanceof ApiClientError) {
        setErrorMessage(error.message)
        return
      }

      setErrorMessage('Admin login failed.')
    },
  })

  if (isAuthenticated) {
    return <Navigate to="/admin" replace />
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage(null)
    loginMutation.mutate({ username, password })
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-slate-50">
      <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-xl">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-cyan-300">Admin authentication</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight">Sign in to manage inventory and branding.</h1>
          <p className="mt-4 max-w-2xl text-slate-300">
            Phase 2 adds protected admin workflows on top of the public inventory site. Use the seeded admin account to
            manage parts, statuses, and company details.
          </p>
        </section>

        <section className="rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-xl">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200" htmlFor="admin-username">
                Username
              </label>
              <input
                id="admin-username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                className="h-11 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 text-slate-50 outline-none transition focus-visible:ring-2 focus-visible:ring-cyan-400"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200" htmlFor="admin-password">
                Password
              </label>
              <input
                id="admin-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="h-11 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 text-slate-50 outline-none transition focus-visible:ring-2 focus-visible:ring-cyan-400"
              />
            </div>

            {errorMessage ? (
              <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                {errorMessage}
              </div>
            ) : null}

            <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
              {loginMutation.isPending ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
        </section>
      </div>
    </main>
  )
}
