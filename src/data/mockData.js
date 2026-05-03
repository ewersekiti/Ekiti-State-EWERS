export const AGENCIES = [
  'Nigeria Police Force',
  'Nigeria Fire Service',
  'Nigeria Civil Defence Corps',
  'Federal Road Safety Corps',
  'Nigerian Army',
  'Nigerian Navy',
  'Emergency Management Agency',
  'Communication Centre',
  'Ekiti State Government',
]

export const ROLES_LIST = [
  { id: 1, name: 'IT Admin', slug: 'it_admin', description: 'Full system access: users, roles, reports, incident management.', permissions: ['view_dashboard', 'view_incidents', 'assign_incident', 'update_incident', 'delete_incident', 'manage_users', 'manage_roles', 'view_reports', 'send_alert'] },
  { id: 2, name: 'Dispatcher', slug: 'dispatcher', description: 'Assigns and manages incidents across field agencies.', permissions: ['view_dashboard', 'view_incidents', 'assign_incident', 'update_incident'] },
  { id: 3, name: 'SMS Intake Officer', slug: 'sms_intake_officer', description: 'Processes incoming SMS incident reports.', permissions: ['view_dashboard', 'create_sms_incident'] },
  { id: 4, name: 'Field Officer', slug: 'field_officer', description: 'Handles assigned incidents in the field.', permissions: ['view_dashboard', 'view_assigned_incidents'] },
]

export const ALL_PERMISSIONS = [
  { key: 'view_dashboard', label: 'View Dashboard' },
  { key: 'view_incidents', label: 'View All Incidents' },
  { key: 'view_assigned_incidents', label: 'View Assigned Incidents' },
  { key: 'create_incident', label: 'Create Incident' },
  { key: 'create_sms_incident', label: 'Create SMS Incident' },
  { key: 'assign_incident', label: 'Assign Incident' },
  { key: 'update_incident', label: 'Update Incident Status' },
  { key: 'delete_incident', label: 'Delete Incident' },
  { key: 'manage_users', label: 'Manage Users' },
  { key: 'manage_roles', label: 'Manage Roles' },
  { key: 'view_reports', label: 'View Reports' },
]
