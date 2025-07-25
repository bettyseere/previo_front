import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import ProtectedRoutes from "../utils/ProtectedRoutes";
import { useAuth } from "../utils/hooks/Auth";

import Login from "../components/authentication/Login";
import Home from "../components/Companies/Home";
import UserTeamLayout from "../components/Users/UserInfo/Teams/Layout";
import Users from "../components/Users/Users";
// import Devices from "../components/Devices/Devices";
import ForgotPassword from "../components/authentication/ForgotPassoword";
import ResetPassword from "../components/authentication/ResetPassword";
import Activities from "../components/Activities/Activities";
import UserTeams from "../components/Users/UserInfo/Teams/Teams";
import CompanyOverview from "../components/Companies/Overview/Overview";
import Athletes from "../components/Companies/Athletes/Athletes";
import CompanyDevices from "../components/Companies/Devices/Devices";
import CompanyTeams from "../components/Companies/Teams/Teams";
import CreateAccount from "../components/authentication/CreateAccount";
import Device_Types from "../components/DeviceTypes/DeviceTypes";
import DeviceTypeDevices from "../components/DeviceTypes/Devices/Devices";
import DeviceActivities from "../components/DeviceTypes/DeviceActivites/DeviceActivities";
// import UserInfo from "../components/Users/UserInfo/UserInfo";
import SubActivities from "../components/Activities/SubActivities/SubActivites";
import MeasurementAttributes from "../components/Measurements/Attributes/Attributes";
import Measurements from "../components/Measurements/Measurements";
import Results from "../components/Measurements/Results/Results";
import ActivityAttributes from "../components/Activities/SubActivities/Attributes/ActivityAttributes";
import Roles from "../components/Roles/Roles";
import TeamMembers from "../components/Companies/Teams/TeamMembers/TeamMembers";
// import UserDevices from "../components/Users/UserInfo/Devices/Devices";
import UserReports from "../components/Users/UserInfo/Reports/Reports";
import UserTeamMembers from "../components/Users/UserInfo/Teams/Members/TeamMembers";
import UserTeamRecords from "../components/Users/UserInfo/Teams/Reports/TeamRecords";

// Import all your components here (same as before)
import DeviceAttributes from "../components/DeviceTypes/DeviceAttributes/DeviceAttributes";

function AppRoutes() {
    const { currentUser } = useAuth();
    const is_admin = currentUser?.user_type === "admin";
    const is_staff = currentUser?.user_type === "staff";
    const is_super = currentUser?.user_type === "super";
    const has_permission = currentUser?.has_permission;

    return (
        <Router>
            <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/forgot_password" element={<ForgotPassword />} />
                <Route path="/reset_password" element={<ResetPassword />} />
                <Route path="/create_account" element={<CreateAccount />} />

                {/* Protected Routes */}
                <Route element={<ProtectedRoutes />}>
                    {/* Common Routes for All Authenticated Users */}
                    <Route path="/" element={
                        is_admin ? <CompanyOverview /> :
                        is_staff ? <UserReports /> : <Home />
                    } />

                    <Route path="/profile" element={<UserReports />} />

                    {/* Staff User Routes */}
                    {is_staff && has_permission && (
                        <Route path="/teams" element={<UserTeamLayout />}>
                            <Route index element={<UserTeams />} />
                            <Route path=":id" element={<UserTeamMembers />} />
                            <Route path=":id/records" element={<UserTeamRecords />} />
                        </Route>
                    )}

                    {/* Admin User Routes */}
                    {is_admin && (
                        <>
                            <Route path="/measurements">
                                <Route index element={<Measurements />} />
                                <Route path=":id" element={<Results />} />
                            </Route>

                            <Route path="/">
                                <Route index element={<CompanyOverview />} />
                                <Route path="athletes" element={<Athletes />} />
                                <Route path="devices" element={<CompanyDevices />} />
                                <Route path="teams">
                                    <Route index element={<CompanyTeams />} />
                                    <Route path=":id/team_members" element={<TeamMembers />} />
                                </Route>
                            </Route>
                        </>
                    )}

                    {/* Super Admin Routes */}
                    {is_super && (
                        <>
                            <Route path="/activities">
                                <Route index element={<Activities />} />
                                <Route path=":id" element={<SubActivities />} />
                                <Route path=":id/attributes" element={<ActivityAttributes />} />
                            </Route>

                            <Route path="/device_types">
                                <Route index element={<Device_Types />} />
                                <Route path=":id" element={<DeviceTypeDevices />} />
                                <Route path=":id/activities" element={<DeviceActivities />} />
                                <Route path=":id/attributes" element={<DeviceAttributes />} />
                            </Route>

                            <Route path="/:id">
                                <Route path="devices" element={<CompanyDevices />} />
                            </Route>

                            <Route path="/attributes" element={<MeasurementAttributes />} />
                            <Route path="/users" element={<Users />} />
                            <Route path="/roles" element={<Roles />} />
                        </>
                    )}

                    {/* Common Device Type Routes */}
                    <Route path="/device_types/:id">
                        <Route index element={<DeviceTypeDevices />} />
                        <Route path="activities" element={<DeviceActivities />} />
                    </Route>

                    {/* Fallback Route */}
                    <Route path="*" element={<div>Page not found</div>} />
                </Route>
            </Routes>
        </Router>
    );
}

export default AppRoutes;