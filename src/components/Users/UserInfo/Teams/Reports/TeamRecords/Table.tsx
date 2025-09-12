import { useAuth } from "../../../../../../utils/hooks/Auth";
import UserInfo from "../../../UserInfo";
import Table from "../../../../../Commons/Table";
import { get_team_measurements, delete_measurement } from "../../../../../../api/measurements/measurements";
import { useApiGet } from "../../../../../../utils/hooks/query";
import { useParams } from "react-router-dom";
import Button from "../../../../../Commons/Button";
import { usePopup } from "../../../../../../utils/hooks/usePopUp";
import Popup from "../../../../../Commons/Popup";
import ConfirmModel from "../../../../../Commons/ConfirmModel";
import MeasurementForm from "../Form";
import { useState, useEffect } from "react";
import moment from "moment";
import { Tooltip } from "react-tooltip";
import TeamDataChart from "./Chart";

export default function UserTeamRecords() {
  const { hidePopup, handleHidePopup } = usePopup();
  const { currentUser, language } = useAuth();
  const is_staff = currentUser?.user_type == "staff";
  let team_id = useParams().id;
  const [selectedId, setSelectID] = useState("");
  const team_name = localStorage.getItem("current_team") + " records" || "Team records"
  const [viewType, setViewType] = useState("table")

  let user_team = currentUser?.teams;
  user_team = user_team?.find((team) => team.team.id == team_id);
  const role_id = user_team?.role.id;
  const access_type = user_team?.access_type;

  const default_nav = [
    { name: "Team Members", path: is_staff ? "/teams/" + team_id : "/profile/teams/" + team_id },
    { name: "Team Records", path: is_staff ? "/teams/" + team_id + "/records" : "/profile/teams/" + team_id + "/records" },
  ];

  const { data, isLoading, isError, error, refetch } = useApiGet(
    ["user_measurements", team_id, access_type],
    () => get_team_measurements(team_id, access_type, role_id)
  );

  const [dataToRender, setDataToRender] = useState([]);

  const handle_remove_measurement = async (id: string) => {
    await delete_measurement((id = id));
    refetch();
    handleHidePopup({ show: false, type: "create" });
  };

  const popup = (
    <Popup>
      {hidePopup.confirmModel ? (
        <ConfirmModel
          title="Delete Measurement"
          message="Are you sure you want to delete this measurement?"
          handleSubmit={() => handle_remove_measurement(selectedId)}
          cancel_action={() => handleHidePopup({ show: false, type: "create", confirmModel: false })}
        />
      ) : (
        <MeasurementForm />
      )}
    </Popup>
  );

  const normalize = (str) => str.trim().toLowerCase();


  // ⬇️ Build enriched rows (with RSI) whenever `data` changes
  useEffect(() => {
    if (!data) return;

    let rows: any[] = [];

    data.forEach((item, index) => {
    let measurement_obj = item.attribute.translations.find(tr => tr.language_code === language) || item.attribute.translations[0]
    const activity_obj = item.sub_activity.translations.find(sa => sa.language_code === language) || item.sub_activity.translations[0]
    const parsed_row: Record<string, any> = {
        id: item.id,
        index: rows.length,
        athlete: `${item.athlete.first_name} ${item.athlete.last_name}`,
        athlete_id: item.athlete.id,
        start: item.start,
        role: item.role.name,
        activity: activity_obj.name,
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

    setDataToRender(enriched);
  }, [data, language]);

  const computeRSI = (group) => {
    if (group.length < 2) return;

    // f5daa493-5054-4ad2-97b0-d9db95e7cdd6 contact time id
    // d4ebb79e-a0a8-4550-8bc4-e4336b8490a3 flight time id
    let sliced = group
    if (group.length > 2){
        sliced = group.slice(1, -1);
    }

    for (let i = 0; i < sliced.length - 1; i++) {
      const a = sliced[i];
      const b = sliced[i + 1];

      // Skip if either row is already marked as skipped

      if (normalize(a.measurement_id) === "d4ebb79e-a0a8-4550-8bc4-e4336b8490a3" && normalize(b.measurement_id) === "f5daa493-5054-4ad2-97b0-d9db95e7cdd6") {
        b.rsi = a.results / b.results;
      }

      if (normalize(a.measurement_id) === "f5daa493-5054-4ad2-97b0-d9db95e7cdd6" && normalize(b.measurement_id) === "d4ebb79e-a0a8-4550-8bc4-e4336b8490a3") {
        a.rsi =  b.results / a.results;
      }

      if (a._skipRow || b._skipRow) continue;

      if (a.measurement_id == "d4ebb79e-a0a8-4550-8bc4-e4336b8490a3" || b.measurement_id == "d4ebb79e-a0a8-4550-8bc4-e4336b8490a3"){
        a._rowSpan = { ...(a._rowSpan || {}), rsi: 2 };
        b._rowSpan = { ...(b._rowSpan || {}), rsi: 2 };
        a._rowSpan = { ...(a._rowSpan || {}), jh: 2 };
        b._rowSpan = { ...(b._rowSpan || {}), jh: 2 };
        a._rowSpan = { ...(a._rowSpan || {}), ct: 2 };
        b._rowSpan = { ...(b._rowSpan || {}), ct: 2 };
        a._rowSpan = { ...(a._rowSpan || {}), ft: 2 };
        b._rowSpan = { ...(b._rowSpan || {}), ft: 2 };
        a._rowSpan = { ...(a._rowSpan || {}), fd: 2 };
        b._rowSpan = { ...(b._rowSpan || {}), fd: 2 };
        // a._rowSpan = { ...(a._rowSpan || {}), results: 2 };
        // b._rowSpan = { ...(b._rowSpan || {}), results: 2 };
        
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

        // Skip if either row is already marked as skipped
        // if (a._skipRow || b._skipRow) continue;

        // console.log(a.results, b.results)

        const measA = normalize(a.measurement_id);
        const measB = normalize(b.measurement_id);

        // only calculate when we have both contact time & flight time
        // f5daa493-5054-4ad2-97b0-d9db95e7cdd6 contact time id
        // d4ebb79e-a0a8-4550-8bc4-e4336b8490a3 flight time id
        // tv - flighttime tc - contact time
        if (
        (measA === "f5daa493-5054-4ad2-97b0-d9db95e7cdd6" && measB === "d4ebb79e-a0a8-4550-8bc4-e4336b8490a3") ||
        (measA === "d4ebb79e-a0a8-4550-8bc4-e4336b8490a3" && measB === "f5daa493-5054-4ad2-97b0-d9db95e7cdd6")
        ) {
        let tc = measA === "f5daa493-5054-4ad2-97b0-d9db95e7cdd6" ? a.results : b.results;
        let tv = measA === "d4ebb79e-a0a8-4550-8bc4-e4336b8490a3" ? a.results : b.results;
        const g = 9.806

        // Power formula
        // ((g*g)*Tv*(Tv+Tc))/(4*Tc*Nj)
        const power = (((g * g) * tv * (tv + tc)) / (4 * tc))/1000;

        // assign power to the row representing flight time
        if (measA === "f5daa493-5054-4ad2-97b0-d9db95e7cdd6") {
          a.power = power;
        }
        else {
          b.power = power;
        }

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

        // Skip if either row is already marked as skipped
        // if (a._skipRow || b._skipRow) continue;

        const measA = normalize(a.measurement_id);
        const measB = normalize(b.measurement_id);

        const contact_id = "f5daa493-5054-4ad2-97b0-d9db95e7cdd6";
        const flight_id = "d4ebb79e-a0a8-4550-8bc4-e4336b8490a3";

        // only calculate when we have both contact time & flight time
        if (
            (measA === contact_id && measB === flight_id) ||
            (measA === flight_id && measB === contact_id)
        ) {
            let contactTime = (measA === contact_id ? a.results : b.results) / 1000; // convert ms to s
            let flightTime = (measA === flight_id ? a.results : b.results) / 1000; // convert ms to s
            const pc = 1; // weight
            const g = 9.806;

            // console.log("Raw values - Contact:", contactTime, "Flight:", flightTime);

            const pat = (pc*((flightTime*g)/(contactTime))+(pc*g))/9.806

            // console.log("Calculated PAT:", pat);

            // assign PAT to the appropriate row
            if (measA === contact_id) {
                a.pat = pat;
            } else {
                b.pat = pat;
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
    }
  };

  const table_columns = [
    {
      header: "Athlete",
      accessorKey: "athlete",
      cell: ({ row }) => row.original.start === true && <p className="text-xs">{row.original.athlete}</p>,
    },
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
      cell: ({ row }) => row.original.ct && <p className="text-xs">{(row.original.ct/1000).toFixed(3)} {row.original.units}</p>,
    },
    {
      header: "Ft",
      accessorKey: "ft",
      cell: ({ row }) => row.original.ft && <p className="text-xs">{(row.original.ft/1000).toFixed(3)} {row.original.units}</p>,
    },
    {
      header: "JH",
      accessorKey: "jh",
      cell: ({ row }) => {
        if (normalize(row.original.measurement_id) !== "d4ebb79e-a0a8-4550-8bc4-e4336b8490a3") return null;
        const val = 4.9 * (0.5 * (row.original.results / 1000)) ** 2;
        return <div className="text-xs">{val.toFixed(3)} m</div>;
      },
    },
    {
      header: "Fd",
      accessorKey: "fd",
      cell: ({ row }) => row.original.fd && <p className="text-xs">{(row.original.fd/1000).toFixed(3)} {row.original.units}</p>,
    },
    {
      header: "RSI",
      accessorKey: "rsi",
      cell: ({ row }) => row.original.rsi ? <div className="text-xs">{(row.original.rsi).toFixed(3)}</div> : null,
    },
    {
      header: "Wpeak/Kg",
      accessorKey: "power",
      cell: ({ row }) => {
        return row.original.power ? <div className="text-xs">{row.original.power.toFixed(3)}</div> : null
      }
    },
    {
        header: "PaTpeak",
        accessorKey: "pat",
        cell: ({ row }) => {
          return row.original.pat ? <div className={`text-xs ${row.original.colored === true && ""}`}>{row.original.pat.toFixed(3)}</div> : null
        }
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

  if (isError) {
    return (
      <UserInfo nav_items={default_nav}>
        <div className="w-full flex justify-center flex-col items-center mt-28">
          {hidePopup.show && popup}
          <div className="text-xl font-bold text-red-400">
            {error?.response.status === 404 ? "No records found" : "Error fetching records"}
          </div>
          <div>
            {error.response.status == 404 && (
              <Button
                text="Add Records"
                handleClick={() => handleHidePopup({ show: true, type: "create", data: { base: false } })}
              />
            )}
          </div>
        </div>
      </UserInfo>
    );
  }

  if (isLoading) {
    return (
      <div>
        {hidePopup.show && popup}
        <UserInfo nav_items={default_nav}>
          <p className="font-semibold mt-4">Loading records</p>
        </UserInfo>
      </div>
    );
  }

  const action_btn =
      <div className="flex items-center rounded cursor-pointer shadow-xl">
        <button className={`${viewType === "table" ? "bg-green-500 text-white": "bg-white text-black rounded-l"} py-1 px-4 rounded-l`} onClick={()=>setViewType("table")}>Table</button>
        <button className={`${viewType === "chart" ? "bg-green-500 px-2 text-white": "bg-white text-black"}  py-1 px-4 rounded-r`} onClick={()=>setViewType("chart")}>Chart</button>
      </div>

  return (
    <div>
      {hidePopup.show && !hidePopup.data.base && popup}
      <UserInfo nav_items={default_nav}>
        {viewType === "table" ? <div>
          {dataToRender.length > 0 && <Table data={dataToRender} columns={table_columns} searchMsg="Search team records" actionBtn={action_btn} searchMode="double" entity_name={team_name} back_path="/teams"/> }
        </div>:
        <TeamDataChart action_btn={action_btn} data={dataToRender} />}
      </UserInfo>
    </div>
  );
}
