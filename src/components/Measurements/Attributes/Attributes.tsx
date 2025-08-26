import Layout from "../../../Layout/Dashboard/Layout";
import { useApiGet } from "../../../utils/hooks/query";
import { usePopup } from "../../../utils/hooks/usePopUp";
import { get_attributes, delete_attribute } from "../../../api/measurements/attributes";
import Table from "../../Commons/Table";
import Button from "../../Commons/Button";
import ErrorLoading from "../../Commons/ErrorAndLoading";
import Popup from "../../Commons/Popup";
import AttributeForm from "./Form";
import { BsTrash } from "react-icons/bs";
import { PiPen } from "react-icons/pi";
import { queryClient } from "../../../main";
import ConfirmModel from "../../Commons/ConfirmModel";
import { useState } from "react";
import moment from "moment";
import { useAuth } from "../../../utils/hooks/Auth";


export default function MeasurementAttributes(){
    const [selectedID, setSelectedID] = useState("")
    const {hidePopup, handleHidePopup} = usePopup()
    const {language} = useAuth()
    const {
            data,
            isLoading,
            isFetching,
            isPending,
            error,
            isError,
            isLoadingError
        } = useApiGet(["measurement_attributes"], get_attributes)

        const popup = <Popup>
            {hidePopup.confirmModel ? <ConfirmModel title="Delete Attribute" message="Are you sure you want to delete this attribute?" handleSubmit={()=>handle_remove_activity(selectedID)} cancel_action={()=>handleHidePopup({show: false, type: "create", confirmModel: false})} /> : <AttributeForm />}
        </Popup>

        if (isLoading || isFetching || isPending){
            return (
                <ErrorLoading>
                    <div  className="text-2xl font-bold text-secondary">Fetching attributes...</div>
                </ErrorLoading>
            )
        }

        if (isError || isLoadingError){
            return (
                <div>
                    {hidePopup.show && popup}
                    <ErrorLoading>
                        <div className="flex items-center justify-center flex-col gap-4">
                            <div  className="text-xl font-bold text-red-400">{error.response.status === 404 ? "No attributes found": "Error fetching attributes"}</div>
                            <Button text="Add Attribute" handleClick={()=>handleHidePopup({show: true, type: "create"})} />
                        </div>
                    </ErrorLoading>
                </div>
            )
        }

        const handle_remove_activity = async (id: string) => {
            try {
                await delete_attribute(id)
                queryClient.invalidateQueries(["measurement_attributes"])
                handleHidePopup({show: false, type: "create", confirmModel: false})
            } catch (error) {
                console.log(error)
            }
        }

        const handleDeletePopup = (id: string) => {
            setSelectedID(id)
            handleHidePopup({show: true, type: "create", confirmModel: true})
        }

        const handleUpdate = (item: any) => {
            setSelectedID(item.id)
            // Filter the matching item
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
                        description: selected_item.description[language_code],
                        units: selected_item.units[language_code]
                    });
                }
            }

            result = result.filter(item => item.description !== null);
            handleHidePopup({show: true, type: "edit", data: {id: item.id, activities: result}})
        };


        let data_to_render;
        const getTranslation = (obj, lang) => {
            const targetLang = lang || 'en';
            return obj?.[targetLang] ?? obj?.en;
        };

        if (data) {
            data_to_render = data.map(exercise => ({
                id: exercise.id,
                name: getTranslation(exercise.name, language),
                units: getTranslation(exercise.units, language),
                description: getTranslation(exercise.description, language),
                created_at: exercise.created_at,
                sub_exercises: exercise.sub_activities
            }));
        }

        const table_columns = [
            {header: "Name", accessorKey: "name"},
            {header: "description", accessorKey: "description"},
            {
                header: "Created At",
                accessorKey: "created_at",
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

        const button = <Button handleClick={()=>handleHidePopup({show: true, type: "create"})} text="Create Attribute" styling="text-white py-2" />

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
