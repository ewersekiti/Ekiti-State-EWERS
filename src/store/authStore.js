import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export const ROLE_PERMISSIONS = {
  it_admin: [
    'view_dashboard', 'view_incidents', 'assign_incident', 'update_incident',
    'delete_incident', 'manage_users', 'manage_roles', 'manage_config', 'view_reports', 'send_alert',
  ],
  dispatcher: ['view_dashboard', 'view_incidents', 'assign_incident', 'update_incident'],
  sms_intake_officer: ['view_dashboard', 'create_sms_incident'],
  field_officer: ['view_dashboard', 'view_assigned_incidents'],
}

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      permissions: [],

      login: async (email, password) => {
        try {
          const res = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          })
          const data = await res.json()
          if (!res.ok) return { success: false, error: data.message || 'Login failed' }
          set({ user: data.user, token: data.token, permissions: data.permissions })
          return { success: true }
        } catch {
          return { success: false, error: 'Cannot connect to server. Please try again.' }
        }
      },

      logout: () => set({ user: null, token: null, permissions: [] }),

      hasPermission: (permission) => get().permissions.includes(permission),
    }),
    { name: 'ekiti-auth' }
  )
)
