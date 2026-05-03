import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Public pages
import Home from "./pages/Home";
import ReportIncident from "./pages/ReportIncident";
import Login from "./pages/Login";

// Dashboard layout (handles auth guard)
import DashboardLayout from "./components/dashboard/DashboardLayout";

// Dashboard pages
import DashboardHome from "./pages/dashboard/DashboardHome";
import IncidentList from "./pages/dashboard/IncidentList";
import IncidentDetails from "./pages/dashboard/IncidentDetails";
import CreateIncident from "./pages/dashboard/CreateIncident";
import MyIncidents from "./pages/dashboard/MyIncidents";
import SMSIntake from "./pages/dashboard/SMSIntake";
import UserList from "./pages/dashboard/UserList";
import CreateUser from "./pages/dashboard/CreateUser";
import RoleManagement from "./pages/dashboard/RoleManagement";
import AgencyManagement from "./pages/dashboard/AgencyManagement";
import ConfigManagement from "./pages/dashboard/ConfigManagement";
import Reports from "./pages/dashboard/Reports";
import Profile from "./pages/dashboard/Profile";
import AlertManagement from "./pages/dashboard/AlertManagement";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/report" element={<ReportIncident />} />
        <Route path="/login" element={<Login />} />

        {/* Protected dashboard — DashboardLayout redirects to /login if unauthenticated */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardHome />} />
          <Route path="incidents" element={<IncidentList />} />
          <Route path="incidents/create" element={<CreateIncident />} />
          <Route path="incidents/:id" element={<IncidentDetails />} />
          <Route path="my-incidents" element={<MyIncidents />} />
          <Route path="sms-intake" element={<SMSIntake />} />
          <Route path="users" element={<UserList />} />
          <Route path="users/create" element={<CreateUser />} />
          <Route path="roles" element={<RoleManagement />} />
          <Route path="agencies" element={<AgencyManagement />} />
          <Route path="config"   element={<ConfigManagement />} />
          <Route path="reports" element={<Reports />} />
          <Route path="alerts" element={<AlertManagement />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
