
import SubMenu from "../Commons/Submenu"
import { useParams } from "react-router-dom"
import { get_device_type_devices } from "../../../api/devices"


interface props {
    children: React.ReactNode
}

export default function DeviceTypeSubMenu({children}: props){
    const device_type_id = useParams()
    const sub_menu_nav = [
        {name: "Devices", link: "/device_types/"+device_type_id.id},
        {name: "Activities", link: "/device_types/"+device_type_id.id+"/activities/"}
    ]
    return (
        <SubMenu sub_page_props={sub_menu_nav}>
            {children}
        </SubMenu>
    )
}
