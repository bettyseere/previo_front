import { useAuth } from "../../../utils/hooks/Auth"
import SeereLogo from "./SeereLogo"

export default function DashboardHeader(){
    const { currentUser, handleLogout } = useAuth()
    const is_staff = currentUser?.user_type === "staff"
    return (
        <div className="h-[2rem] rounded-md flex items-center my-2">
            <div className="flex justify-between items-center w-full">
                <div className=" px-2 gap-2 mx-[.9rem]">{is_staff && <SeereLogo stying="" />}</div>
                <div className="flex md:gap-8 lg:gap-12 text-gray-800 mr-5">
                    {is_staff ?<div className="cursor-pointer font-bold text-red-500" onClick={handleLogout}>Logout</div> :
                    <a href="/profile">
                        <div className="flex items-center gap-2 cursor-pointer">
                            <h4 className="rounded-full bg-primary w-6 h-6 flex items-center justify-center text-white font-medium">{currentUser?.first_name[0]}</h4>
                            <h4 className="text-seere-text font-semibold">{currentUser?.first_name}</h4>
                        </div>
                    </a>
                    }
                </div>
            </div>
        </div>
    )
}