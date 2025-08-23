import { useAuth } from "../../../../../utils/hooks/Auth";
import UserInfo from "../../UserInfo";
import Table from "../../../../Commons/Table";
import { get_team_measurements, delete_measurement } from "../../../../../api/measurements/measurements";
import { useApiGet } from "../../../../../utils/hooks/query";
import { useParams } from "react-router-dom";
import Button from "../../../../Commons/Button";
import { usePopup } from "../../../../../utils/hooks/usePopUp";
import Popup from "../../../../Commons/Popup";
import ConfirmModel from "../../../../Commons/ConfirmModel";
import MeasurementForm from "./Form";
import { useState, useEffect } from "react";
import moment from "moment";
import { Tooltip } from "react-tooltip";

export default function UserTeamRecords() {
  const { hidePopup, handleHidePopup } = usePopup();
  const { currentUser } = useAuth();
  const is_staff = currentUser?.user_type == "staff";
  let team_id = useParams().id;
  const [selectedId, setSelectID] = useState("");

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
        if (currentGroup.length > 1) {
          computeRSI(currentGroup);
          computePower(currentGroup);
        }
        currentGroup = [row];
      } else {
        currentGroup.push(row);
      }
    }

    if (currentGroup.length > 1) {
        computePower(currentGroup)
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

      if (normalize(a.measurement) === "contact time" && normalize(b.measurement) === "flight time") {
        a.rsi = b.results / a.results;
      }

      if (normalize(a.measurement) === "flight time" && normalize(b.measurement) === "contact time") {
        b.rsi = a.results / b.results;
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

            const measA = normalize(a.measurement);
            const measB = normalize(b.measurement);

            // only calculate when we have both contact time & flight time
            if (
            (measA === "contact time" && measB === "flight time") ||
            (measA === "flight time" && measB === "contact time")
            ) {
            let contactTime = measA === "contact time" ? a.results : b.results;
            let flightTime = measA === "flight time" ? a.results : b.results;
            flightTime = flightTime && flightTime/1000
            contactTime = contactTime && contactTime/1000

            // Power formula
            const power = ((9.8 * 9.8) * flightTime * (flightTime + contactTime)) / (4 * contactTime);

            // assign power to the row representing flight time
            if (measA === "contact time") a.power = power;
            else b.power = power;
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
      header: "Item",
      accessorKey: "activity",
      cell: ({ row }) => row.original.start === true && <p className="text-xs">{row.original.activity}</p>,
    },
    {
      header: "Date",
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
      header: "JH",
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
      cell: ({ row }) => row.original.rsi ? <div className="text-xs">{(row.original.rsi).toFixed(2)}</div> : null,
    },
    {
      header: "Power W/Kg",
      accessorKey: "power",
      cell: ({ row }) => {
        return row.original.power ? <div className="text-xs">{row.original.power.toFixed(2)}</div> : null
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

  return (
    <div>
      {hidePopup.show && !hidePopup.data.base && popup}
      <UserInfo nav_items={default_nav}>
        {dataToRender.length > 0 && <Table data={dataToRender} columns={table_columns} searchMsg="Search team records" />}
      </UserInfo>
    </div>
  );
}
