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
import { computePat, computePower, computeRSI, impulse } from "./helpers";

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


  // ⬇️ Build enriched rows (with RSI) whenever `data` changes
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
      cell: ({ row }) => (row.original.ft || row.original.measurement_id === "d4ebb79e-a0a8-4550-8bc4-e4336b8490a3") && <p className="text-xs">{(row.original.ft/1000).toFixed(3)} {row.original.units}</p>,
    },
    {
      header: "JH",
      accessorKey: "jh",
      cell: ({ row }) => {
        if (!row.original.ft) return null;
        const val = 4.9 * (0.5 * (row.original.results / 1000)) ** 2;
        return <div className="text-xs">{val.toFixed(3)} m</div>;
      },
    },
    {
      header: "Fd",
      accessorKey: "fd",
      cell: ({ row }) => row.original.fd && <p className="text-xs">{(row.original.fd/1000).toFixed(3) || ""} {row.original.units}</p>,
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
      header: "Impulse",
      accessorKey: "impulse",
      cell: ({ row }) => (row.original.ft || row.original.measurement_id === "d4ebb79e-a0a8-4550-8bc4-e4336b8490a3") && <p className="text-xs">{(impulse(1, row.original.results)).toFixed(3)} {""}</p>,
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
