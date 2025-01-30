import { useParams } from "react-router-dom";
import { useApiGet } from "../../../utils/hooks/query";
import { usePopup } from "../../../utils/hooks/usePopUp";
import Layout from "../../../Layout/Dashboard/Layout";
import Table from "../../Commons/Table";
import { get_results, delete_result } from "../../../api/measurements/results";
import { queryClient } from "../../../main";
import ResultForm from "./Form";
import { BsTrash } from "react-icons/bs";
import ConfirmModel from "../../Commons/ConfirmModel";
import Button from "../../Commons/Button";
import Popup from "../../Commons/Popup";
import ErrorLoading from "../../Commons/ErrorAndLoading";
import { useState } from "react";

export default function Results(){
    const {hidePopup, handleHidePopup} = usePopup()
    const [selectedID, setSelectedID] = useState(null)
    let measurement_id: any = useParams();
    measurement_id = measurement_id.id
    const {data, isLoading, isError, error} = useApiGet(["measurement_results", measurement_id], ()=>get_results(measurement_id))

    let data_to_render = [{name: "Joshua", id: "soemtipe"}];

    const  handle_remove_result = async (id: string) => {
        console.log(id)
    }

    const init_delete = (id: any) => {
        setSelectedID(id)
        console.log("This is called", selectedID)
        handleHidePopup({type: "create", show: true, confirmModel: true})
    }

    const popup = <Popup>
            {hidePopup.confirmModel ? <ConfirmModel title="Delete Result" message="Are you sure you want to delete this result?" handleSubmit={()=>handle_remove_result(selectedID)} cancel_action={()=>handleHidePopup({show: false, type: "create", confirmModel: false})} /> : <ResultForm />}
        </Popup>

    const table_columns = [
        {header: "Joshua", accessorKey: "name"},
        {header: "Action", accessorKey: "id", cell: ({cell, row}) => {
        return <div className="flex gap-8 justify-center items-center px-4">
            <div onClick={()=>init_delete(row.original.id)} className="shadow-md p-2 rounded-md hover:scale-110 hover:duration-150">
                    <BsTrash size={20} color="red" />
                </div>
        </div>}}
    ]

    if (isLoading){
        return (
            <ErrorLoading>
                <div  className="text-2xl font-bold text-secondary">Fetching results ...</div>
            </ErrorLoading>
        )
    }

    if (isError){
        return (
            <div>
                {hidePopup.show && popup}
                    <ErrorLoading>
                        <div className="flex items-center justify-center flex-col gap-4">
                            <div  className="text-xl font-bold text-red-400">{error.response.status === 404 ? "No results found": "Error fetching results"}</div>
                            <Button text="Add Activity" handleClick={()=>handleHidePopup({show: true, type: "create"})} />
                        </div>
                    </ErrorLoading>
                </div>
            )
        }

    const button = <Button handleClick={()=>handleHidePopup({show: true, type: "create"})} text="Add Result" styling="text-white py-2" />


    return (
        <div>
            {hidePopup.show && popup}
            <Layout>
                {data && <div className="p-6">
                    <Table columns={table_columns} data={data_to_render} initialPageSize={10} searchMsg="Search Results" actionBtn={button} />
                    </div>}
            </Layout>
        </div>
    )
}