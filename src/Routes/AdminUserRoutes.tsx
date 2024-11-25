import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import ProtectedRoutes from "../utils/ProtectedRoutes";
import Home from "../components/Companies/Home";
import Devices from "../components/Devices/Devices";
import Exercises from "../components/Exercises/Exercises";
import Users from "../components/Users/Users";
import Teams from "../components/Teams/Teams";
import CompanyOverview from "../components/Companies/Overview/Overview";
import Staff from "../components/Companies/Staff/Staff";
import Athletes from "../components/Companies/Athletes/Athletes";
import CompanyDevices from "../components/Companies/Devices/Devices";
import CompanyTeams from "../components/Companies/Teams/Teams";


function AdminUserRoutes() {
    return (
        // <Router>
            <Routes>
                {/* Protected Routes */}
                <Route element={<ProtectedRoutes />}>
                    {/* Dynamic Routes for Company */}
                    <Route path="/">
                        <Route path="" element={<CompanyOverview />} />
                        <Route path="staff" element={<Staff />} />
                        <Route path="athletes" element={<Athletes />} />
                        <Route path="devices" element={<CompanyDevices />} />
                        <Route path="teams" element={<CompanyTeams />}/>
                    </Route>
                </Route>
            </Routes>
        // </Router>
    );
}

export default AdminUserRoutes;
