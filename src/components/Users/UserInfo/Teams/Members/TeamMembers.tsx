import Layout from "../../../../../Layout/Dashboard/Layout";
import { useApiGet } from "../../../../../utils/hooks/query";
import { usePopup } from "../../../../../utils/hooks/usePopUp";
import { get_team_members } from "../../../../../api/team_members";
import Table from "../../../../Commons/Table";
import Button from "../../../../Commons/Button";
import ErrorLoading from "../../../../Commons/ErrorAndLoading";
import { useState } from "react";
import { useParams } from "react-router-dom";
import UserInfo from "../../UserInfo";


export default function UserTeamMembers(){
    let team_id = useParams().id
    let team_name = (new URLSearchParams(window.location.search)).get("label")

    const {
            data,
            isLoading,
            isFetching,
            isPending,
            error,
            isError,
            isLoadingError
        } = useApiGet(["team_members", team_id], ()=>get_team_members(team_id))



        if (isLoading || isFetching || isPending){
            return (
                <UserInfo>
                    <div  className="text-2xl font-bold text-secondary">Fetching team members...</div>
                </UserInfo>
            )
        }

        if (isError || isLoadingError){
            return (
                <UserInfo>
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
            <UserInfo>
                {data && <div className="">
                    <Table data={data_to_render} columns={table_columns} initialPageSize={10} entity_name={team_name ? team_name + " team members" : ""} searchMsg={"Search Team Members"} />
                </div>}
            </UserInfo>
        </div>
    )
}
