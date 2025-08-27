import Layout from "../../Layout/Dashboard/Layout";
import { useApiGet } from "../../utils/hooks/query";
import { usePopup } from "../../utils/hooks/usePopUp";
import { get_device_types, delete_device_type } from "../../api/device_types";
import Table from "../Commons/Table";
import Button from "../Commons/Button";
import { BsTrash } from "react-icons/bs";
import { PiPen } from "react-icons/pi";
import Popup from "../Commons/Popup";
import DeviceTypeForm from "./Form";
import ErrorLoading from "../Commons/ErrorAndLoading";
import { toast } from "react-toastify";
import ConfirmModel from "../Commons/ConfirmModel";
import { useState } from "react";
import moment from "moment";
import { queryClient } from "../../main";



export default function Device_Types(){
    const {hidePopup ,handleHidePopup} = usePopup()
    const [deleteID, setDeleteID] = useState("")

    const handleUpdate = (data: any) => {
        handleHidePopup({show: true, data: data, type: "edit"})
        console.log(data, hidePopup)
    }

    const handleDeletePopup = (id: string) => {
        setDeleteID(id)
        handleHidePopup({show: true, type: "create", confirmModel: true})
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
        } = useApiGet(["device_types"], get_device_types)

        const handleDelete = async (id: string) => {
        try{
            await delete_device_type(id=id)
            refetch()
            toast("Device type deleted successfully.")
            queryClient.invalidateQueries({ queryKey: ["device_types"] })
            handleHidePopup({show: false, type: "create"})
        } catch (error) {
            toast("Error deleting device type.")
            handleHidePopup({show: false, type: "create"})
        }
    }


        if (isLoading || isFetching || isPending){
            return (
            <ErrorLoading>
                <div  className="text-2xl font-bold text-secondary">Fetching device types ...</div>
            </ErrorLoading>
        )
        }

        const popup = <Popup>
                <div>
                    {hidePopup.confirmModel ? <ConfirmModel
                        message="Are you sure you want to delete this device type? This action cannot be reversed."
                        title="Delete device type"
                        handleSubmit={()=>handleDelete(deleteID)}
                        cancel_action={()=>handleHidePopup({confirmModel: false, type: "create", show: false})}
                    /> : <DeviceTypeForm popup={hidePopup} />}
                </div>
            </Popup>

        if (isError || isLoadingError){
            return (
                <div>
                    {hidePopup.show && popup}
                    <ErrorLoading>
                        <div className="flex items-center justify-center flex-col gap-4">
                            <div  className="text-xl font-bold text-red-400">{error.response.status === 404 ? "No device types found": "Error fetching device types"}</div>
                            {error.response.status === 404 && <Button text="Add Device Type" handleClick={()=>handleHidePopup({show: true, type: "create"})} />}
                        </div>
                    </ErrorLoading>
                </div>
            )
        }


        const table_columns = [
            {header: "Name", accessorKey: "name", enableSorting: true, cell: ({cell, row}) => {
                return <div className="text-secondary"><a href={`/device_types/${row.original.id}`}>{row.original.name}</a></div>
            }},
            {header: "Devices", enableSorting: true, accessorKey: "devices", cell: ({cell, row}) => {
                return <div className="text-secondary">{row.original.devices?.length.toString()}</div>
            }},
            {header: "Activities", accessorKey: "devices", enableSorting: true, cell: ({cell, row}) => {
                return <div className="text-secondary">{row.original.device_activities?.length.toString()}</div>
            }},
            // {header: "Attributes", accessorKey: "devices", enableSorting: true, cell: ({cell, row}) => {
            //     return <div className="text-secondary">{row.original.device_activities?.length.toString()}</div>
            // }},
            {
                header: "Created At",
                accessorKey: "created_at",
                enableSorting: true,
                cell: ({cell, row}) => {
                        return <p className="text-secondary">{moment(row.original.created_at).format("YYYY-MM-DD")}</p>
                    }
            },
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

        const button = <Button text="Create Device Type" styling="text-white py-2" handleClick={()=>handleHidePopup({ show: true, type: "create" })} />
    return (
        <div>
            {hidePopup.show && popup}
            <Layout>
                {data && <div className="p-6">
                    <Table data={data} columns={table_columns} initialPageSize={10} actionBtn={button} searchMsg={"Search Device Types"} searchMode="double" />
                </div>}
            </Layout>
        </div>
    )
}