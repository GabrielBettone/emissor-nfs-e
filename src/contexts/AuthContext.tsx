import React, { createContext, useContext, useEffect, useState } from 'react'
import pb from '@/lib/pocketbase/client'
import { RecordModel } from 'pocketbase'

interface AuthContextType {
  user: RecordModel | null
  token: string | null
  loading: boolean
  login: (email: string, pass: string) => Promise<void>
  register: (name: string, email: string, pass: string) => Promise<void>
  requestPasswordReset: (email: string) => Promise<void>
  requestVerification: (email: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<RecordModel | null>(pb.authStore.record)
  const [token, setToken] = useState<string | null>(pb.authStore.token)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    return pb.authStore.onChange((newToken, newModel) => {
      setToken(newToken)
      setUser(newModel)
    })
  }, [])

  const login = async (email: string, pass: string) => {
    setLoading(true)
    try {
      await pb.collection('users').authWithPassword(email.trim(), pass)
    } finally {
      setLoading(false)
    }
  }

  const register = async (name: string, email: string, pass: string) => {
    setLoading(true)
    try {
      await pb.collection('users').create({
        name,
        email: email.trim(),
        password: pass,
        passwordConfirm: pass,
      })
      // Tentar login automático
      await pb.collection('users').authWithPassword(email.trim(), pass)
      // Solicitar e-mail de verificação se configurado
      try {
        await pb.collection('users').requestVerification(email.trim())
      } catch (_) {
        // Sem servidor de email configurado em ambiente de dev
      }
    } finally {
      setLoading(false)
    }
  }

  const requestPasswordReset = async (email: string) => {
    setLoading(true)
    try {
      await pb.collection('users').requestPasswordReset(email.trim())
    } finally {
      setLoading(false)
    }
  }

  const requestVerification = async (email: string) => {
    setLoading(true)
    try {
      await pb.collection('users').requestVerification(email.trim())
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    pb.authStore.clear()
    setUser(null)
    setToken(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        requestPasswordReset,
        requestVerification,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
