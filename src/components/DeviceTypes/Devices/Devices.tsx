import { useApiGet } from "../../../utils/hooks/query"
import { useParams } from "react-router-dom"
import { get_device_type_devices } from "../../../api/devices"
import DeviceTypeSubMenu from "../DeviceTypeSubMenu"
import Button from "../../Commons/Button"
import Popup from "../../Commons/Popup"
import { BsTrash } from "react-icons/bs"
import { PiPen } from "react-icons/pi"
import DeviceForm from "../../Devices/Form"
import { usePopup } from "../../../utils/hooks/usePopUp"
import ErrorLoading from "../../Commons/ErrorAndLoading"
import { delete_device } from "../../../api/devices"
import { toast } from "react-toastify"
import Table from "../../Commons/Table"
import ConfirmModel from "../../Commons/ConfirmModel"
import { useState } from "react"

export default function DeviceTypeDevices(){
    const device_type_id: any = useParams()
    const {hidePopup, handleHidePopup} = usePopup()
    const [selectedDeviceId, setSelectedDeviceID] = useState("")
    const {
            data,
            isLoading,
            isFetching,
            isPending,
            error,
            isError,
            isLoadingError,
            refetch
        } = useApiGet(["device_type_devices"], ()=>get_device_type_devices(device_type_id.id))

    const handleUpdate = (data: any) => {
        handleHidePopup({show: true, data: data, type: "edit"})
        console.log(data, hidePopup)
    }

    const handleDelete = async (id: any) => {
        try{
            await delete_device(id=id)
            refetch()
            toast("Device deleted successfully.")
            handleHidePopup({show: false, type: "create"})
        } catch (error) {
            toast("Error deleting device type.")
            handleHidePopup({show: false, type: "create"})
        }
    }

    const handleDeletePopup = (device_id: string) => {
        setSelectedDeviceID(device_id)
        handleHidePopup({show: true, confirmModel: true, type: "edit"})
    }


    let data_to_render;

        if (data){
            data_to_render = data.map(device => ({
            id: device.id,
            serial_number: device.serial_number,
            mac_address: device.mac_address,
            create_at: device.created_at,
            owner: `${device.owner ? device.owner.first_name + " " + device.owner.last_name: ""}`,
            company: `${device.company ? device.company.name: ""}`,
            company_id: `${device.company ? device.company.id: ""}`,
            device_type_id: device.device_type?.id || null,
            device_type_name: device.device_type?.name || null
        }))
        }

        const table_columns = [
            {header: "Name", accessorKey: "device_type_name"},
            {header: "Mac Address", accessorKey: "mac_address"},
            {header: "Serial Number", accessorKey: "serial_number"},
            {header: "Owner", accessorKey: "owner"},
            {header: "Company", accessorKey: "company"},
            {
            header: "Actions",
            accessorKey: "id",
            cell: ({ cell, row}) => {
                return <div className="flex justify-between gap-4 px-4">
                    <div onClick={()=>handleDeletePopup(row.original.id)} className="shadow-md p-2 rounded-md hover:scale-110 hover:duration-150">
                        <BsTrash size={20} color="red" />
                    </div>
                    <div onClick={()=>handleUpdate(row.original)} className="shadow-md p-2 rounded-md hover:scale-110 hover:duration-150">
                        <PiPen size={20} className="text-primary" />
                    </div>
                </div>
                }
        }
        ]

        const button = <Button text="Create Device" styling="text-white py-2" handleClick={()=>handleHidePopup({ show: true, type: "create" })} />
        const popup = <Popup>
                    <div>
                        {hidePopup.confirmModel ? <ConfirmModel
                            cancel_action={()=>handleHidePopup({show: false, type: "create", confirmModel: false})}
                            title="Delete Device"
                            message="Are you sure you want to delete this device? This action cannot be undone."
                            handleSubmit={()=>handleDelete(selectedDeviceId)} />: <DeviceForm popup={hidePopup} /> 
                        }
                    </div>
                </Popup>

        if (isLoading || isFetching || isPending){
            return (
            <ErrorLoading>
                <div  className="text-2xl font-bold text-secondary">Fetching devices ...</div>
            </ErrorLoading>
        )
        }

        if (isError || isLoadingError){
            return (
            <ErrorLoading>
                <div  className="text-2xl font-bold text-secondary">Error fetching devices</div>
            </ErrorLoading>
        )
        }

    return (
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