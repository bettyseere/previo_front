import { useAuth } from "../../../../../../utils/hooks/Auth";
import Table from "../../../../../Commons/Table";
import { useParams } from "react-router-dom";
import moment from "moment";
import { Tooltip } from "react-tooltip";
import { useState, useEffect } from "react";
import { ReactNode } from "react";

interface Props {
    action_btn?: ReactNode;
    raw_data: any[];
}


export default function UserTeamRecordsRaw({raw_data, action_btn}: Props) {
    const { currentUser, language } = useAuth();
    const is_staff = currentUser?.user_type == "staff";
    let team_id = useParams().id;
    const team_name = localStorage.getItem("current_team") + " records" || "Team records"

    let user_team = currentUser?.teams;
    user_team = user_team?.find((team) => team.team.id == team_id);


    const [dataToRender, setDataToRender] = useState([]);

    const safeNumber = (v: any): number | undefined => {
    const n = typeof v === "string" ? parseFloat(v) : Number(v);
    return Number.isFinite(n) ? n : undefined;
    };


    // ⬇️ Build enriched rows (with RSI) whenever `data` changes
    useEffect(() => {
        if (!raw_data) return;

        let rows: any[] = [];

        raw_data.forEach((item, index) => {
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
                created_at: item.created_at
            });
        });

        setDataToRender(rows);
    }, [raw_data, language]);


    const table_columns = [
        {
            header: "Athlete",
            accessorKey: "athlete",
            cell: ({ row }) => row.original.start === true && <p className="text-xs">{row.original.athlete}</p>,
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
            header: "Test",
            accessorKey: "activity",
            cell: ({ row }) => row.original.start === true && <p className="text-xs">{row.original.activity}</p>,
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
        }
    ];


    return (
        raw_data && <div>
            <div>
                {dataToRender.length > 0 && <Table data={dataToRender} columns={table_columns} searchMsg="Search team records" actionBtn={action_btn} searchMode="double" entity_name={team_name} back_path="/teams"/> }
            </div>
        </div>
    );
}
