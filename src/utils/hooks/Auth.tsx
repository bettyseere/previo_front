import { User, Tokens, Login } from "../../types/Auth";
import { createContext, PropsWithChildren, useContext, useState, useEffect } from "react";
import { login, logout } from "../../api/authentication";
import { AxiosError } from "axios";
import { toast } from "react-toastify";


type AuthContext = {
    tokens?: Tokens | null;
    currentUser?: User | null;
    handleLogin?: (data: Login) => Promise<void>;
    handleLogout?: () => Promise<void>;
    loading?: boolean;
};

const AuthContext = createContext<AuthContext | undefined>(undefined);
type AuthProviderProps = PropsWithChildren;

export default function AuthProvider({ children }: AuthProviderProps) {
    const [tokens, setTokens] = useState<Tokens | null>(null);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // On initial load, check localStorage for existing auth data
    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        const storedTokens = localStorage.getItem("tokens");

        if (storedUser && storedTokens) {
            // If user and tokens exist in localStorage, restore the state
            setCurrentUser(JSON.parse(storedUser));
            setTokens(JSON.parse(storedTokens));
        }
        setLoading(false);
    }, []); // Only run once when the component mounts


    async function handleLogin(data: Login) {
        try {
            const response = await login(data)
            const user = {
                id: response.user.id,
                first_name: response.user.first_name,
                last_name: response.user.last_name,
                email: response.user.email,
                user_type: response.user.user_type
            };
            const tokens = {access_token: response.access_token, refresh_token: response.refresh_token};

            // Store user and tokens in localStorage
            localStorage.setItem("user", JSON.stringify(user));
            localStorage.setItem("tokens", JSON.stringify(tokens));

            // Update the state with the logged-in user and tokens
            setCurrentUser(user);
            setTokens(tokens);
        } catch (error) {
            // toast("Incorrect email or password.")
            if (error?.response.status == 401){
                toast(error.data.detail)
            } else {
                toast("There was a problem logging into your account.")
            }
            setCurrentUser(null);
            setTokens(null);
        }
    }

    async function handleLogout() {
        // Clear auth data from state
        try{
            await logout()
            setCurrentUser(null);
            setTokens(null);
            localStorage.removeItem("user");
            localStorage.removeItem("tokens");
        } catch(error) {
            setCurrentUser(null);
            setTokens(null);
            localStorage.removeItem("user");
            localStorage.removeItem("tokens");
        }
    }

    return (
        <AuthContext.Provider value={{ handleLogin, handleLogout, currentUser, tokens, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (context === undefined) {
        throw new Error("useAuth must be used inside of AuthProvider");
    }

    return context;
}
