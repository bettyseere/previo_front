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
import { Tooltip } from "react-tooltip";


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

    data && data.forEach((item, index) => {
        // console.log(item, "this is a measurement")
        data_to_render.push({
            id: item.id,
            index: data_to_render.length,
            athlete: `${item.athlete.first_name} ${item.athlete.last_name}`,
            athlete_id: item.athlete.id,
            start: item.start,
            role: item.role.name,
            activity: item.sub_activity.translations[0].name,
            measurement: item.attribute.translations[0].name,
            results: parseInt(item.value),
            units: item.attribute.translations[0].units,
            device: item.device.device_type.name,
            note: item.note
        })
    })

    const find_pair = (row) => {
        let start_row = null;
        let end_row = null;

        if (row.original.start === true){
            start_row = row.original
        }

        if (start_row !== null){
            const end_index = start_row.index+1

            if (data_to_render[end_index].start === false){
                end_row = data_to_render[end_index]
            }
        }

        if ((start_row !== null) && (end_row !== null)){
            return {start: start_row, end: end_row}
        } else {
            return null
        }
    }

    const table_columns = [
        {header: "Athlete", accessorKey: "athlete", cell: ({cell, row}) => {
                return row.original.start === true &&  <p className="text-xs">{row.original.athlete}</p>
            }},
        {header: "Activity", accessorKey: "activity", cell: ({cell, row}) => {
                return row.original.start === true &&  <p className="text-xs">{row.original.activity}</p>
            }},
        {
            header: "Date/Time",
            accessorKey: "created_at",
            cell: ({cell, row}) => {
                return row.original.start === true && <p className="max-w-[8rem] text-xs truncate">{moment.utc(row.original.created_at).local().format("YYYY-MM-DD HH:mm:ss")}</p>
            }
        },
        {header: "Attribute", accessorKey: "measurement", cell: ({cell, row}) => {
                return <p className="text-xs">{row.original.measurement}</p>
            }},
        {header: "Results", accessorKey: "results", cell: ({cell, row}) => {
                return <p className="text-xs">{row.original.results} {row.original.units}</p>
            }},
        {
            header: "Jump Height", accessorKey: "id",
            cell: ({cell, row}) => {
                let val = 0;
                if (row.original.measurement.toLowerCase() === "flight time"){
                    val = 4.9*(0.5 * (row.original.results/1000)) ** 2
                }
                return row.original.start === true && <div className="text-xs">{row.original.measurement.toLowerCase() === "flight time" && (val).toFixed(2)}</div>
        }
        },
        {
            header: "RSI", accessorKey: "id"+"_rsi",
            cell: ({cell, row}) => {
                const rows = find_pair(row)
                let val = null;
                if (rows !== null){
                    console.log(rows, "pairs")
                    val = ((rows?.end.results/1000) / (rows?.start.results/1000))
                }
                // if (row.original.measurement.toLowerCase() === "flight time"){
                //     val = 4.9*(0.5 * (parseInt(row.original.results)/1000)) ** 2
                // }
                return row.original.start === true && <div className="text-xs">{val?.toFixed(2)}</div>
            }
        },
        {
            header: "Power W/Kg", accessorKey: "id"+"_power",
            cell: ({cell, row}) => {
                const rows = find_pair(row)
                let val = null;
                if (rows !== null){
                    console.log(rows, "pairs")
                    val = ((9.9*9) * (rows.end.results/1000) * ((rows.end.results/1000) + (rows.start.results/1000)))/(4*(rows.start.results/1000))
                }
                // if (row.original.measurement.toLowerCase() === "flight time"){
                //     val = 4.9*(0.5 * (parseInt(row.original.results)/1000)) ** 2
                // }
                return row.original.start === true && <div className="text-xs">{val?.toFixed(2)}</div>
            }
        },
        {
            header: "Note", accessorKey: "note", cell: ({cell, row}) => {
                return <div className="max-w-[8rem] pr-2 truncate">
                    <div data-tooltip-id="comment-tooltip" className="max-w-[6rem] truncate text-xs">
                        {row.original.note}
                    </div>
                    <Tooltip id="comment-tooltip" place="left" className="bg-black/90">
                        <div className="p-4 bg-transparent">
                            <p className="bg-transparent">{row.original.note}</p>
                        </div>
                    </Tooltip>
                </div>
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


// 4,9*((1/2*(Tv/1000))*(1/2*(Tv/1000)))