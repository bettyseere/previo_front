"use client";
import { useAuth } from "../../../utils/hooks/Auth";
import { useLocation } from "react-router-dom";

import {
    FaLockOpen
} from "react-icons/fa6";

export default function StaffSideBar() {
    const { handleLogout, currentUser } = useAuth();
    const location = useLocation(); // Get the current location
    const is_staff = currentUser?.user_type === "staff"


    return (
        <div className="h-screen w-[1rem] bg-[#FFF] relative">
            <div className="px-4">
                <div className="">
                    <img
                        className="p-0 -mx-4 mt-2"
                        width={130}
                        src="/images/logo_seere/png/previo.png"
                        alt="seere logo"
                    />
                </div>

                {is_staff && <div className="absolute bottom-6" onClick={handleLogout}>
                    <div className="flex gap-2 items-center cursor-pointer font-semibold text-lg">
                        <p>
                            <FaLockOpen color="#dc2626" />
                        </p>
                        <p className="text-[#dc2626]">Logout</p>
                    </div>
                </div>}
            </div>
        </div>
    );
}
