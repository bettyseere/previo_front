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
import { useState, useMemo, useCallback } from "react";
import moment from "moment";
import { Tooltip } from "react-tooltip";
import TeamDataChart from "./Chart";
import { computePat, computePower, computeRSI, impulse } from "./helpers";
import UserTeamRecordsRaw from "./Raw";

export default function UserTeamRecords() {
  const { hidePopup, handleHidePopup } = usePopup();
  const { currentUser, language } = useAuth();
  const is_staff = currentUser?.user_type == "staff";
  let team_id = useParams().id;
  const [selectedId, setSelectID] = useState("");
  const team_name = localStorage.getItem("current_team") + " records" || "Team records";
  const [viewType, setViewType] = useState("table");

  const safeNumber = (v: any): number | undefined => {
    const n = typeof v === "string" ? parseFloat(v) : Number(v);
    return Number.isFinite(n) ? n : undefined;
  };

  // Helper function to safely format numbers with fallback
  const safeFormat = (value: any, decimals: number = 3, fallback: string = ""): string => {
    const num = safeNumber(value);
    return num !== undefined ? num.toFixed(decimals) : fallback;
  };

  const user_team = currentUser?.teams?.find((team) => team.team.id == team_id);
  const role_id = user_team?.role.id;
  const access_type = user_team?.access_type;

  const default_nav = useMemo(() => [
    { name: "Team Members", path: is_staff ? "/teams/" + team_id : "/profile/teams/" + team_id },
    { name: "Team Records", path: is_staff ? "/teams/" + team_id + "/records" : "/profile/teams/" + team_id + "/records" },
  ], [is_staff, team_id]);

  const { data, isLoading, isError, error, refetch } = useApiGet(
    ["user_measurements", team_id, access_type],
    () => get_team_measurements(team_id, access_type, role_id)
  );

  // Memoize the data processing to prevent unnecessary re-renders
  const dataToRender = useMemo(() => {
    if (!data) return [];

    let rows = [];

    data.forEach((item) => {
      let measurement_obj = item.attribute.translations.find(tr => tr.language_code === language) || item.attribute.translations[0];
      const parent_activity_id = item.sub_activity.activity_id;
      const activity_obj = item.sub_activity.translations.find(sa => sa.language_code === language) || item.sub_activity.translations[0];

      const parsed_row = {
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
        parsed_row[measurement_obj.name.toLowerCase()] = parseInt(item.value);
        parsed_row.measurement = measurement_obj.name.toLowerCase();
        parsed_row.results = parseInt(item.value);
      }
      rows.push(parsed_row);
    });

    // assign RSI per group
    let enriched = [...rows];
    let currentGroup = [];

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
      computePower(currentGroup);
      computeRSI(currentGroup);
      computePat(currentGroup);
    }
    
    return enriched.filter(item => !item._shouldRemove);
  }, [data, language]);

  const handle_remove_measurement = useCallback(async (id: string) => {
    await delete_measurement(id);
    refetch();
    handleHidePopup({ show: false, type: "create" });
  }, [refetch, handleHidePopup]);

  const initiate_delete = useCallback((id: string) => {
    setSelectID(id);
    handleHidePopup({ show: true, type: "create", confirmModel: true });
  }, [handleHidePopup]);

  const popup = useMemo(() => (
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
  ), [hidePopup.confirmModel, selectedId, handle_remove_measurement, handleHidePopup]);

  const table_columns = useMemo(() => [
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
      cell: ({ row }) => {
        if (row.original.measurement_id == "f5daa493-5054-4ad2-97b0-d9db95e7cdd6") {
          const value = safeFormat(row.original.results / 1000, 3);
          return value ? <p className="text-xs">{value} {row.original.units}</p> : null;
        }
        return null;
      },
    },
    {
      header: "Ft",
      accessorKey: "ft",
      cell: ({ row }) => {
        if (row.original.ft || row.original.measurement_id === "d4ebb79e-a0a8-4550-8bc4-e4336b8490a3") {
          let val;
          if (row.original.measurement_id === "d4ebb79e-a0a8-4550-8bc4-e4336b8490a3") {
            val = safeFormat(row.original.results / 1000, 3);
          } else {
            val = safeFormat(row.original.ft / 1000, 3);
          }
          return val ? (
            <div className="text-xs">
              {val} {row.original.measurement_id === "d4ebb79e-a0a8-4550-8bc4-e4336b8490a3" ? row.original.units : "s"}
            </div>
          ) : null;
        }
        return null;
      },
    },
    {
      header: "JH",
      accessorKey: "jh",
      cell: ({ row }) => {
        if (row.original.ft || row.original.measurement_id === "d4ebb79e-a0a8-4550-8bc4-e4336b8490a3") {
          let val;
          if (row.original.measurement_id === "d4ebb79e-a0a8-4550-8bc4-e4336b8490a3") {
            val = 4.903 * Math.pow((safeNumber(row.original.results) || 0) / 1000 / 2, 2) * 1000;
          } else {
            val = 4.903 * Math.pow((safeNumber(row.original.ft) || 0) / 1000 / 2, 2) * 1000;
          }
          const formattedVal = safeFormat(val / 1000, 3);
          return formattedVal ? <div className="text-xs">{formattedVal} m</div> : null;
        }
        return null;
      },
    },
    {
      header: "Fd",
      accessorKey: "fd",
      cell: ({ row }) => {
        if (row.original.fd) {
          const value = safeFormat(row.original.fd / 1000, 3);
          return value ? <p className="text-xs">{value} {row.original.fd_units}</p> : null;
        }
        return null;
      },
    },
    {
      header: "RSI",
      accessorKey: "rsi",
      cell: ({ row }) => {
        const value = safeFormat(row.original.rsi, 3);
        return value ? <div className="text-xs">{value}</div> : null;
      },
    },
    {
      header: "Wpeak",
      accessorKey: "power",
      cell: ({ row }) => {
        const value = safeFormat(row.original.power, 3);
        return value ? <div className="text-xs">{value} /kg</div> : null;
      }
    },
    {
      header: `PaTpeak`,
      accessorKey: "pat",
      cell: ({ row }) => {
        const value = safeFormat(row.original.pat, 3);
        return value ? (
          <div className={`text-xs ${row.original.colored === true ? "" : ""}`}>
            {value} /kg
          </div>
        ) : null;
      }
    },
    {
      header: "Impulse",
      accessorKey: "impulse",
      cell: ({ row }) => {
        if ((row.original.ft || row.original.measurement_id === "d4ebb79e-a0a8-4550-8bc4-e4336b8490a3") && 
            row.original.parent_activity_id !== "39ba0d2d-4a04-46e2-9a60-e208b682601c") {
          let val;
          if (row.original.measurement_id === "d4ebb79e-a0a8-4550-8bc4-e4336b8490a3") {
            val = 4.96 * Math.pow((safeNumber(row.original.results) || 0) / 1000 / 2, 2) * 1000;
            val = impulse(1, (safeNumber(row.original.results) || 0) / 1000);
          } else {
            val = impulse(1, (safeNumber(row.original.ft) || 0) / 1000);
          }
          const formattedVal = safeFormat(val, 3);
          return formattedVal ? <div className="text-xs">{formattedVal} N/s</div> : null;
        }
        return null;
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
  ], [language]);

  const action_btn = useMemo(() => (
    <div className="flex items-center rounded cursor-pointer shadow-xl">
      <button 
        className={`${viewType === "table" ? "bg-green-500 text-white" : "bg-white text-black rounded-l"} py-1 px-4 rounded-l`} 
        onClick={() => setViewType("table")}
      >
        Table
      </button>
      <button 
        className={`${viewType === "chart" ? "bg-green-500 px-2 text-white" : "bg-white text-black"} py-1 px-4 rounded-r`} 
        onClick={() => setViewType("chart")}
      >
        Chart
      </button>
      <button 
        className={`${viewType === "raw" ? "bg-green-500 px-2 text-white" : "bg-white text-black"} py-1 px-4 rounded-r`} 
        onClick={() => setViewType("raw")}
      >
        Raw
      </button>
    </div>
  ), [viewType]);

  const table_component = useMemo(() => (
    <div>
      {dataToRender.length > 0 && (
        <Table 
          data={dataToRender} 
          columns={table_columns} 
          searchMsg="Search team records" 
          actionBtn={action_btn} 
          searchMode="double" 
          entity_name={team_name} 
          back_path="/teams"
        />
      )}
    </div>
  ), [dataToRender, table_columns, action_btn, team_name]);

  const components_to_render = useMemo(() => ({
    "raw": <UserTeamRecordsRaw action_btn={action_btn} raw_data={data} />,
    "table": table_component,
    "chart": <TeamDataChart action_btn={action_btn} data={dataToRender} />
  }), [action_btn, data, table_component, dataToRender]);

  if (isError) {
    return (
      <UserInfo nav_items={default_nav}>
        <div className="w-full flex justify-center flex-col items-center mt-28">
          {hidePopup.show && popup}
          <div className="text-xl font-bold text-red-400">
            {error?.response?.status === 404 ? "No records found" : "Error fetching records"}
          </div>
          <div>
            {error?.response?.status == 404 && (
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

  return (
    data && (
      <div>
        {hidePopup.show && !hidePopup.data?.base && popup}
        <UserInfo nav_items={default_nav}>
          {components_to_render[viewType]}
        </UserInfo>
      </div>
    )
  );
}
