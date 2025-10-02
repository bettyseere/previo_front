import Sidebar from "./components/Sidebar";
import DashboardHeader from "./components/Header";
import Board from "./components/Board";
import { useAuth } from "../../utils/hooks/Auth";

interface LayoutProps {
    children: React.ReactNode;
}



export default function Layout({children}: LayoutProps) {
    const {currentUser} = useAuth()
    const admin_view = currentUser?.admin_view
    const is_admin = currentUser?.user_type === "admin"
    return (
            <div className="flex gap-4 bg-[#F5F5F5] w-full font-jarkata">
                {is_admin ? (admin_view && <Sidebar />): <Sidebar />}
                <div className="w-full h-[screen-4] relative max-w-[1800px]">
                    <DashboardHeader />
                    <Board>
                        {children}
                    </Board>
                </div>
            </div>
    );
}
