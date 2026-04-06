import { usePermission } from '../../hooks/usePermission'

/**
 * Renders children only if the user has the required permission/role.
 * Usage:
 *   <PermissionGuard permission="manage_users"> ... </PermissionGuard>
 *   <PermissionGuard role="it_admin"> ... </PermissionGuard>
 *   <PermissionGuard roles={['it_admin','dispatcher']}> ... </PermissionGuard>
 */
export default function PermissionGuard({ permission, role, roles, children, fallback = null }) {
  const { hasPermission, hasRole, hasAnyRole } = usePermission()

  if (permission && !hasPermission(permission)) return fallback
  if (role && !hasRole(role)) return fallback
  if (roles && !hasAnyRole(roles)) return fallback

  return children
}
