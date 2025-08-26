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
import { BsTrash } from "react-icons/bs"
import moment from "moment"
import { PiPen } from "react-icons/pi"
import { queryClient } from "../../../main"
import { useAuth } from "../../../utils/hooks/Auth"



export default function DeviceActivities(){
    const { hidePopup, handleHidePopup } = usePopup()
    let device_type_id: any = useParams()
    device_type_id = device_type_id.id
    const {language} = useAuth()
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
            } = useApiGet(["device_type_activities", device_type_id], ()=>get_device_activities(device_type_id))

    if (isLoading || isFetching || isPending){
                return (
                <ErrorLoading>
                    <div  className="text-2xl font-bold text-secondary">Fetching activities ...</div>
                </ErrorLoading>
            )
            }

    const init_delete = (id: string) =>{
        setSelectedActivityId(id)
        handleHidePopup({show: true, confirmModel: true, type: "create"})
    }
    const handleDelete = async (id: string) => {
            try{
                await delete_device_activity(device_type_id, id)
                refetch()
                toast("Device activity deleted successfully.")
                queryClient.invalidateQueries({ queryKey: ["device_type_activities"] })
                handleHidePopup({show: false, type: "create"})
            } catch (error) {
                toast("Error deleting device activity.")
                handleHidePopup({show: false, type: "create"})
            }
        }

    const handleUpdate = (data: any) => {
        handleHidePopup({show: true, data: data, type: "edit"})
        console.log(data, hidePopup)
    }

    let data_to_render;

    if (data){
        data_to_render = data.map(device_activity => {
            const translations = device_activity.activity.translations
            const val = translations.find(item => item.language_code === language)
            return {
                device_type_id: device_activity.device_type_id,
                activity_id: device_activity.activity_id,
                activity_name: val?.name ? val.name: device_activity.activity.translations[0].name,
                activity_description: val?.description ? val.description: device_activity.activity.translations[0].description,
                created_at: device_activity.created_at,
                position: device_activity.position,
                updated_at: device_activity.updated_at
            }
        }
        )
    }

    const table_columns = [
        {header: "Name", accessorKey: "activity_name"},
        {header: "Position", accessorKey: "position"},
        {header: "Description", accessorKey: "activity_description"},
        {
            header: "Created At",
            accessorKey: "created_at",
            cell: ({cell, row}) => {
                return <p className="">{moment(row.original.created_at).format("YYYY-MM-DD")}</p>
            }
        },
        {header: "Actions", accessorKey: "activity_id", cell: ({ cell, row}) => {
            return <div className="flex justify-center items-center gap-4 px-4">
                <div onClick={()=>init_delete(row.original.activity_id)} className="shadow-md p-2 rounded-md hover:scale-110 hover:duration-150">
                        <BsTrash size={20} color="red" />
                </div>

                <div onClick={()=>handleUpdate(row.original)} className="shadow-md p-2 rounded-md hover:scale-110 hover:duration-150">
                    <PiPen size={20} className="text-primary" />
                </div>
                </div>
        }}
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
            <div>{hidePopup.show && popup}
            <DeviceTypeSubMenu>
                <div className="flex flex-col items-center justify-center gap-4 mt-[5rem]">
                <div  className="text-2xl font-bold text-red-400">{error.response.status === 404 ? "No activities found": "Error fetching activities. Try again later."}</div>
                {error.response.status == 404 && <div>
                    <Button text="Add Activity" handleClick={()=>handleHidePopup({ show: true, type: "create" })} />
                </div>}
                </div>
            </DeviceTypeSubMenu>
            </div>
        )
        }

    return(
        <DeviceTypeSubMenu>
            <div>
                {hidePopup.show && popup}
                {data && <div className="p-6">
                    <Table back_path="/device_types" data={data_to_render} columns={table_columns} initialPageSize={10} actionBtn={button} searchMsg={"Search Activities"} />
                </div>}
            </div>
        </DeviceTypeSubMenu>
    )
}