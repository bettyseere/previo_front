import { useApiGet } from "../../../utils/hooks/query";
import { useParams } from "react-router-dom";
import { useAuth } from "../../../utils/hooks/Auth";
import { get_company_teams, update_team, delete_team } from "../../../api/teams";
import Table from "../../Commons/Table";
import Layout from "../../../Layout/Dashboard/Layout";
import ErrorLoading from "../../Commons/ErrorAndLoading";
import { usePopup } from "../../../utils/hooks/usePopUp";
import Button from "../../Commons/Button";
import TeamForm from "./Form";
import Popup from "../../Commons/Popup";
import ConfirmModel from "../../Commons/ConfirmModel";
import { PiPen } from "react-icons/pi";
import { BsTrash } from "react-icons/bs";
import { useState } from "react";
import { toast } from "react-toastify";

export default function CompanyTeams(){
    const  {currentUser} = useAuth()
    const {hidePopup ,handleHidePopup} = usePopup()
    const company_id = currentUser?.company
    const [selectedId, setSelectedId] = useState("")

    const handleUpdate = (data: any) => {
        handleHidePopup({show: true, data: data, type: "edit"})
    }

    const handleDeletePopup = (id: string) => {
        setSelectedId(id)
        handleHidePopup({show: true, type: "create", confirmModel: true})
    }

    const handleDelete = async (id: string) => {
        try{
            await delete_team (id=id)
            refetch()
            handleHidePopup({show: false, type: "create"})
        } catch (error) {
            handleHidePopup({show: false, type: "create"})
        }
    }

    const {
        data,
        isLoading,
        isFetching,
        isPending,
        error,
        isError,
        isLoadingError,
        refetch
    } = useApiGet(["teams", company_id], ()=>get_company_teams(company_id))


    const popup = <Popup>
            {hidePopup.confirmModel ? <ConfirmModel title="Delete Sub Team" message="Are you sure you want to delete this team?" handleSubmit={()=>handleDelete(selectedId)} cancel_action={()=>handleHidePopup({show: false, type: "create", confirmModel: false})} /> : <TeamForm />}
        </Popup>

        if (isLoading || isFetching || isPending){
            return (
                <ErrorLoading>
                    <div  className="text-2xl font-bold text-secondary">Fetching teams...</div>
                </ErrorLoading>
            )
        }

    if (isError || isLoadingError){
        return (
            <div>
                {hidePopup.show && popup}
                <ErrorLoading>
                    <div className="flex items-center justify-center flex-col gap-4">
                        <div  className="text-xl font-bold text-red-400">{error.response.status === 404 ? "Not teams found": "Error fetching teams"}</div>
                        <Button text="Add Team" handleClick={()=>handleHidePopup({show: true, type: "create"})} />
                    </div>
                </ErrorLoading>
            </div>
        )
    }


    const table_columns = [
        {header: "Name", accessorKey: "name", cell: ({cell, row}) => {
            return <div className="">{row.original.name}</div>
        }},
        {
            header: "Team Members",
            accessorKey: "team_members",
            cell: ({ cell, row}) => {
                return <div className="text-secondary">
                    <a href={`/teams/${row.original.id}/team_members`}>
                        {row.original.team_members.length}
                    </a>
                </div>
            }
        },
        {
            header: "Actions",
            accessorKey: "id",
            cell: ({ cell, row}) => {
                return <div className="flex gap-8 px-4 justify-center">
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

    const button = <Button text="Create Team" styling="text-white py-2" handleClick={()=>handleHidePopup({ show: true, type: "create" })} />

    return (
        <div>
            {hidePopup.show && popup}
            <Layout>
                {data && <div className="p-6">
                    <Table columns={table_columns} data={data} initialPageSize={10} actionBtn={button} searchMsg={"Search Roles"} />
                </div>}
            </Layout>
        </div>
    )
}