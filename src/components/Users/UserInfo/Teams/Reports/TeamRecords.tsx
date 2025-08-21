import { useAuth } from "../../../../../utils/hooks/Auth";
import UserInfo from "../../UserInfo";
import Table from "../../../../Commons/Table";
import {  get_team_measurements } from "../../../../../api/measurements/measurements";
import { useApiGet } from "../../../../../utils/hooks/query";
import { useParams } from "react-router-dom";
import Button from "../../../../Commons/Button";
import { usePopup } from "../../../../../utils/hooks/usePopUp";
import Popup from "../../../../Commons/Popup";
import ConfirmModel from "../../../../Commons/ConfirmModel";
import MeasurementForm from "./Form";
import { delete_measurement } from "../../../../../api/measurements/measurements";
import { useState } from "react";
import moment from "moment";


export default function UserTeamRecords(){
    const {hidePopup, handleHidePopup} = usePopup()
    const { currentUser } = useAuth()
    const is_staff = currentUser?.user_type == "staff"
    let team_id = useParams().id
    const [selectedId, setSelectID] = useState("")

    let user_team = currentUser?.teams
    user_team = user_team?.find(team => team.team.id == team_id)
    const role_id = user_team?.role.id
    const access_type = user_team?.access_type

    const default_nav = [
        {name: "Team Members", path: is_staff ? "/teams/"+team_id: "/profile/teams/"+team_id},
        {name: "Team Records", path: is_staff ? "/teams/"+team_id+"/records": "/profile/teams/"+team_id+"/records"}
    ]
    const {
            data,
            isLoading,
            isError,
            error,
            refetch
        } = useApiGet(["user_measurements", team_id, access_type], ()=> get_team_measurements(team_id, access_type, role_id))

    let data_to_render = []

    const handle_remove_measurement = async (id: string) => {
            await delete_measurement(id=id)
            refetch()
            handleHidePopup({show: false, type: "create"})
        }

    const popup = <Popup>
            {hidePopup.confirmModel ? <ConfirmModel title="Delete Measurement" message="Are you sure you want to delete this measurement?" handleSubmit={()=>handle_remove_measurement(selectedId)} cancel_action={()=>handleHidePopup({show: false, type: "create", confirmModel: false})} /> : <MeasurementForm />}
        </Popup>

    data && data.forEach(item => {
        // console.log(item, "this is a measurement")
        data_to_render.push({
            id: item.id,
            athlete: `${item.athlete.first_name} ${item.athlete.last_name}`,
            athlete_id: item.athlete.id,
            start: item.start,
            role: item.role.name,
            activity: item.sub_activity.translations[0].name,
            measurement: item.attribute.translations[0].name,
            results: item.value + item.attribute.translations[0].units,
            device: item.device.device_type.name
        })
    })

    const find_pair = (id) => {
        const pair = data.filter(item => item.id === id)
        console.log(pair.length, "This is a pair")
        return "Found pair"
    }
    const table_columns = [
        {header: "Athlete", accessorKey: "athlete", cell: ({cell, row}) => {
                return row.original.start === true &&  <p>{row.original.athlete}</p>
            }},
        {header: "Activity", accessorKey: "activity", cell: ({cell, row}) => {
                return row.original.start === true &&  <p>{row.original.activity}</p>
            }},
        {header: "Device", accessorKey: "device", cell: ({cell, row}) => (
            row.original.start === true && <div>{row.original.device}</div>
        )},
        {
            header: "Date/Time",
            accessorKey: "created_at",
            cell: ({cell, row}) => {
                return row.original.start === true &&  <p>{moment.utc(row.original.created_at).local().format("YYYY-MM-DD HH:mm:ss")}</p>
            }
        },
        {header: "Attribute", accessorKey: "measurement"},
        {header: "Results", accessorKey: "results"},
        {
            header: "Jump Height", accessorKey: "id",
            cell: ({cell, row}) => {
                const val = 4.9*(0.5 * parseInt(row.original.results)) ** 2
                return <div>{row.original.measurement.toLowerCase() === "flight time" && (val).toFixed(2)}</div>
        }
        }
        ]

    if (isError){
        return <UserInfo nav_items={default_nav}>
            <div className="w-full flex justify-center flex-col items-center mt-28">
                {hidePopup.show && popup}
                <div  className="text-xl font-bold text-red-400">{error.response.status === 404 ? "No records found": "Error fetching records"}</div>
                <div>{error.response.status == 404 && <Button text="Add Records" handleClick={()=>handleHidePopup({show: true, type: "create", data: {base: false}})} />}</div>
            </div>
        </UserInfo>
    }


    if (isLoading){
        return(
            <div>
            {hidePopup.show && popup}
            <UserInfo nav_items={default_nav}>
                <p className="font-semibold mt-4">Loading records</p>
            </UserInfo>
            </div>
        )
    }

    const button = <Button handleClick={()=>handleHidePopup({show: true, type: "create", data: {base: false}})} text="Create Measurement" styling="text-white py-2" />

    return (
        <div>
        {hidePopup.show && !hidePopup.data.base && popup}
        <UserInfo nav_items={default_nav}>
            {
            data && <Table data={data_to_render} columns={table_columns} searchMsg="Search team records"/>
            }
        </UserInfo>
        </div>
    )

}
