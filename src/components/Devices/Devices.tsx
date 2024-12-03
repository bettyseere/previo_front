import Layout from "../../Layout/Dashboard/Layout";
import { useApiGet } from "../../utils/hooks/query";
import { usePopup } from "../../utils/hooks/usePopUp";
import { get_devices, delete_device } from "../../api/devices";
import Table from "../Commons/Table";
import Button from "../Commons/Button";
import { BsTrash } from "react-icons/bs";
import { PiPen } from "react-icons/pi";
import Popup from "../Commons/Popup";
import DeviceForm from "./Form";
import ErrorLoading from "../Commons/ErrorAndLoading";
import { toast } from "react-toastify";


export default function Devices(){
    const {hidePopup ,handleHidePopup} = usePopup()

    const handleUpdate = (data: any) => {
        handleHidePopup({show: true, data: data, type: "edit"})
        console.log(data, hidePopup)
    }
    // const {hidePopup, setHidePopup} = usePopup()
    const {
            data,
            isLoading,
            isFetching,
            isPending,
            error,
            isError,
            isLoadingError,
            refetch
        } = useApiGet(["devices"], get_devices)

        const handleDelete = async (id: string) => {
        try{
            await delete_device(id=id)
            refetch()
            toast("Company delete successfully.")
            handleHidePopup({show: false, type: "create"})
        } catch (error) {
            toast("Error deleting company")
            handleHidePopup({show: false, type: "create"})
        }
    }


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

        data && localStorage.setItem("devices", JSON.stringify(data))

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
                    <div onClick={()=>handleDelete(row.original.id)} className="shadow-md p-2 rounded-md hover:scale-110 hover:duration-150">
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
                        <DeviceForm popup={hidePopup} />
                    </div>
                </Popup>
    return (
        <div>
            {hidePopup.show && popup}
            <Layout>
                {data && <div className="p-6">
                    <Table data={data_to_render} columns={table_columns} initialPageSize={10} actionBtn={button} searchMsg={"Search Devices"} />
                </div>}
            </Layout>
        </div>
    )
}