import { useApiGet } from "../../../../../utils/hooks/query";
import { get_team_members } from "../../../../../api/team_members";
import Table from "../../../../Commons/Table";
import { useParams } from "react-router-dom";
import UserInfo from "../../UserInfo";
import { useAuth } from "../../../../../utils/hooks/Auth";
import UserTeamLayout from "../Layout";


export default function UserTeamMembers(){
    let team_id = useParams().id
    let team_name = (new URLSearchParams(window.location.search)).get("label")
    const { currentUser } = useAuth()
    const is_staff = currentUser?.user_type == "staff"

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
                    name: item.user.first_name + " " + item.user.last_name,
                    role: item.role?.name || "Athlete",
                    user_id: item.user.id,
                    team_id: item.team_id
                })
            })
        }

        const table_columns = [
            {header: "Name", accessorKey: "name"},
            {header: "Role", accessorKey: "role"}
        ]



    return (
        <div>
            <UserInfo nav_items={default_nav}>
                {data && <div className="">
                    <Table data={data_to_render} columns={table_columns} initialPageSize={10} entity_name={team_name ? <div>{team_name}</div> : "Team members"} searchMsg={"Search Team Members"} />
                </div>}
            </UserInfo>
        </div>
    )
}
