import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "./hooks/Auth";
// import ErrorLoading from "../components/Commons/ErrorAndLoading";
import Layout from "../Layout/Dashboard/Layout";

const ProtectedRoutes = () => {
    const { currentUser, loading } = useAuth();


    if (loading) {

        return <Layout><div className="text-secondary p-4 font-semibold text-xl"><p className="hidden">Loading...</p></div>;</Layout>
    }

    console.log("Protected routes being called")

    if (!currentUser) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
}

export default ProtectedRoutes;
