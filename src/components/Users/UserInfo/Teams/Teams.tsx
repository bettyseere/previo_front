import { useAuth } from "../../../../utils/hooks/Auth";
import Table from "../../../Commons/Table";
import UserInfo from "../../UserInfo/UserInfo";


export default function UserTeams(){
    const { currentUser } = useAuth()
    const user_teams = currentUser?.teams || []
    console.log(user_teams)
    let data_to_render = []

    // get team members from server

    user_teams.forEach(team =>
        {

            team.role && data_to_render.push({id: team.team.id, name: team.team.name, role: team.role?.name || "Athlete", access_mode: team.access_type})
        }
    )

    const table_columns = [
        {
            header: "Name",
            accessorKey: "name",
            cell: ({ cell, row }) => {
                const { role, id, name } = row.original;
                const href = role === "Athlete" ? "/reports" : `/teams/${id}?label=${name}`;

                return (
                    <div className="text-secondary font-semibold">
                        <a href={href}>{name}</a>
                    </div>
                );
            },
        },
        {
            header: "Role",
            accessorKey: "role",
        },
    ];


    return (
        <UserInfo>
            {data_to_render.length > 0 ? <Table searchMsg="Search your teams" data={data_to_render} columns={table_columns} entity_name="Your teams" />: <div>
                <p className="font-semibold">You are not part of any team yet.</p>
                </div>
            }
        </UserInfo>
    )

}