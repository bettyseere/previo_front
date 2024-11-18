import AuthProvider from "./utils/hooks/Auth";
import { RouterProvider } from "react-router-dom";
// import { routes } from "./Routes/Routes"; // Adjusted to use the updated routes
import AppRoutes from "./Routes/Routes";

function App() {
    return (
        <AuthProvider>
            <AppRoutes />
        </AuthProvider>
    );
}

export default App;
