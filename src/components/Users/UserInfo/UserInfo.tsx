import React from "react"
import StaffLayout from "../../../Layout/Dashboard/StaffLayout"
import { useAuth } from "../../../utils/hooks/Auth"
import { RxAvatar } from "react-icons/rx"
import Button from "../../Commons/Button"
import { usePopup } from "../../../utils/hooks/usePopUp"
import ChangePassword from "./ChangePasswordForm";
import EditInfo from "./EditInfoForm"
import { useState } from "react";
import Popup from "../../Commons/Popup"
import { useApiGet } from "../../../utils/hooks/query"
import { user_info } from "../../../api/authentication"
import { Link } from "react-router-dom"
import { Outlet } from "react-router-dom"

type NavItem = {
    name: string
    path: string
}

interface Props {
    children?: React.ReactNode;
    nav_items?: [NavItem]
}


export default function UserInfo({children, nav_items}: Props){
    const {currentUser} = useAuth()
    const {hidePopup, handleHidePopup} = usePopup()
    const is_staff = currentUser?.user_type === "staff"
    const [popupType, setPopupType] = useState("edit_info")
    const current_location = window.location.pathname;
    // console.log(current_location)
    const has_permission = currentUser?.has_permission


    const default_nav = has_permission ? [
        {name: "Reports", path: is_staff ? "/": "/profile"},
        {name: "Teams", path: is_staff ? "/teams": "/profile/teams"},
    ]: []

    const nav_to_use = !nav_items ? default_nav : nav_items


    const {data, isLoading, isFetching, isPending, isError, isLoadingError} = useApiGet(["current_user"], user_info)

    if (isLoading || isFetching || isPending) {
        return (
            <StaffLayout>
                <div  className="text-2xl font-bold text-secondary">Fetching user info ...</div>
            </StaffLayout>
        )
    }

    if (isError || isLoadingError){
        return (
            <StaffLayout>
                <div  className="text-2xl font-bold text-red-400">{"Error fetching user info"}</div>
            </StaffLayout>
            )
        }

    const handle_edit_info = () => {
        setPopupType("edit_info")
        handleHidePopup({show: true, type: "edit", data: {base: true}})
    }

    const handle_change_password = () =>  {
        setPopupType("change_password")
        handleHidePopup({show: true, type: "edit", data: {base: true}})
    }

    const popup = <Popup>{popupType === "edit_info" ?
        <EditInfo
            first_name={data.first_name}
            last_name={data.last_name}
            city={data.city && data.city}
            country={data.country && data.country}
            address={data.address && data.address}
        />: <ChangePassword />}</Popup>

    return (
        <StaffLayout>
            {hidePopup.show && hidePopup.data.base && popup}
            <div className="flex gap-4 p-4">
                <div className="h-[calc(100vh-6rem)] bg-gray-200 p-4 relative">
                    <div className="flex items-center gap-4 border-b border-gray-500 py-8 mb-6">
                        <div className="h-[6rem] w-[6rem] bg-gray-400 flex items-center justify-center"><RxAvatar size={78} color="white" /></div>
                        <div className="font-semibold text-lg">{data?.first_name} {currentUser?.last_name}</div>
                    </div>
                    <div className="flex flex-col gap-4">
                        <div>
                            <h5 className="font-semibold mb-1 text-secondary">Email</h5>
                            <p className="text-sm">{data?.email}</p>
                        </div>

                        <div>
                            <h5 className="font-semibold mb-1 text-secondary">Address</h5>
                            <div className="text-sm">
                                <p>Address: {data?.address}</p>
                                <p>Country: {data?.country}</p>
                                <p>City: {data?.city}</p>
                            </div>
                        </div>
                    </div>
                    <div className={`absolute bottom-4 right-4 left-4 gap-2 flex flex-col justify-center`}>
                        <Button handleClick={handle_edit_info} styling="rounded-none" text="Edit Info"/>
                        <Button handleClick={handle_change_password} styling="rounded-none bg-red-500" text="Change Password"/>
                    </div>
                </div>

                <div className="w-full">
                    {has_permission && <div className="flex w-full h-[3rem] gap-2 justify-between">
                        {nav_to_use.map((item, i) => <Link to={item.path} className={`${item.path === current_location ? "bg-secondary" : "bg-primary"} w-full justify-center flex items-center text-white cursor-pointer`}><nav className="" key={i}>{item.name}</nav></Link>)}
                    </div>}
                    <Outlet/><div className={`${has_permission ? "mt-4": ""}`}>{children}</div>
                </div>
            </div>
        </StaffLayout>
    )
}
