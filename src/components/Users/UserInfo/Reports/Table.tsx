import { useAuth } from "../../../../utils/hooks/Auth";
import UserInfo from "../UserInfo";
import Table from "../../../Commons/Table";
import { get_user_measurements } from "../../../../api/measurements/measurements";
import { computePat, computePower, computeRSI, impulse } from "../Teams/Reports/TeamRecords/helpers";
import UserDataChart from "./Chart";
import { useApiGet } from "../../../../utils/hooks/query";
import moment from "moment";
import { useState, useEffect } from "react";
import { Tooltip } from "react-tooltip";
import UserTeamRecordsRaw from "./Raw";


export default function UserReports(){
    const { currentUser, language } = useAuth()
    const [viewType, setViewType] = useState("table")
    const athlete_id = currentUser?.id
    const {
            data,
            isLoading,
            error,
            isError
        } = useApiGet(["user_measurements", athlete_id], ()=> get_user_measurements(athlete_id))

    const [dataToRender, setDataToRender] = useState([]);
    const normalize = (str) => str.trim().toLowerCase();

useEffect(() => {
    if (!data) return;

    let rows: any[] = [];

    data.forEach((item, index) => {
    let measurement_obj = item.attribute.translations.find(tr => tr.language_code === language) || item.attribute.translations[0]
    const parent_activity_id = item.sub_activity.activity_id
    const activity_obj = item.sub_activity.translations.find(sa => sa.language_code === language) || item.sub_activity.translations[0]

    const parsed_row: Record<string, any> = {
        id: item.id,
        index: rows.length,
        athlete: `${item.athlete.first_name} ${item.athlete.last_name}`,
        athlete_id: item.athlete.id,
        start: item.start,
        role: item.role.name,
        activity: activity_obj.name,
        parent_activity_id: parent_activity_id,
        measurement: measurement_obj?.name,
        measurement_id: item.attribute.id,
        units: item.attribute.translations[0].units,
        device: item.device.device_type.name,
        note: item.note,
        created_at: item.created_at,
    };
    if (measurement_obj?.name) {
      // console.log(measurement_obj.name, "This is the name")
      parsed_row[measurement_obj.name.toLowerCase()] = parseInt(item.value);
      parsed_row.measurement = measurement_obj.name.toLowerCase()
      parsed_row.results = parseInt(item.value)
    }
    rows.push(parsed_row)
    });

    // assign RSI per group
    let enriched: any[] = [...rows];
    let currentGroup: any[] = [];

    for (let i = 0; i < enriched.length; i++) {
      const row = enriched[i];

      if (row.start) {
        // close previous group
        if (currentGroup.length > 1) {
          computeRSI(currentGroup);
          computePower(currentGroup);
          computePat(currentGroup);
        }
        currentGroup = [row];
      } else {
        currentGroup.push(row);
      }
    }

    if (currentGroup.length > 1) {
        computePower(currentGroup)
        computeRSI(currentGroup);
        computePat(currentGroup);
    }
    const filteredData = enriched.filter(item => !item._shouldRemove);
    setDataToRender(filteredData);
  }, [data, language]);




    const table_columns = [
      // {
      //   header: "Athlete",
      //   accessorKey: "athlete",
      //   cell: ({ row }) => row.original.start === true && <p className="text-xs">{row.original.athlete}</p>,
      // },
      {
        header: "Test",
        accessorKey: "activity",
        cell: ({ row }) => row.original.start === true && <p className="text-xs">{row.original.activity}</p>,
      },
      {
        header: "Date",
        accessorKey: "created_at",
        meta: "date",
        cell: ({ row }) =>
          row.original.start === true && (
            <div className="text-center">
            <p className="max-w-[8rem] text-xs truncate">{moment.utc(row.original.created_at).local().format("DD-MM-YYYY")}</p>
            <p className="max-w-[8rem] text-xs truncate">{moment.utc(row.original.created_at).local().format("HH:mm")}</p>
            </div>
          ),
      },
      {
        header: "Ct",
        accessorKey: "ct",
        cell: ({ row }) => row.original.measurement_id == "f5daa493-5054-4ad2-97b0-d9db95e7cdd6" && <p className="text-xs">{(row.original.results/1000).toFixed(3)} {row.original.units}</p>,
      },
      {
        header: "Ft",
        accessorKey: "ft",
        cell: ({ row }) => {
          if (row.original.ft || row.original.measurement_id === "d4ebb79e-a0a8-4550-8bc4-e4336b8490a3") {
          let val; //4.96*(Ft/2 * Ft/2) * 100)
          if (row.original.measurement_id === "d4ebb79e-a0a8-4550-8bc4-e4336b8490a3"){
            val = `${(row.original.results/1000).toFixed(3)} ${row.original.units}`;
          } else {
            val = `${(row.original.ft/1000).toFixed(3)} s`;
          }
          return <div className="text-xs">{val}</div>;}
        },
      },
      {
        header: "JH",
        accessorKey: "jh",
        cell: ({ row }) => {
          if (row.original.ft || row.original.measurement_id === "d4ebb79e-a0a8-4550-8bc4-e4336b8490a3") {
          let val;
          if (row.original.measurement_id === "d4ebb79e-a0a8-4550-8bc4-e4336b8490a3"){
            val = 4.903 * Math.pow((row.original.results/1000)/2, 2)*1000 ;
          } else {
            val = 4.903 * Math.pow((row.original.ft/1000)/2, 2)*1000;
          }
          return <div className="text-xs">{(val/1000).toFixed(3)} m</div>;}
        },
      },
      {
        header: "Fd",
        accessorKey: "fd",
        cell: ({ row }) => row.original.measurement_id === "73e0ac8f-b5e8-44f3-9557-2db5bb98c8ce" && <p className="text-xs">{(row.original.results/1000).toFixed(3) || ""} {row.original.units}</p>,
      },
      {
        header: "RSI",
        accessorKey: "rsi",
        cell: ({ row }) => row.original.rsi ? <div className="text-xs">{(row.original.rsi).toFixed(3)}</div> : null,
      },
      {
        header: "Wpeak",
        accessorKey: "power",
        cell: ({ row }) => {
          return row.original.power ? <div className="text-xs">{row.original.power.toFixed(3)} /kg</div> : null
        }
      },
      {
          header: `PaTpeak`,
          accessorKey: "pat",
          cell: ({ row }) => {
            return row.original.pat ? <div className={`text-xs ${row.original.colored === true && ""}`}>{row.original.pat.toFixed(3)} /kg</div> : null
          }
      },
      {
        header: "Impulse",
        accessorKey: "impulse",
        cell: ({ row }) => {
          if ((row.original.ft || row.original.measurement_id === "d4ebb79e-a0a8-4550-8bc4-e4336b8490a3") && row.original.parent_activity_id !== "39ba0d2d-4a04-46e2-9a60-e208b682601c") {
          let val; //4.96*(Ft/2 * Ft/2) * 100)
          if (row.original.measurement_id === "d4ebb79e-a0a8-4550-8bc4-e4336b8490a3"){
            val = 4.96 * Math.pow((row.original.results/1000)/2, 2)*1000 ;
            val = impulse(1, row.original.results/1000).toFixed(3)
          } else {
            val = impulse(1, row.original.ft/1000).toFixed(3)
          }
          return <div className="text-xs">{val} N/s</div>;}
        },
      },
      {
        header: "Note",
        accessorKey: "note",
        cell: ({ row }) => (
          <div className="max-w-[8rem] pr-2 truncate">
            <div data-tooltip-id="comment-tooltip" className="max-w-[6rem] truncate text-xs">
              {row.original.note}
            </div>
            <Tooltip id="comment-tooltip" place="left" className="bg-black/90">
              <div className="p-4 bg-transparent">
                <p className="bg-transparent">{row.original.note}</p>
              </div>
            </Tooltip>
          </div>
        ),
      },
    ];

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

    const action_btn =
      <div className="flex items-center rounded cursor-pointer shadow-xl">
        <button className={`${viewType === "table" ? "bg-green-500 text-white": "bg-white text-black rounded-l"} py-1 px-4 rounded-l`} onClick={()=>setViewType("table")}>Table</button>
        <button className={`${viewType === "chart" ? "bg-green-500 px-2 text-white": "bg-white text-black"}  py-1 px-4 rounded-r`} onClick={()=>setViewType("chart")}>Chart</button>
        <button className={`${viewType === "raw" ? "bg-green-500 px-2 text-white": "bg-white text-black"}  py-1 px-4 rounded-r`} onClick={()=>setViewType("raw")}>Raw</button>
      </div>

    const table_component = <div>
              {
              data ? <Table data={dataToRender} columns={table_columns} searchMode="double" actionBtn={action_btn} entity_name="Your Records" searchMsg="Search your records"/>
              : <div className="font-semibold mt-4">You don't have any records yet</div>
              }
            </div>

    const components_to_render = {
        "raw": <UserTeamRecordsRaw action_btn={action_btn} raw_data={data} />,
        "table": table_component,
        "chart": <UserDataChart action_btn={action_btn} data={dataToRender} />
      }

    return (

        data && <div>
              <UserInfo>
                {components_to_render[viewType]}
              </UserInfo>
        </div>
    )

}