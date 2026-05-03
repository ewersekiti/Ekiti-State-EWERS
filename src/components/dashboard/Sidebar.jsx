import { NavLink } from 'react-router-dom'
import {
  HiOutlineHome,
  HiOutlineClipboardList,
  HiOutlinePlusCircle,
  HiOutlineChatAlt,
  HiOutlineUsers,
  HiOutlineShieldCheck,
  HiOutlineChartBar,
  HiOutlineOfficeBuilding,
  HiOutlineCog,
  HiOutlineBell,
  HiX,
  HiOutlineUserCircle,
} from 'react-icons/hi'
import { usePermission } from '../../hooks/usePermission'
import { useAuthStore } from '../../store/authStore'
import kikioLogo from "../../assets/images/download.png"
const NAV_GROUPS = [
  {
    label: 'OVERVIEW',
    items: [
      { label: 'Dashboard', icon: HiOutlineHome, path: '/dashboard', exact: true, permission: 'view_dashboard' },
    ],
  },
  {
    label: 'INCIDENTS',
    items: [
      { label: 'All Incidents', icon: HiOutlineClipboardList, path: '/dashboard/incidents', permission: 'view_incidents' },
      { label: 'My Incidents', icon: HiOutlineClipboardList, path: '/dashboard/my-incidents', permission: 'view_assigned_incidents' },
      { label: 'Create Incident', icon: HiOutlinePlusCircle, path: '/dashboard/incidents/create', permission: 'create_incident' },
      { label: 'SMS Intake', icon: HiOutlineChatAlt, path: '/dashboard/sms-intake', permission: 'create_sms_incident' },
    ],
  },
  {
    label: 'MANAGEMENT',
    items: [
      { label: 'Users',    icon: HiOutlineUsers,          path: '/dashboard/users',    permission: 'manage_users' },
      { label: 'Roles',    icon: HiOutlineShieldCheck,    path: '/dashboard/roles',    permission: 'manage_roles' },
      { label: 'Agencies', icon: HiOutlineOfficeBuilding, path: '/dashboard/agencies', permission: 'manage_users'   },
      { label: 'Config',   icon: HiOutlineCog,            path: '/dashboard/config',   permission: 'manage_config' },
      { label: 'Public Alerts', icon: HiOutlineBell,       path: '/dashboard/alerts',   permission: 'send_alert'    },
      { label: 'Reports',  icon: HiOutlineChartBar,       path: '/dashboard/reports',  permission: 'view_reports'  },
    ],
  },
]

const ROLE_BADGE = {
  it_admin: { label: 'IT Admin', color: 'bg-violet-500/20 text-violet-300' },
  dispatcher: { label: 'Dispatcher', color: 'bg-blue-500/20 text-blue-300' },
  sms_intake_officer: { label: 'SMS Officer', color: 'bg-amber-500/20 text-amber-300' },
  field_officer: { label: 'Field Officer', color: 'bg-emerald-500/20 text-emerald-300' },
}

export default function Sidebar({ isOpen, onClose }) {
  const { hasPermission } = usePermission()
  const { user } = useAuthStore()

  const initials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const badge = ROLE_BADGE[user?.role]

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-30 h-full w-64 bg-gray-950 flex flex-col transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:z-auto`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-linear-to-br from-green-500 to-emerald-700 flex items-center justify-center shadow-lg shadow-green-900/40">
              <HiOutlineShieldCheck className="text-white text-lg" />
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-tight">Ekiti State</p>
              <p className="text-green-400 text-xs font-medium tracking-wide">Emergency Response</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-gray-500 hover:text-white transition-colors"
          >
            <HiX className="text-xl" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
          {NAV_GROUPS.map((group) => {
            const visible = group.items.filter((item) => hasPermission(item.permission))
            if (!visible.length) return null
            return (
              <div key={group.label}>
                <p className="text-gray-600 text-[10px] font-bold tracking-widest uppercase px-3 mb-1.5">
                  {group.label}
                </p>
                <ul className="space-y-0.5">
                  {visible.map((item) => {
                    const Icon = item.icon
                    return (
                      <li key={item.path}>
                        <NavLink
                          to={item.path}
                          end={item.exact}
                          onClick={onClose}
                          className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150
                            ${isActive
                              ? 'bg-green-600/15 text-green-400 border border-green-600/20'
                              : 'text-gray-500 hover:bg-white/5 hover:text-gray-200 border border-transparent'
                            }`
                          }
                        >
                          {({ isActive }) => (
                            <>
                              <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all
                                ${isActive ? 'bg-green-500/20' : 'bg-white/5'}`}>
                                <Icon className="text-base" />
                              </div>
                              {item.label}
                            </>
                          )}
                        </NavLink>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )
          })}
        </nav>

        {/* System status */}
        <div className="px-4 py-3 border-t border-white/5">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span className="text-xs text-gray-500 font-medium">All systems operational</span>
          </div>
          {/* User card */}
          <NavLink to="/dashboard/profile" onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors ${
                isActive ? 'bg-green-600/15 border border-green-600/20' : 'bg-white/5 hover:bg-white/10 border border-transparent'
              }`
            }
          >
            <div className="w-8 h-8 rounded-full bg-linear-to-br from-green-500 to-emerald-700 flex items-center justify-center text-white text-xs font-bold shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-semibold truncate">{user?.name}</p>
              {badge && (
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${badge.color}`}>
                  {badge.label}
                </span>
              )}
            </div>
            <HiOutlineUserCircle className="text-gray-500 text-lg shrink-0" />
          </NavLink>
        <div className="flex items-center justify-center gap-2 mt-4 text-gray-500 text-xs">
  <img src={kikioLogo} alt="Kikiotolu Logo" className="w-4 h-4 object-contain" />
  <span>Kikiotolu Solutions</span>
</div>
        </div>
      </aside>
    </>
  )
}
