import { useAuth } from "../../../../utils/hooks/Auth";
import UserInfo from "../UserInfo";
import Table from "../../../Commons/Table";
import { get_user_measurements, delete_measurement } from "../../../../api/measurements/measurements";
import UserDataChart from "./Chart";
import { useApiGet } from "../../../../utils/hooks/query";
import moment from "moment";
import { useState, useEffect } from "react";
import { Tooltip } from "react-tooltip";

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
        const measurement_obj = item.attribute.translations.find(tr => tr.language_code === language) || item.attribute.translations[0]
        const activity_obj = item.sub_activity.translations.find(sa => sa.language_code === language) || item.sub_activity.translations[0]
        rows.push({
            id: item.id,
            index: rows.length,
            athlete: `${item.athlete.first_name} ${item.athlete.last_name}`,
            athlete_id: item.athlete.id,
            start: item.start,
            role: item.role.name,
            activity: activity_obj?.name,
            measurement: measurement_obj.name,
            measurement_id: item.attribute.id,
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
              computePower(currentGroup);
              computePat(currentGroup)
            }
            currentGroup = [row];
          } else {
            currentGroup.push(row);
          }
        }

        if (currentGroup.length > 0) {
          computeRSI(currentGroup);
          computePower(currentGroup);
          computePat(currentGroup)
        }
        setDataToRender(enriched);
      }, [data,language]);


    const computeRSI = (group) => {
    if (group.length < 2) return;

    let sliced = group
    if (group.length > 2){
        sliced = group.slice(1, -1);
    }

    for (let i = 0; i < sliced.length - 1; i++) {
      const a = sliced[i];
      const b = sliced[i + 1];

      if (normalize(a.measurement_id) === "d4ebb79e-a0a8-4550-8bc4-e4336b8490a3" && normalize(b.measurement_id) === "f5daa493-5054-4ad2-97b0-d9db95e7cdd6_id") {
        a.rsi = b.results / a.results;
      }

      if (normalize(a.measurement_id) === "f5daa493-5054-4ad2-97b0-d9db95e7cdd6" && normalize(b.measurement_id) === "d4ebb79e-a0a8-4550-8bc4-e4336b8490a3") {
        b.rsi = a.results / b.results;
      }

      if (a._skipRow || b._skipRow) continue;

      if (a.measurement_id == "d4ebb79e-a0a8-4550-8bc4-e4336b8490a3" || b.measurement_id == "d4ebb79e-a0a8-4550-8bc4-e4336b8490a3"){
        a._rowSpan = { ...(a._rowSpan || {}), rsi: 2 };
        b._rowSpan = { ...(b._rowSpan || {}), rsi: 2 };
        a._rowSpan = { ...(a._rowSpan || {}), jh: 2 };
        b._rowSpan = { ...(b._rowSpan || {}), jh: 2 };
        a._rowSpan = { ...(a._rowSpan || {}), measurement: 2 };
        b._rowSpan = { ...(b._rowSpan || {}), measurement: 2 };
        a._rowSpan = { ...(a._rowSpan || {}), results: 2 };
        b._rowSpan = { ...(b._rowSpan || {}), results: 2 };

        // Mark next 2 rows as skipped
        if (i + 2 < sliced.length) sliced[i + 2]._skipRow = true;
        if (i + 3 < sliced.length) sliced[i + 3]._skipRow = true;
      }
    }

  };

  const computePower = (group) => {
        if (group.length < 2) return;

        // slice middle rows if group is large
        let sliced = group.length > 2 ? group.slice(1, -1) : group;

        for (let i = 0; i < sliced.length - 1; i++) {
            const a = sliced[i];
            const b = sliced[i + 1];

            const measA = normalize(a.measurement_id);
            const measB = normalize(b.measurement_id);

            // only calculate when we have both contact time & flight time
            // f5daa493-5054-4ad2-97b0-d9db95e7cdd6 contact time id
            // d4ebb79e-a0a8-4550-8bc4-e4336b8490a3 flight time id
            if (
            (measA === "f5daa493-5054-4ad2-97b0-d9db95e7cdd6" && measB === "d4ebb79e-a0a8-4550-8bc4-e4336b8490a3") ||
            (measA === "d4ebb79e-a0a8-4550-8bc4-e4336b8490a3" && measB === "f5daa493-5054-4ad2-97b0-d9db95e7cdd6")
            ) {
            let contactTime = measA === "f5daa493-5054-4ad2-97b0-d9db95e7cdd6" ? a.results : b.results;
            let flightTime = measA === "d4ebb79e-a0a8-4550-8bc4-e4336b8490a3" ? a.results : b.results;
            flightTime = flightTime && flightTime
            contactTime = contactTime && contactTime

            // Power formula
            const power = (((9.806 * 9.806) * flightTime * (flightTime + contactTime)) / (1 * contactTime))/1000;

            // assign power to the row representing flight time
            if (measA === "f5daa493-5054-4ad2-97b0-d9db95e7cdd6") a.power = power;
            else b.power = power;

            if (a._skipRow || b._skipRow) continue;

            if (a.measurement_id == "d4ebb79e-a0a8-4550-8bc4-e4336b8490a3" || b.measurement_id == "d4ebb79e-a0a8-4550-8bc4-e4336b8490a3"){
              a._rowSpan = { ...(a._rowSpan || {}), power: 2 };
              b._rowSpan = { ...(b._rowSpan || {}), power: 2 };
              
              // Mark next 2 rows as skipped
              if (i + 2 < sliced.length) sliced[i + 2]._skipRow = true;
              if (i + 3 < sliced.length) sliced[i + 3]._skipRow = true;
            }
            }
        }
    };

    const computePat = (group) => {
        if (group.length < 2) return;

        // slice middle rows if group is large
        let sliced = group.length > 2 ? group.slice(1, -1) : group;

        for (let i = 0; i < sliced.length - 1; i++) {
            const a = sliced[i];
            const b = sliced[i + 1];

            const measA = normalize(a.measurement_id);
            const measB = normalize(b.measurement_id);

            // only calculate when we have both contact time & flight time
            // f5daa493-5054-4ad2-97b0-d9db95e7cdd6 contact time id
            // d4ebb79e-a0a8-4550-8bc4-e4336b8490a3 flight time id
            if (
            (measA === "f5daa493-5054-4ad2-97b0-d9db95e7cdd6" && measB === "d4ebb79e-a0a8-4550-8bc4-e4336b8490a3") ||
            (measA === "d4ebb79e-a0a8-4550-8bc4-e4336b8490a3" && measB === "f5daa493-5054-4ad2-97b0-d9db95e7cdd6")
            ) {
            let contactTime = measA === "f5daa493-5054-4ad2-97b0-d9db95e7cdd6" ? a.results : b.results;
            let flightTime = measA === "d4ebb79e-a0a8-4550-8bc4-e4336b8490a3" ? a.results : b.results;
            flightTime = flightTime && (flightTime/1000)/2
            contactTime = contactTime && (contactTime/1000)/2
            const pc = 1 // weight


            // Power formula
            // (Pc*((1/2tv*g)/(1/2tc))+(Pc*g))/9,8
            const pat = (pc*(flightTime*9.806) / (contactTime) + (pc*9.806))/9.806

            // assign power to the row representing flight time
            if (measA === "f5daa493-5054-4ad2-97b0-d9db95e7cdd6") a.pat = pat;
            else b.pat = pat;
            }

            if (a._skipRow || b._skipRow) continue;

            if (a.measurement_id == "d4ebb79e-a0a8-4550-8bc4-e4336b8490a3" || b.measurement_id == "d4ebb79e-a0a8-4550-8bc4-e4336b8490a3"){
              a._rowSpan = { ...(a._rowSpan || {}), pat: 2 };
              b._rowSpan = { ...(b._rowSpan || {}), pat: 2 };

              // Mark next 2 rows as skipped
              if (i + 2 < sliced.length) sliced[i + 2]._skipRow = true;
              if (i + 3 < sliced.length) sliced[i + 3]._skipRow = true;
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
          header: "Val.",
          accessorKey: "measurement",
          cell: ({ row }) => <p className="text-xs">{row.original.measurement}</p>,
        },
        {
          header: "Res.",
          accessorKey: "results",
          cell: ({ row }) => <p className="text-xs">{(row.original.results/1000).toFixed(3)} {row.original.units}</p>,
        },
        {
          header: "JH",
          accessorKey: "jh",
          cell: ({ row }) => {
            if (normalize(row.original.measurement_id) !== "f5daa493-5054-4ad2-97b0-d9db95e7cdd6") return null;
            const val = 4.9 * (0.5 * (row.original.results / 1000)) ** 2;
            return <div className="text-xs">{val.toFixed(2)} m</div>;
          },
        },
        {
          header: "W/Kg",
          accessorKey: "power",
          cell: ({ row }) => {
            return row.original.power ? <div className="text-xs">{row.original.power.toFixed(3)}</div> : null
          }
        },
        {
          header: "PaT",
          accessorKey: "pat",
          cell: ({ row }) => {
            return row.original.pat ? <div className="text-xs">{row.original.pat.toFixed(3)}</div> : null
          }
        },
        {
          header: "RSI",
          accessorKey: "rsi",
          cell: ({ row }) => row.original.rsi ? <div className="text-xs">{(row.original.rsi).toFixed(3)}</div> : null,
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
      </div>



    return (
        <UserInfo>
            {viewType === "table" ? <div>
              {
              data ? <Table data={dataToRender} columns={table_columns} searchMode="double" actionBtn={action_btn} entity_name="Your Records" searchMsg="Search your records"/>
              : <div className="font-semibold mt-4">You don't have any records yet</div>
              }
            </div>: <UserDataChart data={dataToRender} action_btn={action_btn} />
            }
        </UserInfo>
    )

}