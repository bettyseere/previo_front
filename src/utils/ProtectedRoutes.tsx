import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "./hooks/Auth";

const ProtectedRoutes = () => {
    const { currentUser, loading } = useAuth();


    if (loading) {
        return <div className="text-secondary p-4 font-semibold text-xl">Loading...</div>;
    }

    console.log("Protected routes being called")

    if (!currentUser) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
}

export default ProtectedRoutes;
