import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "./hooks/Auth";

const ProtectedRoutes = () => {
    const { currentUser, loading } = useAuth();


    if (loading) {
        return <div>Loading...</div>;
    }

    if (!currentUser) {
        return <Navigate to="/login" />;
    }

    return <Outlet />;
}

export default ProtectedRoutes;
