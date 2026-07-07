import { User, Tokens, Login } from "../../types/Auth";
import { createContext, PropsWithChildren, useContext, useState, useEffect } from "react";
import { login, logout, user_info } from "../../api/authentication";
import { get_user_teams } from "../../api/team_members";
import { TeamMember } from "../../api/user_tems";
import { toast } from "react-toastify";

type AuthContext = {
    tokens?: Tokens | null;
    currentUser?: User | null;
    handleLogin?: (data: Login) => Promise<void>;
    handleLogout?: () => Promise<void>;
    updateCurrentUser?: (userData: Partial<User> | User | null) => void; // Add this
    loading?: boolean;
    language?: string | null;
    handleLanguage?: (lang: string) => Promise<void>;
    setAdminView?: (asAdmin: boolean) => void;
};

const AuthContext = createContext<AuthContext | undefined>(undefined);
type AuthProviderProps = PropsWithChildren;

export default function AuthProvider({ children }: AuthProviderProps) {
    const [tokens, setTokens] = useState<Tokens | null>(null);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [userTeams, setUserTeams] = useState<TeamMember[]>([]);
    const [hasPermissions, setHasPermissions] = useState(false);
    const [loading, setLoading] = useState(true);
    const [language, setLanguage] = useState<string | null>("en")

    // Function to update currentUser
    const updateCurrentUser = (userData: Partial<User> | User | null) => {
        if (userData === null) {
            // Clear user
            setCurrentUser(null);
            localStorage.removeItem("user");
        } else if (currentUser) {
            // Merge with existing user data
            const updatedUser = { ...currentUser, ...userData };
            setCurrentUser(updatedUser);
            localStorage.setItem("user", JSON.stringify(updatedUser));
        } else {
            // Set new user
            setCurrentUser(userData as User);
            localStorage.setItem("user", JSON.stringify(userData));
        }
    };

    // On initial load, check localStorage for existing auth data
    useEffect(() => {
        async function initialize() {
            const storedUser = localStorage.getItem("user");
            const storedTokens = localStorage.getItem("tokens");
            const storedLanguage = localStorage.getItem("language");
            const admin_view = localStorage.getItem("admin_view");
            const admin_check = localStorage.getItem("admin_check");

            if (storedUser && storedTokens) {
                const user = {
                    ...JSON.parse(storedUser),
                    admin_view: admin_view === "true",
                    admin_check: admin_check === "true",
                };

                setCurrentUser(user);
                setTokens(JSON.parse(storedTokens));

                // wait until permissions are synchronized
                await handleUserTeams();
            }

            setLanguage(storedLanguage ?? "en");
            setLoading(false);
        }

        initialize();
    }, []); // Only run once when the component mounts

    async function handleLanguage(lang: string){
        localStorage.setItem("language", lang)
        setLanguage(lang)
    }

    // useEffect(() => {
    //     if (currentUser && tokens) {
    //         handleUserTeams();
    //     }
    // }, [currentUser?.id]);

    const TEAM_CACHE_KEY = "user_teams";
    const TEAM_CACHE_EXPIRY_KEY = "user_teams_expiry";
    const SIX_HOURS = 1000 * 60 * 60 * 6;

    async function handleUserTeams(forceRefresh = false) {
        try {
            let teams: TeamMember[];

            const cachedTeams = localStorage.getItem(TEAM_CACHE_KEY);
            const cacheExpiry = localStorage.getItem(TEAM_CACHE_EXPIRY_KEY);

            if (
                !forceRefresh &&
                cachedTeams &&
                cacheExpiry &&
                Date.now() < Number(cacheExpiry)
            ) {
                teams = JSON.parse(cachedTeams);
            } else {
                teams = await get_user_teams();

                localStorage.setItem(
                    TEAM_CACHE_KEY,
                    JSON.stringify(teams)
                );

                localStorage.setItem(
                    TEAM_CACHE_EXPIRY_KEY,
                    String(Date.now() + SIX_HOURS)
                );
            }

            const hasPermission = teams.some(team => team.role !== null);

            setCurrentUser(prev => {
                if (!prev) return prev;

                const updatedUser = {
                    ...prev,
                    teams,
                    has_permission: hasPermission,
                };

                localStorage.setItem("user", JSON.stringify(updatedUser));

                return updatedUser;
            });

            return teams;
        } catch (error) {
            console.error(error);

            setCurrentUser(prev => {
                if (!prev) return prev;

                const updatedUser = {
                    ...prev,
                    teams: [],
                    has_permission: false,
                };

                localStorage.setItem("user", JSON.stringify(updatedUser));

                return updatedUser;
            });

            return [];
        }
    }

    function setAdminView(asAdmin: boolean) {
        setCurrentUser(prev => {
            if (!prev) return prev;

            const updatedUser = {
                ...prev,
                admin_view: asAdmin,
                admin_check: true,
            };

            localStorage.setItem("user", JSON.stringify(updatedUser));
            localStorage.setItem("admin_view", String(asAdmin));
            localStorage.setItem("admin_check", "true");

            return updatedUser;
        });
    }

    async function handleLogin(data: Login) {
        try {
            const response = await login(data)
            const tokens = {access_token: response.access_token, refresh_token: response.refresh_token};
            localStorage.setItem("tokens", JSON.stringify(tokens));

            try {
                const user_info_response = await user_info()

                // for (const team of user_info_response.teams || []) {
                //     if (team.role) {
                //         has_permission = true;
                //         break;
                //     }
                // }
                const user = {
                    id: response.user.id,
                    first_name: response.user.first_name,
                    last_name: response.user.last_name,
                    email: response.user.email,
                    user_type: response.user.user_type,
                    company: response.user.company,
                    country: user_info_response.country,
                    height: user_info_response.height,
                    gender: user_info_response.gender,
                    birth_date: user_info_response.birth_date,
                    weight: user_info_response.weight,
                    city: user_info_response.city,
                    address: user_info_response.address,
                    // teams: user_info_response.teams,
                    devices: user_info_response.devices,
                    // has_permission: has_permission 
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
            localStorage.removeItem("admin_view")
            localStorage.clear()
        } catch(error) {
            setCurrentUser(null);
            setTokens(null);
            localStorage.removeItem("user");
            localStorage.removeItem("admin_view")
            localStorage.removeItem("tokens");
            localStorage.clear()
        }
    }

    return (
        <AuthContext.Provider value={{ 
            handleLogin, 
            handleLogout, 
            currentUser, 
            tokens, 
            loading, 
            language, 
            handleLanguage,
            setAdminView,
            updateCurrentUser // Add to context value
        }}>
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