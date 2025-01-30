import { useAuth } from "../../../../utils/hooks/Auth";
import Table from "../../../Commons/Table";
import UserInfo from "../../UserInfo/UserInfo";


export default function UserDevices(){
    const { currentUser } = useAuth()
    const user_devices = currentUser?.devices || []
    let data_to_render = []

    user_devices.forEach(device =>
        {
            console.log(device)
            data_to_render.push({name: device.device_type.name, mac_address: device.mac_address, serial_number: device.serial_number})
        }
    )

    const table_columns = [
        {header: "Name", accessorKey: "name"},
        {header: "Mac Address", accessorKey: "mac_address"},
        {header: "Serial Number", accessorKey: "serial_number"}
        ]


    return (
        <UserInfo>
            {data_to_render.length > 0 ? <Table searchMsg="Search your devices" data={data_to_render} columns={table_columns} entity_name="Your Devices" />: <div>
                <p className="font-semibold mt-4">You do not have any devices.</p>
                </div>}
        </UserInfo>
    )

}