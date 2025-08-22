import { useAuth } from "../../../../utils/hooks/Auth";
import UserInfo from "../UserInfo";
import Table from "../../../Commons/Table";
import { get_user_measurements, delete_measurement } from "../../../../api/measurements/measurements";
import { useApiGet } from "../../../../utils/hooks/query";
import moment from "moment";
import { Tooltip } from "react-tooltip";

export default function UserReports(){
    const { currentUser } = useAuth()
    const athlete_id = currentUser?.id
    const {
            data,
            isLoading,
            error,
            isError
        } = useApiGet(["user_measurements", athlete_id], ()=> get_user_measurements(athlete_id))

    let data_to_render = []

    data && data.forEach(item => {
        console.log(item)
        data_to_render.push({
            id: item.id,
            index: data_to_render.length,
            activity: item.sub_activity.translations[0].name,
            measurement: item.attribute.translations[0].name,
            results: item.value,
            units: item.attribute.translations[0].units,
            device: item.device.device_type.name,
            start: item.start,
            created_at: item.created_at,
            updated_at: item.updated_at,
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
        {
            header: "Activity", accessorKey: "activity",
            cell: ({cell, row}) => {
                // console.log(row.original.start, "row")
                // <a className="" href="">
                    return <div>
                    {row.original.start === true && row.original.activity}
                    </div>
                // </a>
            }
        },
        {
                    header: "Date/Time",
                    accessorKey: "created_at",
                    cell: ({cell, row}) => {
                        return row.original.start === true &&  <p className="text-xs">{moment.utc(row.original.created_at).local().format("YYYY-MM-DD HH:mm:ss")}</p>
                    }
                },
            // {header: "Device", accessorKey: "device"},
        {header: "Attribute", accessorKey: "measurement", cell: ({cell, row}) => {
            return <p className="text-xs">{row.original.measurement}</p>
        }},
        {header: "Results", accessorKey: "results", cell: ({cell, row}) => {
            return <p className="text-xs">{row.original.results} {row.original.units}</p>
        }},
        {
            header: "RSI", accessorKey: "id"+"_rsi",
            cell: ({cell, row}) => {
                const rows = find_pair(row)
                let val = null;
                if (rows !== null){
                    console.log(rows, "pairs")
                    val = (rows?.end.results / rows?.start.results)
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
            header: "Jump Height", accessorKey: "id",
            cell: ({cell, row}) => {
                let val = 0;
                if (row.original.measurement.toLowerCase() === "flight time"){
                    val = 4.9*(0.5 * (parseInt(row.original.results)/1000)) ** 2
                }
                return row.original.start === true && <div className="text-xs">{row.original.measurement.toLowerCase() === "flight time" && (val).toFixed(2)}</div>
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
        // {
        //     header: "Delete",
        //     accessorKey: "id",
        //     cell: ({cell, row}) => {
        //         return <div onClick={()=>{
        //             delete_measurement(row.original.id).then(()=>{
        //                 // window.location.reload()
        //                 console.log("Deleted")
        //             })
        //         }} className="underline">Delete</div>
        //     }
        // }
        ]

    if (isError){
        <UserInfo>
            <p className="font-semibold mt-4">Error loading records</p>
        </UserInfo>
    }

    if (isLoading){
        return(
            <UserInfo>
                <p className="font-semibold mt-4">Loading your records</p>
            </UserInfo>
        )
    }



    return (
        <UserInfo>
            {
            data ? <Table data={data_to_render} columns={table_columns} entity_name="Your Records" searchMsg="Search your records"/>
            : <div className="font-semibold mt-4">You don't have any records yet</div>
            }
        </UserInfo>
    )

}