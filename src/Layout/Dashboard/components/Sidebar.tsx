"use client";
import { useAuth } from "../../../utils/hooks/Auth";
import { useLocation } from "react-router-dom";
import SeereLogo from "./SeereLogo";
import { TbSend } from "react-icons/tb";
import { TbRuler } from "react-icons/tb";

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
    const is_admin = currentUser?.user_type == "admin"

    const top_nav_items = [
        { name: is_super ?"Companies": "Home", logo: <FaHouseChimney className="text-secondary" size={20} />, link: "/", roles: ["admin", "super", "staff"] },
        { name: is_super ? "Users": "Athletes", logo: <FaPerson className="text-secondary" size={20} />, link: is_super ? "/users": "/athletes", roles: ["admin", "super", "staff"] },
        { name: is_super ? "Device Types": "Devices", logo: <FaTablet className="text-secondary" size={20} />, link: !is_super ? "/devices": "/device_types", roles: ["admin", "super", "staff"] },
    ];
    is_admin && top_nav_items.push({ name: "Invites", logo: <TbSend className="text-secondary" size={20} />, link: "/invites", roles: ["admin"]})
    is_admin && top_nav_items.push({ name: "Teams", logo: <FaPeopleGroup className="text-secondary" size={20} />, link: "/teams", roles: ["admin", "super", "staff"] })
    is_super && top_nav_items.push({name: "Roles", logo: <FaPeopleGroup className="text-secondary" size={20} />, link: "/roles", roles: ["super"]})
    is_admin && top_nav_items.push({name: "Measurements", logo: <TbRuler className="text-secondary" size={20} />, link: "/measurements", roles: ["admin"]})
    is_super && top_nav_items.push({name: "Attributes", logo: <TbRuler className="text-secondary" size={20} />, link: "/attributes", roles: ["super"]})
    is_super && top_nav_items.push({ name: "Activities", logo: <FaPersonBiking className="text-secondary" size={20} />, link: "/activities", roles: ["admin", "super", "staff"] })

    return (
        <div className="h-screen w-[14rem] bg-[#FFF] relative">
            <div className="px-4 flex flex-col items-center">
                <a href="/"><SeereLogo /></a>
                <div className="flex flex-col gap-8 overflow-hidden max-h-[28rem] mt-12">
                    {top_nav_items.map((item) => {
                        const isActive = location.pathname === item.link;
                        return (
                            <a
                                href={item.link}
                                key={item.name}
                                className={`flex gap-2 items-center cursor-pointer px-2 py-2 rounded-md ${
                                    isActive ? "bg-primary text-white" : "text-seere-text hover:text-secondary"
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
