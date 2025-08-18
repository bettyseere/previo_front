import DashboardHeader from "./components/Header";
import Board from "./components/Board";
import { useAuth } from "../../utils/hooks/Auth";
import Layout from "./Layout";

interface LayoutProps {
    children: React.ReactNode;
}


export default function StaffLayout({children}: LayoutProps) {
    const { currentUser } = useAuth();
    const is_staff = currentUser?.user_type === "staff"
    return (
            currentUser && (is_staff ? <div className="flex gap-4 bg-[#F5F5F5] w-full font-jarkata">
                <div className="w-full h-screen bg-gray-100 relative max-w-[1600px]">
                    <DashboardHeader />
                    <div className="ml-4">
                        <Board>
                            {children}
                        </Board>
                    </div>
                </div>
            </div>:
            <Layout>
                {children}
            </Layout>)
    );
}
