"use client"
import { useAuth } from "../../../utils/hooks/Auth";

import {
    FaHouseChimney,
    FaPeopleGroup,
    FaTablet,
    FaPersonBiking,
    FaPerson,
    FaLockOpen
} from "react-icons/fa6";


export default function Sidebar() {
    const {handleLogout} = useAuth()
    const top_nav_items = [
        { name: "Companies", logo: <FaHouseChimney color="#374151" size={20} />, link: "/", roles: ["admin", "super", "staff"] },
        { name: "Teams", logo:  <FaPeopleGroup color="#374151" size={20} />, link: "/levels", roles: ["admin", "super", "staff"] },
        { name: "Exercises", logo: <FaPersonBiking color="#374151" size={20} />, link: "/buckets", roles: ["admin", "super", "staff"] },
        { name: "Users", logo: <FaPerson color="#374151" size={20} />, link: "/buckets", roles: ["admin", "super", "staff"] },
        { name: "Devices", logo: <FaTablet color="#374151" size={20} />, link: "/devices", roles: ["admin", "super", "staff"] }
    ];


    return (
        <div className="h-screen w-[14rem] bg-[#FFF] relative">
            <div className="px-4">
                <div className="">
                    <div className="">
                        <img className="p-0 -mx-4 mt-2" width={130} src="/images/logo_seere/svg/main_logo_dark.svg" alt="seere logo" />
                    </div>
                    <div className="flex flex-col gap-8 overflow-hidden max-h-[24rem] mt-12">
                        {top_nav_items.map((item) => (
                            <a href={item.link} key={item.name}>
                                <div key={item.name} className="flex gap-2 items-center cursor-pointer">
                                    <p className="">{item.logo}</p>
                                    <p className="font-semibold text-seere-text hover:text-secondary">{item.name}</p>
                                </div>
                            </a>
                        ))}
                    </div>
                </div>

                <div className="absolute bottom-6" onClick={handleLogout}>
                    <div className="flex gap-2 items-center cursor-pointer font-semibold text-lg">
                        <p className=""><FaLockOpen color="#dc2626" /></p>
                        <p className="text-[#dc2626]">Logout</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
