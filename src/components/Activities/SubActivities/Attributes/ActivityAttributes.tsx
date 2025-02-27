import Layout from "../../../../Layout/Dashboard/Layout";
import { useApiGet } from "../../../../utils/hooks/query";
import { usePopup } from "../../../../utils/hooks/usePopUp";
import { get_activity_attributes, delete_activity_attribute } from "../../../../api/activities/sub_activities/attributes";
import Table from "../../../Commons/Table";
import Button from "../../../Commons/Button";
import ErrorLoading from "../../../Commons/ErrorAndLoading";
import Popup from "../../../Commons/Popup";
// import ActivityForm from "./Form";
import { BsTrash } from "react-icons/bs";
import { queryClient } from "../../..//../main";
import ConfirmModel from "../../..//Commons/ConfirmModel";
import { useState } from "react";
import ActivityAttributeForm from "./Form";
import moment from "moment";


export default function ActivityAttributes(){
    const [selectedID, setSelectedID] = useState("")
    const {hidePopup, handleHidePopup} = usePopup()

    let sub_activity_id = (new URLSearchParams(window.location.search)).get("sub_activity_id")

    const {
            data,
            isLoading,
            isFetching,
            isPending,
            error,
            isError,
            isLoadingError
        } = useApiGet(["activity_attributes", sub_activity_id], ()=>get_activity_attributes(sub_activity_id))

        const handle_remove_activity_attribute = async () => {
            try {
                await delete_activity_attribute(selectedID, sub_activity_id)
                queryClient.invalidateQueries(["activity_attributes"])
                handleHidePopup({show: false, type: "create", confirmModel: false})
            } catch (error) {
                console.log(error)
            }
        }

        const popup = (
            data && <Popup>
                {hidePopup.confirmModel ? <ConfirmModel title="Remove activity attribute" message="Are you sure you want to remove this activity attribute?" handleSubmit={handle_remove_activity_attribute} cancel_action={()=>handleHidePopup({show: false, type: "create", confirmModel: false})} /> :    <ActivityAttributeForm sub_activity_id={sub_activity_id} added_attributes={data} />}
            </Popup>
        )

        if (isLoading || isFetching || isPending){
            return (
                <ErrorLoading>
                    <div  className="text-2xl font-bold text-secondary">Fetching activity attributes...</div>
                </ErrorLoading>
            )
        }

        if (isError || isLoadingError){
            return (
                <div>
                    {hidePopup.show && popup}
                    <ErrorLoading>
                        <div className="flex items-center justify-center flex-col gap-4">
                            <div  className="text-xl font-bold text-red-400">{error.response.status === 404 ? "No attributes found for this activity": "Error fetching attributes"}</div>
                            {error.response.status === 404 && <Button text="Add Activity Attribute" handleClick={()=>handleHidePopup({show: true, type: "create"})} />}
                        </div>
                    </ErrorLoading>
                </div>
            )
        }


        const handleDeletePopup = (id: string) => {
            setSelectedID(id)
            handleHidePopup({show: true, type: "create", confirmModel: true})
        }

        let data_to_render = []

        if (data){
            data.map(item => {
                data_to_render.push({
                    attribute_id: item.attribute.id,
                    name: item.attribute.translations[0].name,
                    description: item.attribute.translations[0].description,
                    units: item.attribute.translations[0].units,
                    created_at: item.attribute.created_at
                })
            })
        }

        const table_columns = [
            {header: "Name", accessorKey: "name"},
            {header: "Description", accessorKey: "description"},
            {header: "Units", accessorKey: "units"},
            {
                header: "Created At",
                accessorKey: "created_at",
                cell: ({cell, row}) => {
                    return <p className="">{moment(row.original.created_at).format("YYYY-MM-DD")}</p>
                }
            },
            {
                header: "Actions",
                accessorKey: "attribute_id",
                cell: ({ cell, row }) => {
                    return <div className="flex gap-8 justify-center items-center px-4">
                            <div onClick={()=>handleDeletePopup(row.original.attribute_id)} className="shadow-md p-2 rounded-md hover:scale-110 hover:duration-150">
                                <BsTrash size={20} color="red" />
                            </div>
                        </div>
                    }
            }
        ]

        const button = <Button handleClick={()=>handleHidePopup({show: true, type: "create"})} text="Add Attribute" styling="text-white py-2" />

    return (
        <div>
            {hidePopup.show && popup}
            <Layout>
                {data && <div className="p-6">
                    <Table data={data_to_render} columns={table_columns} initialPageSize={10} actionBtn={button} searchMsg={"Search Attributes"} />
                </div>}
            </Layout>
        </div>
    )
}
