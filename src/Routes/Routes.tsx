import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "../components/authentication/Login";
import ProtectedRoutes from "../utils/ProtectedRoutes";
import Home from "../components/Companies/Home";
import Devices from "../components/Devices/Devices";
import ForgotPassword from "../components/authentication/ForgotPassoword";
import ResetPassword from "../components/authentication/ResetPassword";


function AppRoutes() {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/forgot_password" element={ <ForgotPassword />} />
                <Route path="/reset_password" element={ <ResetPassword /> }/>
                <Route element={<ProtectedRoutes />}>
                    <Route path="/" element={<Home />} />
                    <Route path="/devices" element={<Devices />} />
                </Route>
            </Routes>
        </Router>
    );
}

export default AppRoutes;
