import Layout from "../../../../Layout/Dashboard/Layout";
import { useApiGet } from "../../../../utils/hooks/query";
import { usePopup } from "../../../../utils/hooks/usePopUp";
import { delete_team_member, get_team_members} from "../../../../api/team_members";
import Table from "../../../Commons/Table";
import Button from "../../../Commons/Button";
import ErrorLoading from "../../../Commons/ErrorAndLoading";
import Popup from "../../../Commons/Popup";
import { BsTrash } from "react-icons/bs";
import { queryClient } from "../../..//../main";
import ConfirmModel from "../../..//Commons/ConfirmModel";
import { useState } from "react";
import TeamMembersForm from "./Form";
import { useParams } from "react-router-dom";


export default function TeamMembers(){
    const [selectedID, setSelectedID] = useState("")
    const [dataToSelect, seTDataToSelect] = useState([])
    const {hidePopup, handleHidePopup} = usePopup()
    let team_id = useParams().id
    // setNoMembers(false)

    let {
            data,
            isLoading,
            isFetching,
            isPending,
            error,
            isError,
            isLoadingError
        } = useApiGet(["team_members", team_id], ()=>get_team_members(team_id))

        const handle_remove_team_member = async () => {
            try {
                await delete_team_member(hidePopup.data.user_id, hidePopup.data.team_id)
                queryClient.invalidateQueries(["team_members"])
                handleHidePopup({show: false, type: "create", confirmModel: false})
            } catch (error) {
                console.log(error)
            }
        }

        const popup = (
            <Popup>
                {hidePopup.confirmModel ? <ConfirmModel title="Remove team member" message="Are you sure you want to remove this team member?" handleSubmit={handle_remove_team_member} cancel_action={()=>handleHidePopup({show: false, type: "create", confirmModel: false})} /> : <TeamMembersForm team_id={team_id} added_athletes={ isError ? [] : data} />}
            </Popup>
        )

        if (isLoading || isFetching || isPending){
            return (
                <ErrorLoading>
                    <div  className="text-2xl font-bold text-secondary">Fetching team members...</div>
                </ErrorLoading>
            )
        }

        const handle_athlete_to_empty_team = () => {
            handleHidePopup({show: true, type: "create"})
        }

        if (isError || isLoadingError){
            return (
                <div>
                    {hidePopup.show && popup}
                    <ErrorLoading>
                        <div className="flex items-center justify-center flex-col gap-4">
                            <div  className="text-xl font-bold text-red-400">{error.response.status === 404 ? "No team members found": "Error fetching team members"}</div>
                            {error.response.status === 404 && <Button text="Add Team Member" handleClick={handle_athlete_to_empty_team} />}
                        </div>
                    </ErrorLoading>
                </div>
            )
        }


        const handleDeletePopup = (user_id: string, team_id: string) => {
            console.log(user_id, team_id, "This is the selection")
            setSelectedID({user_id: user_id, team_id: team_id})
            handleHidePopup({show: true, type: "create", confirmModel: true, data: {user_id: user_id, team_id: team_id}})
        }

        let data_to_render = []

        const access_mapper = {
            individual: "Personal",
            all: "All Data",
            role: "Role Based"
        }

        if (data){
            data.map(item => {
                data_to_render.push({
                    email: item.user.email,
                    role: item.role?.name || "Athlete",
                    access: access_mapper[item.access_type],
                    user_id: item.user.id,
                    team_id: item.team_id
                })
            })
        }

        const table_columns = [
            {header: "Name", accessorKey: "email"},
            {header: "Role", accessorKey: "role"},
            {header: "Access", accessorKey: "access"},
            {
                header: "Actions",
                accessorKey: "user_id",
                cell: ({ cell, row }) => {
                    return <div className="flex gap-8 justify-center items-center px-4">
                            <div onClick={()=>handleDeletePopup(row.original.user_id, row.original.team_id)} className="shadow-md p-2 rounded-md hover:scale-110 hover:duration-150">
                                <BsTrash size={20} color="red" />
                            </div>
                        </div>
                    }
            }
        ]

        const button = <Button handleClick={()=>handleHidePopup({show: true, type: "create"})} text="Add Team Member" styling="text-white py-2" />

    return (
        <div>
            {hidePopup.show && popup}
            <Layout>
                {data && <div className="p-6">
                    <Table data={data_to_render} columns={table_columns} initialPageSize={10} actionBtn={button} searchMsg={"Search Team Members"} />
                </div>}
            </Layout>
        </div>
    )
}
