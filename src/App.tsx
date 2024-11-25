import AuthProvider from "./utils/hooks/Auth";
import { PopupContextProvider } from "./utils/hooks/usePopUp";
import AppRoutes from "./Routes/Routes";

function App() {
    return (
        <PopupContextProvider>
            <AuthProvider>
                <AppRoutes />
            </AuthProvider>
        </PopupContextProvider>
    );
}

export default App;
