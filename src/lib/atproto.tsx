'use client'

import { useState, useEffect, useCallback, createContext, useContext } from 'react'
import { ADMIN_DIDS } from './lexicons'

// Session type
export interface Session {
  did: string
  handle: string
  displayName?: string
  avatar?: string
}

// Auth status
export type AuthStatus = 'idle' | 'authorizing' | 'authenticated' | 'error'

// Auth state
interface AuthState {
  status: AuthStatus
  session: Session | null
  error: Error | null
  isLoading: boolean
}

// Auth context
const AuthContext = createContext<{
  state: AuthState
  login: (handle: string, returnTo?: string) => Promise<void>
  logout: () => Promise<void>
} | null>(null)

/**
 * Auth Provider Component
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    status: 'idle',
    session: null,
    error: null,
    isLoading: true,
  })

  // Check session status on mount
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch('/api/status')
        if (response.ok) {
          const data = await response.json()
          if (data.did) {
            setState({
              status: 'authenticated',
              session: { 
                did: data.did, 
                handle: data.handle || data.did,
                displayName: data.displayName,
                avatar: data.avatar,
              },
              error: null,
              isLoading: false,
            })
            return
          }
        }
      } catch (error) {
        console.error('Failed to check auth status:', error)
      }
      setState(prev => ({ ...prev, isLoading: false }))
    }

    checkStatus()
  }, [])

  // Login function - initiates OAuth flow
  const login = useCallback(async (handle: string, returnTo?: string) => {
    setState(prev => ({ ...prev, status: 'authorizing', isLoading: true, error: null }))

    try {
      const normalizedHandle = handle.includes('.') ? handle : `${handle}.bsky.social`

      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ handle: normalizedHandle, returnTo }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Login failed')
      }

      const data = await response.json()

      // Redirect to OAuth provider
      window.location.href = data.redirectUrl
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Login failed')
      setState({ status: 'error', session: null, error, isLoading: false })
      throw error
    }
  }, [])

  // Logout function
  const logout = useCallback(async () => {
    try {
      await fetch('/api/logout', { method: 'POST' })
    } catch (error) {
      console.error('Logout request failed:', error)
    }
    setState({ status: 'idle', session: null, error: null, isLoading: false })
  }, [])

  return (
    <AuthContext.Provider value={{ state, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

/**
 * Hook to access auth state and actions
 */
export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  const { state, login, logout } = context

  const isAdmin = state.session ? ADMIN_DIDS.includes(state.session.did) : false

  return {
    status: state.status,
    session: state.session,
    error: state.error,
    isLoading: state.isLoading,
    isAuthenticated: state.status === 'authenticated',
    isAdmin,
    login,
    logout,
  }
}

// Re-export types for convenience
export type { AuthStatus as AuthStatusType }
