import { useAuthStore } from '../store/authStore'

export const usePermission = () => {
  const { permissions, user } = useAuthStore()

  const hasPermission = (permission) => permissions.includes(permission)
  const hasRole = (role) => user?.role === role
  const hasAnyRole = (roles) => roles.includes(user?.role)
  const hasAnyPermission = (perms) => perms.some((p) => permissions.includes(p))

  return { hasPermission, hasRole, hasAnyRole, hasAnyPermission }
}
