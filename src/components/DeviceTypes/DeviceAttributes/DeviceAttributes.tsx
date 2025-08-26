import DeviceTypeSubMenu from "../DeviceTypeSubMenu"
import { usePopup } from "../../../utils/hooks/usePopUp"
import { useApiGet } from "../../../utils/hooks/query"
import Table from "../../Commons/Table"
import { useParams } from "react-router-dom"
import { get_device_attributes, delete_device_attribute } from "../../../api/device_attributes"
import DeviceAttributesForm from "./Form"
import Popup from "../../Commons/Popup"
import ConfirmModel from "../../Commons/ConfirmModel"
import Button from "../../Commons/Button"
import { toast } from "react-toastify"
import { useState } from "react"
import ErrorLoading from "../../Commons/ErrorAndLoading"
import { BsTrash } from "react-icons/bs"
import moment from "moment"
import { PiPen } from "react-icons/pi"
import { useQueryClient } from "@tanstack/react-query"
import { useAuth } from "../../../utils/hooks/Auth"



export default function DeviceAttributes(){
    const { hidePopup, handleHidePopup } = usePopup()
    const {language} = useAuth()
    let device_type_id: any = useParams()
    device_type_id = device_type_id.id
    const [selectedAttributeID, setSelectedAttributeId] = useState("")
    const queryClient = useQueryClient()
    const {
                data,
                isLoading,
                isFetching,
                isPending,
                error,
                isError,
                isLoadingError,
                refetch
            } = useApiGet(["device_type_attributes", device_type_id], ()=>get_device_attributes(device_type_id))

    if (isLoading || isFetching || isPending){
                return (
                <ErrorLoading>
                    <div  className="text-2xl font-bold text-secondary">Fetching attributes ...</div>
                </ErrorLoading>
            )
            }

    const init_delete = (id: string) =>{
        setSelectedAttributeId(id)
        handleHidePopup({show: true, confirmModel: true, type: "create"})
    }
    const handleDelete = async (id: string) => {
            try{
                await delete_device_attribute(device_type_id, id)
                // refetch()
                queryClient.invalidateQueries({ queryKey: ["device_type_attributes"] })
                toast("Device activity deleted successfully.")
                handleHidePopup({show: false, type: "create"})
            } catch (error) {
                toast("Error deleting device attribute.")
                handleHidePopup({show: false, type: "create"})
            }
        }

    const handleUpdate = (data: any) => {
        console.log(data)
        handleHidePopup({show: true, data: data, type: "edit"})
        console.log(data, hidePopup)
    }

    let data_to_render;

    if (data) {
        data_to_render = data.map(device_attribute => {
            const translations = device_attribute.attribute.translations;
            const translation = translations.find(t => t.language_code === language) || translations[0];

            return {
                device_type_id: device_type_id,
                attribute_id: device_attribute.attribute.id,
                activity_name: translation?.name,
                activity_description: translation?.description,
                created_at: device_attribute.created_at,
                position: device_attribute.position,
                updated_at: device_attribute.updated_at
            };
        });
    }

    const table_columns = [
        {header: "Name", accessorKey: "activity_name"},
        {header: "Position", accessorKey: "position"},
        {header: "Description", accessorKey: "attribute_description"},
        {
            header: "Created At",
            accessorKey: "created_at",
            cell: ({cell, row}) => {
                return <p className="">{moment(row.original.created_at).format("YYYY-MM-DD")}</p>
            }
        },
        {header: "Actions", accessorKey: "attribute_id", cell: ({ cell, row}) => {
            return <div className="flex justify-center items-center gap-4 px-4">
                <div onClick={()=>init_delete(row.original.attribute_id)} className="shadow-md p-2 rounded-md hover:scale-110 hover:duration-150">
                        <BsTrash size={20} color="red" />
                </div>

                <div onClick={()=>handleUpdate(row.original)} className="shadow-md p-2 rounded-md hover:scale-110 hover:duration-150">
                    <PiPen size={20} className="text-primary" />
                </div>
                </div>
        }}
    ]

    const button = <Button text="Create Device Attribute" styling="text-white py-2" handleClick={()=>handleHidePopup({ show: true, type: "create" })} />

    const popup = <Popup>
            <div>
                {hidePopup.confirmModel ? <ConfirmModel
                    cancel_action={()=>handleHidePopup({show: false, type: "create", confirmModel: false})}
                    title="Delete Device Attribute"
                    message="Are you sure you want to delete this device attribute? This action cannot be undone."
                    handleSubmit={()=>handleDelete(selectedAttributeID)} />: <DeviceAttributesForm />
                }
            </div>
        </Popup>

    if (isError || isLoadingError){
        return (
            <div>{hidePopup.show && popup}
            <DeviceTypeSubMenu>
                <div className="flex flex-col items-center justify-center gap-4 mt-[5rem]">
                <div  className="text-2xl font-bold text-red-400">{error.response.status === 404 ? "No attributes found": "Error fetching attributes. Try again later."}</div>
                {error.response.status == 404 && <div>
                    <Button text="Add Attribute" handleClick={()=>handleHidePopup({ show: true, type: "create" })} />
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
                    <Table data={data_to_render} back_path="/device_types" columns={table_columns} initialPageSize={10} actionBtn={button} searchMsg={"Search Attributes"} />
                </div>}
            </div>
        </DeviceTypeSubMenu>
    )
}