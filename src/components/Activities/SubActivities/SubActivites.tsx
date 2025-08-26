import Layout from "../../../Layout/Dashboard/Layout";
import { useApiGet } from "../../../utils/hooks/query";
import { usePopup } from "../../../utils/hooks/usePopUp";
import { get_activity_sub_activities, delete_sub_activity } from "../../../api/activities/sub_activities/sub_activities";
import Table from "../../Commons/Table";
import Button from "../../Commons/Button";
import ErrorLoading from "../../Commons/ErrorAndLoading";
import Popup from "../../Commons/Popup";
import ActivityForm from "./Form";
import { BsTrash } from "react-icons/bs";
import { PiPen } from "react-icons/pi";
import { queryClient } from "../../../main";
import ConfirmModel from "../../Commons/ConfirmModel";
import { useState } from "react";
import { useParams } from "react-router-dom";
import moment from "moment";
import { useAuth } from "../../../utils/hooks/Auth";


export default function SubActivities(){
    const [selectedID, setSelectedID] = useState("")
    const {hidePopup, handleHidePopup} = usePopup()
    const {language} = useAuth()
    let activity_id: any = useParams();

    activity_id = activity_id.id
    console.log("\n\n\n", activity_id, "\n\n\n")
    const {
            data,
            isLoading,
            isFetching,
            isPending,
            error,
            isError,
            isLoadingError
        } = useApiGet(["sub_activities", activity_id], ()=>get_activity_sub_activities(activity_id))

        const popup = <Popup>
            {hidePopup.confirmModel ? <ConfirmModel title="Delete Sub Activity" message="Are you sure you want to delete this sub activity?" handleSubmit={()=>handle_remove_activity(selectedID)} cancel_action={()=>handleHidePopup({show: false, type: "create", confirmModel: false})} /> : <ActivityForm activity_id={activity_id} />}
        </Popup>

        if (isLoading || isFetching || isPending){
            return (
                <ErrorLoading>
                    <div  className="text-2xl font-bold text-secondary">Fetching sub activities...</div>
                </ErrorLoading>
            )
        }

        if (isError || isLoadingError){
            return (
                <div>
                    {hidePopup.show && popup}
                    <ErrorLoading>
                        <div className="flex items-center justify-center flex-col gap-4">
                            <div  className="text-xl font-bold text-red-400">{error.response.status === 404 ? "No activities found": "Error fetching activities"}</div>
                            <Button text="Add Sub Activity" handleClick={()=>handleHidePopup({show: true, type: "create"})} />
                        </div>
                    </ErrorLoading>
                </div>
            )
        }

        const handle_remove_activity = async (id: string) => {
            try {
                await delete_sub_activity(id)
                queryClient.invalidateQueries(["sub_activities"])
                handleHidePopup({show: false, type: "create", confirmModel: false})
            } catch (error) {
                console.log(error)
            }
        }

        const handleDeletePopup = (id: string) => {
            setSelectedID(id)
            handleHidePopup({show: true, type: "create", confirmModel: true})
        }

        const handleUpdate = (item) => {
            const selected_item = data.find(data_item => data_item.id === item.id);

            if (!selected_item) {
                console.error("No matching item found");
                return;
            }

            let result = [];
            for (const [language_code, name] of Object.entries(selected_item.name)) {
                if (name) {
                    result.push({
                        language_code,
                        name,
                        description: selected_item.description[language_code]
                    });
                }
            }

            // Filter out items with null descriptions
            result = result.filter(item => item.description !== null);
            handleHidePopup({show: true, type: "edit", data: {id: item.id, activities: result, activity_id: activity_id}})
        };


        let data_to_render;

        const getTranslation = (obj, lang) => {
            const targetLang = lang || 'en';
            return obj?.[targetLang] ?? obj?.en;
        };


        if (data){
            data_to_render = data.map(exercise => ({
            id: exercise.id,
            name: getTranslation(exercise.name, language),
            description: getTranslation(exercise.description, language),
            create_at: exercise.created_at,
            sub_exercises: exercise.sub_activities,
            activity_attributes: exercise.activity_attributes
        }))
        }

        const table_columns = [
            {header: "Name", accessorKey: "name"},
            {header: "description", accessorKey: "description"},
            {
                header: "Attributes",
                accessorKey: "activity_attributes",
                cell: ({ cell, row }) => {
                    return <div className="flex gap-8 justify-center items-center px-4 text-secondary font-semibold text-lg cursor-pointer">
                            <a href={`/activities/${activity_id}/attributes?sub_activity_id=${row.original.id}`}>
                                {row.original.activity_attributes.length}
                            </a>
                        </div>
                    }
            },
            {
                header: "Created At",
                accessorKey: "created_at",
                enableSorting: true,
                cell: ({cell, row}) => {
                    return <p className="">{moment(row.original.created_at).format("YYYY-MM-DD")}</p>
                }
            },
            {
                header: "Actions",
                accessorKey: "id",
                cell: ({ cell, row }) => {
                    return <div className="flex gap-8 justify-center items-center px-4">
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

        const button = <Button handleClick={()=>handleHidePopup({show: true, type: "create"})} text="Create Sub Activity" styling="text-white py-2" />

    return (
        <div>
            {hidePopup.show && popup}
            <Layout>
                {data && <div className="p-6">
                    <Table data={data_to_render} columns={table_columns} initialPageSize={10} actionBtn={button} back_path="/activities" searchMsg={"Search Sub Activities"} />
                </div>}
            </Layout>
        </div>
    )
}
