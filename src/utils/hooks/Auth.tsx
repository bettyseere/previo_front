import { User, Tokens, Login } from "../../types/Auth";
import { createContext, PropsWithChildren, useContext, useState, useEffect } from "react";
import { login, logout, user_info } from "../../api/authentication";
import { toast } from "react-toastify";


type AuthContext = {
    tokens?: Tokens | null;
    currentUser?: User | null;
    handleLogin?: (data: Login) => Promise<void>;
    handleLogout?: () => Promise<void>;
    loading?: boolean;
    language?: string | null;
    handleLanguage?: (lang: string) => Promise<void>;
};

const AuthContext = createContext<AuthContext | undefined>(undefined);
type AuthProviderProps = PropsWithChildren;

export default function AuthProvider({ children }: AuthProviderProps) {
    const [tokens, setTokens] = useState<Tokens | null>(null);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [language, setLanguage] = useState<string | null>("en")

    // On initial load, check localStorage for existing auth data
    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        const storedTokens = localStorage.getItem("tokens");
        let storedLanguage = localStorage.getItem("language")

        if (storedUser && storedTokens) {
            // If user and tokens exist in localStorage, restore the state
            setCurrentUser(JSON.parse(storedUser));
            setTokens(JSON.parse(storedTokens));
        }
        setLoading(false);

        setLanguage(storedLanguage ? storedLanguage: "en")
    }, []); // Only run once when the component mounts

    async function handleLanguage(lang: string){
        localStorage.setItem("language", lang)
        setLanguage(lang)
    }
    async function handleLogin(data: Login) {
        try {
            const response = await login(data)
            const tokens = {access_token: response.access_token, refresh_token: response.refresh_token};
            localStorage.setItem("tokens", JSON.stringify(tokens));

            try {
                const user_info_response = await user_info()
                let has_permission = false;

                for (const team of user_info_response.teams || []) {
                    if (team.role) {
                        has_permission = true;
                        break;
                    }
                }
                const user = {
                    id: response.user.id,
                    first_name: response.user.first_name,
                    last_name: response.user.last_name,
                    email: response.user.email,
                    user_type: response.user.user_type,
                    company: response.user.company,
                    country: user_info_response.country,
                    city: user_info_response.city,
                    address: user_info_response.address,
                    teams: user_info_response.teams,
                    devices: user_info_response.devices,
                    has_permission: has_permission
                };

                localStorage.setItem("user", JSON.stringify(user));

                // Update the state with the logged-in user and tokens
                setCurrentUser(user);
                return user
            } catch (error) {
                if (error){
                    toast(error.data.detail)
                } else {
                    toast("Error fetch user inf")
                }
            }

            // Store user and tokens in localStorage
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
        <AuthContext.Provider value={{ handleLogin, handleLogout, currentUser, tokens, loading, language, handleLanguage }}>
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
