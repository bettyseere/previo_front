import Sidebar from "./components/Sidebar";
import DashboardHeader from "./components/Header";
import Board from "./components/Board";

interface LayoutProps {
    children: React.ReactNode;
}



export default function Layout({children}: LayoutProps) {
    return (
            <div className="flex gap-4 bg-[#F5F5F5] w-full font-jarkata">
                <Sidebar />
                <div className="w-full h-[screen-4]
                 relative max-w-[1800px]">
                    <DashboardHeader />
                    <Board>
                        {children}
                    </Board>
                </div>
            </div>
    );
}
