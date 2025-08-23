import { useAuth } from "../../../../utils/hooks/Auth";
import UserInfo from "../UserInfo";
import Table from "../../../Commons/Table";
import { get_user_measurements, delete_measurement } from "../../../../api/measurements/measurements";
import { useApiGet } from "../../../../utils/hooks/query";
import moment from "moment";
import { useState, useEffect } from "react";
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

    const [dataToRender, setDataToRender] = useState([]);
    const normalize = (str) => str.trim().toLowerCase();

    useEffect(() => {
        if (!data) return;
    
        let rows: any[] = [];
    
        data.forEach((item, index) => {
        rows.push({
            id: item.id,
            index: rows.length,
            athlete: `${item.athlete.first_name} ${item.athlete.last_name}`,
            athlete_id: item.athlete.id,
            start: item.start,
            role: item.role.name,
            activity: item.sub_activity.translations[0].name,
            measurement: item.attribute.translations[0].name,
            results: parseInt(item.value),
            units: item.attribute.translations[0].units,
            device: item.device.device_type.name,
            note: item.note,
            created_at: item.created_at,
        });
        });
    
        // assign RSI per group
        let enriched: any[] = [...rows];
        let currentGroup: any[] = [];
    
        for (let i = 0; i < enriched.length; i++) {
          const row = enriched[i];
    
          if (row.start) {
            // close previous group
            if (currentGroup.length > 0) {
              computeRSI(currentGroup);
            }
            currentGroup = [row];
          } else {
            currentGroup.push(row);
          }
        }
    
        if (currentGroup.length > 0) {
          computeRSI(currentGroup);
        }
    
        setDataToRender(enriched);
      }, [data]);


    const computeRSI = (group) => {
    if (group.length < 2) return;

    let sliced = group
    if (group.length > 2){
        sliced = group.slice(1, -1);
    }

    for (let i = 0; i < sliced.length - 1; i++) {
      const a = sliced[i];
      const b = sliced[i + 1];

      if (normalize(a.measurement) === "tempo di contatto" && normalize(b.measurement) === "flight time") {
        a.rsi = b.results / a.results;
      }

      if (normalize(a.measurement) === "flight time" && normalize(b.measurement) === "tempo di contatto") {
        b.rsi = a.results / b.results;
      }
    }
  };

      const table_columns = [
        // {
        //   header: "Athlete",
        //   accessorKey: "athlete",
        //   cell: ({ row }) => row.original.start === true && <p className="text-xs">{row.original.athlete}</p>,
        // },
        {
          header: "Activity",
          accessorKey: "activity",
          cell: ({ row }) => row.original.start === true && <p className="text-xs">{row.original.activity}</p>,
        },
        {
          header: "Date/Time",
          accessorKey: "created_at",
          cell: ({ row }) =>
            row.original.start === true && (
              <p className="max-w-[8rem] text-xs truncate">{moment.utc(row.original.created_at).local().format("YYYY-MM-DD HH:mm:ss")}</p>
            ),
        },
        {
          header: "Attribute",
          accessorKey: "measurement",
          cell: ({ row }) => <p className="text-xs">{row.original.measurement}</p>,
        },
        {
          header: "Results",
          accessorKey: "results",
          cell: ({ row }) => <p className="text-xs">{row.original.results} {row.original.units}</p>,
        },
        {
          header: "Jump Height",
          accessorKey: "id",
          cell: ({ row }) => {
            if (normalize(row.original.measurement) !== "flight time") return null;
            const val = 4.9 * (0.5 * (row.original.results / 1000)) ** 2;
            return <div className="text-xs">{val.toFixed(2)}</div>;
          },
        },
        {
          header: "RSI",
          accessorKey: "rsi",
          cell: ({ row }) => row.original.rsi ? <div className="text-xs">{(row.original.rsi/1000).toFixed(2)}</div> : null,
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



    return (
        <UserInfo>
            {
            data ? <Table data={dataToRender} columns={table_columns} entity_name="Your Records" searchMsg="Search your records"/>
            : <div className="font-semibold mt-4">You don't have any records yet</div>
            }
        </UserInfo>
    )

}