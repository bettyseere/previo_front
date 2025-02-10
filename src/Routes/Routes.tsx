import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "../components/authentication/Login";
import ProtectedRoutes from "../utils/ProtectedRoutes";
import Home from "../components/Companies/Home";
import UserTeamLayout from "../components/Users/UserInfo/Teams/Layout";
// import Devices from "../components/Devices/Devices";
import ForgotPassword from "../components/authentication/ForgotPassoword";
import ResetPassword from "../components/authentication/ResetPassword";
import Activities from "../components/Activities/Activities";
import Users from "../components/Users/Users";
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
import { useAuth } from "../utils/hooks/Auth";
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
import { Navigate } from "react-router-dom";


function AppRoutes() {
    const {currentUser} = useAuth()
    const is_admin = currentUser?.user_type === "admin"
    const is_staff = currentUser?.user_type === "staff"
    const is_super = currentUser?.user_type === "super"
    let has_permission =  currentUser?.has_permission;


    return (
        <Router>
            <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/forgot_password" element={<ForgotPassword />} />
                <Route path="/reset_password" element={<ResetPassword />} />
                <Route path="/create_account" element={<CreateAccount />} />
                <Route path="*" element={<Navigate to="/login" replace />} />

                {/* Protected Routes */}
                {<Route element={<ProtectedRoutes />}>
                    <Route
                        path="/"
                        element={
                            !is_staff ? (is_admin ? <CompanyOverview /> : <Home />) : <UserReports />
                        }
                    />
                    {is_staff && has_permission && <Route path="/teams" element={<UserTeams />} />} {/* If user is not only athlete they see teams*/}
                    {!is_staff && <Route path="/profile" element={<UserReports />} />}
                    {!is_staff && has_permission && <Route path="/profile/teams" element={<UserTeams />} />}
                    {!is_staff && has_permission && <Route path="profile/teams/:id">
                        <Route path={""} element={<UserTeamMembers />}/>
                        <Route path={"records"} element={<UserTeamRecords />} />
                    </Route>}

                    {is_admin && <Route path="/measurements" element={<Measurements />} />}
                    {is_admin && <Route path="/measurements/:id">
                        <Route path="" element={<Results />} />
                    </Route>}
                    {is_super && <Route path="/attributes" element={<MeasurementAttributes />} />}
                    {is_super && <Route path="/device_types" element={<Device_Types />} />}
                    <Route path="/device_types/:id" >
                        <Route path="" element = {<DeviceTypeDevices />} />
                        <Route path="activities" element={<DeviceActivities />} />
                    </Route>

                    {is_super && <Route path="/activities" element={<Activities />} />}
                    {is_super && <Route path="/activities/:id">
                        <Route path="" element = {<SubActivities />} />
                        <Route path="attributes" element = {<ActivityAttributes />} />
                    </Route>}
                    {!is_admin && <Route path="/users" element={!is_admin ? <Users />: <Athletes />} />}
                    {is_admin && <Route path="/athletes" element={<Athletes />} />}
                    {!is_super && <Route path="/teams" element={!is_admin ? <UserTeams />: <CompanyTeams />} />}
                    {is_super && <Route path="/roles" element={<Roles />} />}


                    {!is_super && <Route path="teams/:id" element={<UserTeamLayout />}>
                        {is_admin ? <Route path="team_members" element={<TeamMembers />} />: has_permission && <Route path={""} element={<UserTeamMembers />}/>}
                        {is_staff && <Route path={"records"} element={<UserTeamRecords />} />}
                    </Route>}

                    <Route path={!is_admin ? "/:id": "/"}>
                        <Route path="" element={<CompanyOverview />} />
                        {/* <Route path="staff" element={<Staff />} /> */}
                        <Route path="athletes" element={<Athletes />} />
                        <Route path="devices" element={<CompanyDevices />} />
                        <Route path="teams" element={<CompanyTeams />}/>
                    </Route>
                </Route>}
            </Routes>
        </Router>
    );
}

export default AppRoutes;
