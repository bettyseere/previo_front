import DeviceTypeSubMenu from "../DeviceTypeSubMenu"
import { usePopup } from "../../../utils/hooks/usePopUp"
import { useApiGet } from "../../../utils/hooks/query"
import Table from "../../Commons/Table"
import { useParams } from "react-router-dom"
import { get_device_activities, delete_device_activity } from "../../../api/device_activities"
import DeviceActivitiesForm from "./Form"
import Popup from "../../Commons/Popup"
import ConfirmModel from "../../Commons/ConfirmModel"
import Button from "../../Commons/Button"
import { toast } from "react-toastify"
import { useState } from "react"
import ErrorLoading from "../../Commons/ErrorAndLoading"



export default function DeviceActivities(){
    const { hidePopup, handleHidePopup } = usePopup()
    const device_type_id: any = useParams()
    const [selectedActivityID, setSelectedActivityId] = useState("")
    const {
                data,
                isLoading,
                isFetching,
                isPending,
                error,
                isError,
                isLoadingError,
                refetch
            } = useApiGet(["device_activities"], ()=>get_device_activities(device_type_id.id))

    const handleDelete = async (id: string) => {
            try{
                await delete_device_activity(device_type_id.id, id)
                refetch()
                toast("Device deleted successfully.")
                handleHidePopup({show: false, type: "create"})
            } catch (error) {
                toast("Error deleting device type.")
                handleHidePopup({show: false, type: "create"})
            }
        }

    let data_to_render;

    if (data){
        console.log(data)
        data_to_render = [{name: "One", what: "anything else"}]
        // data_to_render = data.map(device => ({
        //     id: device.id,
        //     serial_number: device.serial_number,
        //     mac_address: device.mac_address,
        //     create_at: device.created_at,
        //     owner: `${device.owner ? device.owner.first_name + " " + device.owner.last_name: ""}`,
        //     company: `${device.company ? device.company.name: ""}`,
        //     company_id: `${device.company ? device.company.id: ""}`,
        //     device_type_id: device.device_type?.id || null,
        //     device_type_name: device.device_type?.name || null
        // }
        // ))
    }

    const table_columns = [
        {header: "Name", accessorKey: "name"},

    ]

    const button = <Button text="Create Device Activity" styling="text-white py-2" handleClick={()=>handleHidePopup({ show: true, type: "create" })} />

    const popup = <Popup>
            <div>
                {hidePopup.confirmModel ? <ConfirmModel
                    cancel_action={()=>handleHidePopup({show: false, type: "create", confirmModel: false})}
                    title="Delete Device Activity"
                    message="Are you sure you want to delete this device activity? This action cannot be undone."
                    handleSubmit={()=>handleDelete(selectedActivityID)} />: <DeviceActivitiesForm />
                }
            </div>
        </Popup>

    if (isError || isLoadingError){
        return (
            <DeviceTypeSubMenu>
                {hidePopup.show && popup}
                <div className="flex flex-col items-center justify-center gap-4 mt-[5rem]">
                <div  className="text-2xl font-bold text-red-400">{error.response.status === 404 ? "No activities found": "Error fetching activities. Try again later."}</div>
                {error.response.status == 404 && <div>
                    <Button text="Add Activity" handleClick={()=>handleHidePopup({ show: true, type: "create" })} />
                </div>}
                </div>
            </DeviceTypeSubMenu>
        )
        }

    return(
        <DeviceTypeSubMenu>
            <div>
                {hidePopup.show && popup}
                {data && <div className="p-6">
                    <Table data={data_to_render} columns={table_columns} initialPageSize={10} actionBtn={button} searchMsg={"Search Devices"} />
                </div>}
            </div>
        </DeviceTypeSubMenu>
    )
}