import { useApiGet } from "../../../../../utils/hooks/query";
import { get_team_members } from "../../../../../api/team_members";
import Table from "../../../../Commons/Table";
import { useParams } from "react-router-dom";
import UserInfo from "../../UserInfo";
import { useAuth } from "../../../../../utils/hooks/Auth";
import { usePopup } from "../../../../../utils/hooks/usePopUp";
import Button from "../../../../Commons/Button";
import Popup from "../../../../Commons/Popup";
import TeamMembersForm from "./Form";
import { queryClient } from "../../../../../main";
import ConfirmModel from "../../../../Commons/ConfirmModel";
import { delete_team_member } from "../../../../../api/team_members";
import { BsTrash } from "react-icons/bs";
import AthleteInviteForm from "./InviteForm";


export default function UserTeamMembers(){
    let team_id = useParams().id
    let team_name = localStorage.getItem("current_team")
    const { currentUser } = useAuth()
    const is_staff = currentUser?.user_type == "staff"
    const {hidePopup, handleHidePopup} = usePopup()

    const {
            data,
            isLoading,
            isFetching,
            isPending,
            isError,
            isLoadingError
        } = useApiGet(["team_members", team_id], ()=>get_team_members(team_id))

    const default_nav = [
        {name: "Team Members", path: is_staff ? "/teams/"+team_id: "/profile/teams/"+team_id},
        {name: "Team Records", path: is_staff ? "/teams/"+team_id+"/records": "/profile/teams/"+team_id+"/records"}
    ]


    const handle_remove_team_member = async () => {
                try {
                    await delete_team_member(hidePopup.data.user_id, hidePopup.data.team_id)
                    queryClient.invalidateQueries(["team_members"])
                    handleHidePopup({show: false, type: "create", confirmModel: false})
                } catch (error) {
                    console.log(error)
                }
            }


        const handleDeletePopup = (user_id: string, team_id: string) => {
            handleHidePopup({show: true, type: "create", confirmModel: true, data: {user_id: user_id, team_id: team_id}})
        }

        if (isLoading || isFetching || isPending){
            return (
                <UserInfo nav_items={default_nav}>
                    <div  className="text-2xl font-bold text-secondary">Fetching team members...</div>
                </UserInfo>
            )
        }

        if (isError || isLoadingError){
            return (
                <UserInfo nav_items={default_nav}>
                    <p>Error fetching team members</p>
                </UserInfo>
            )
        }

        console.log(data)

        let data_to_render = []

        if (data){
            data.map(item => {
                data_to_render.push({
                    name: item.email,
                    role: item.role?.name || "Athlete",
                    user_id: item.user.id,
                    team_id: item.team_id
                })
            })
        }

        const table_columns = [
            {header: "Name", accessorKey: "name"},
            {header: "Role", accessorKey: "role"},
            {
                            header: "Actions",
                            accessorKey: "user_id",
                            cell: ({ cell, row }) => {
                                return row.original.user_id !== currentUser?.id && <div className="flex gap-8 justify-center items-center px-4">
                                        <div onClick={()=>handleDeletePopup(row.original.user_id, row.original.team_id)} className="shadow-md p-2 rounded-md hover:scale-110 hover:duration-150">
                                            <BsTrash size={20} color="red" />
                                        </div>
                                    </div>
                                }
                        }
        ]

        const popup = (
                    <Popup>
                        {hidePopup.confirmModel ? <ConfirmModel title="Remove team member" message="Are you sure you want to remove this team member?" handleSubmit={handle_remove_team_member} cancel_action={()=>handleHidePopup({show: false, type: "create", confirmModel: false})} /> : (hidePopup.data?.action ===  "invite_member" ? <AthleteInviteForm company_id={currentUser?.company} team_id={team_id} />: <TeamMembersForm team_id={team_id} added_athletes={ isError ? [] : data} />)}
                    </Popup>
                )


        const button = <Button handleClick={()=>handleHidePopup({show: true, type: "create"})} text="Add/Invite Team Member" styling="text-white py-2" />


    return (
        <div>
            {hidePopup.show && popup}
            <UserInfo nav_items={default_nav}>
                {data && <div className="">
                    <Table data={data_to_render} actionBtn={button} columns={table_columns} initialPageSize={10} entity_name={team_name ? team_name : "Team members"} searchMsg={"Search Team Members"} back_path="/teams" />
                </div>}
            </UserInfo>
        </div>
    )
}
