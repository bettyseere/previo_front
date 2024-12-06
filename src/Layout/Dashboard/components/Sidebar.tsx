"use client";
import { useAuth } from "../../../utils/hooks/Auth";
import { useLocation } from "react-router-dom";

import {
    FaHouseChimney,
    FaPeopleGroup,
    FaTablet,
    FaPersonBiking,
    FaPerson,
    FaLockOpen
} from "react-icons/fa6";

export default function Sidebar() {
    const { handleLogout, currentUser } = useAuth();
    const location = useLocation(); // Get the current location
    const is_super = currentUser?.user_type == "super"

    const top_nav_items = [
        { name: is_super ?"Companies": "Home", logo: <FaHouseChimney className="text-secondary" size={20} />, link: "/", roles: ["admin", "super", "staff"] },
        { name: "Teams", logo: <FaPeopleGroup className="text-secondary" size={20} />, link: "/teams", roles: ["admin", "super", "staff"] },
        { name: "Exercises", logo: <FaPersonBiking className="text-secondary" size={20} />, link: "/exercises", roles: ["admin", "super", "staff"] },
        { name: is_super ? "Users": "Athletes", logo: <FaPerson className="text-secondary" size={20} />, link: is_super ? "/users": "/athletes", roles: ["admin", "super", "staff"] },
        { name: is_super ? "Device Types": "Devices", logo: <FaTablet className="text-secondary" size={20} />, link: !is_super ? "/devices": "/device_types", roles: ["admin", "super", "staff"] }
    ];

    !is_super && top_nav_items.push({ name: "Staff", logo: <FaTablet className="text-secondary" size={20} />, link: "/staff", roles: ["admin", "super", "staff"] })

    return (
        <div className="h-screen w-[14rem] bg-[#FFF] relative">
            <div className="px-4">
                <div className="">
                    <img
                        className="p-0 -mx-4 mt-2"
                        width={130}
                        src="/images/logo_seere/svg/main_logo_dark.svg"
                        alt="seere logo"
                    />
                </div>
                <div className="flex flex-col gap-8 overflow-hidden max-h-[28rem] mt-12">
                    {top_nav_items.map((item) => {
                        const isActive = location.pathname === item.link;
                        return (
                            <a
                                href={item.link}
                                key={item.name}
                                className={`flex gap-2 items-center cursor-pointer px-2 py-2 rounded-md ${
                                    isActive ? "bg-primary text-white" : "text-seere-text hover:text-tertiary"
                                }`}
                            >
                                <p>{item.logo}</p>
                                <p className="font-semibold">{item.name}</p>
                            </a>
                        );
                    })}
                </div>
                <div className="absolute bottom-6" onClick={handleLogout}>
                    <div className="flex gap-2 items-center cursor-pointer font-semibold text-lg">
                        <p>
                            <FaLockOpen color="#dc2626" />
                        </p>
                        <p className="text-[#dc2626]">Logout</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
