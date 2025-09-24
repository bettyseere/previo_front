import { get_measurements, delete_measurement } from "../../api/measurements/measurements";
import { useApiGet } from "../../utils/hooks/query";
import ErrorLoading from "../Commons/ErrorAndLoading";
import Layout from "../../Layout/Dashboard/Layout";
import Table from "../Commons/Table";
import { usePopup } from "../../utils/hooks/usePopUp";
import Popup from "../Commons/Popup";
import ConfirmModel from "../Commons/ConfirmModel";
import MeasurementForm from "../Users/UserInfo/Teams/Reports/Form";
import { useState, useEffect, useMemo, useCallback } from "react";
import moment from "moment";
import { computeRSI, computePower, impulse, computePat } from "../Users/UserInfo/Teams/Reports/TeamRecords/helpers";
import { useAuth } from "../../utils/hooks/Auth";
import { Tooltip } from "react-tooltip";
import CompanyRecordsRaw from "./Raw";
import CompanyDataChart from "./Chart";

export default function Measurements() {
    const { hidePopup, handleHidePopup } = usePopup();
    const [selectId, setSelectID] = useState("");
    const [viewType, setViewType] = useState("table");
    const { language } = useAuth();
    
    const {
        data,
        isLoading,
        isFetching,
        isPending,
        refetch,
        error,
        isError,
        isLoadingError
    } = useApiGet(["measurements"], get_measurements);

    // Memoize the data processing to prevent unnecessary re-renders
    const dataToRender = useMemo(() => {
        if (!data) return [];

        let rows = [];

        data.forEach((item, index) => {
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
    }, [data, language]); // Only recompute when data or language changes

    const handle_remove_measurement = useCallback(async (id: string) => {
        await delete_measurement(id=id);
        refetch();
        handleHidePopup({show: false, type: "create"});
    }, [refetch, handleHidePopup]);

    const initiate_delete = useCallback((id: string) => {
        setSelectID(id);
        handleHidePopup({show: true, type: "create", confirmModel: true});
    }, [handleHidePopup]);

    const popup = useMemo(() => (
        <Popup>
            {hidePopup.confirmModel ? 
                <ConfirmModel 
                    title="Delete Measurement" 
                    message="Are you sure you want to delete this measurement?" 
                    handleSubmit={() => handle_remove_measurement(selectId)} 
                    cancel_action={() => handleHidePopup({show: false, type: "create", confirmModel: false})} 
                /> : 
                <MeasurementForm />
            }
        </Popup>
    ), [hidePopup.confirmModel, selectId, handle_remove_measurement, handleHidePopup]);

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
            cell: ({ row }) => row.original.measurement_id == "f5daa493-5054-4ad2-97b0-d9db95e7cdd6" && <p className="text-xs">{(row.original.results/1000).toFixed(3)} {row.original.units}</p>,
        },
        {
            header: "Ft",
            accessorKey: "ft",
            cell: ({ row }) => {
                if (row.original.ft || row.original.measurement_id === "d4ebb79e-a0a8-4550-8bc4-e4336b8490a3") {
                    let val;
                    if (row.original.measurement_id === "d4ebb79e-a0a8-4550-8bc4-e4336b8490a3") {
                        val = `${(row.original.results/1000).toFixed(3)} ${row.original.units}`;
                    } else {
                        val = `${(row.original.ft/1000).toFixed(3)} s`;
                    }
                    return <div className="text-xs">{val}</div>;
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
                        val = 4.903 * Math.pow((row.original.results/1000)/2, 2)*1000;
                    } else {
                        val = 4.903 * Math.pow((row.original.ft/1000)/2, 2)*1000;
                    }
                    return <div className="text-xs">{(val/1000).toFixed(3)} m</div>;
                }
                return null;
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
                return row.original.power ? <div className="text-xs">{row.original.power.toFixed(3)} /kg</div> : null;
            }
        },
        {
            header: `PaTpeak`,
            accessorKey: "pat",
            cell: ({ row }) => {
                return row.original.pat ? <div className={`text-xs ${row.original.colored === true && ""}`}>{row.original.pat.toFixed(3)} /kg</div> : null;
            }
        },
        {
            header: "Impulse",
            accessorKey: "impulse",
            cell: ({ row }) => {
                if ((row.original.ft || row.original.measurement_id === "d4ebb79e-a0a8-4550-8bc4-e4336b8490a3") && row.original.parent_activity_id !== "39ba0d2d-4a04-46e2-9a60-e208b682601c") {
                    let val;
                    if (row.original.measurement_id === "d4ebb79e-a0a8-4550-8bc4-e4336b8490a3") {
                        val = 4.96 * Math.pow((row.original.results/1000)/2, 2)*1000;
                        val = impulse(1, row.original.results/1000).toFixed(3);
                    } else {
                        val = impulse(1, row.original.ft/1000).toFixed(3);
                    }
                    return <div className="text-xs">{val} N/s</div>;
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
            <button className={`${viewType === "table" ? "bg-green-500 text-white" : "bg-white text-black rounded-l"} py-1 px-4 rounded-l`} onClick={() => setViewType("table")}>Table</button>
            <button className={`${viewType === "chart" ? "bg-green-500 px-2 text-white" : "bg-white text-black"} py-1 px-4 rounded-r`} onClick={() => setViewType("chart")}>Chart</button>
            <button className={`${viewType === "raw" ? "bg-green-500 px-2 text-white" : "bg-white text-black"} py-1 px-4 rounded-r`} onClick={() => setViewType("raw")}>Raw</button>
        </div>
    ), [viewType]);

    const table_component = useMemo(() => (
        <div>
            {dataToRender.length > 0 && <Table data={dataToRender} columns={table_columns} searchMsg="Search through records" actionBtn={action_btn} searchMode="double"/> }
        </div>
    ), [dataToRender, table_columns, action_btn]);

    const components_to_render = useMemo(() => ({
        "raw": <CompanyRecordsRaw action_btn={action_btn} raw_data={data} />,
        "table": table_component,
        "chart": <CompanyDataChart action_btn={action_btn} data={dataToRender} />
    }), [action_btn, data, table_component, dataToRender]);

    if (isLoading || isFetching || isPending) {
        return (
            <ErrorLoading>
                <div className="text-2xl font-bold text-secondary">Fetching measurements...</div>
            </ErrorLoading>
        );
    }

    if (isError || isLoadingError) {
        return (
            <ErrorLoading>
                <div className="text-2xl font-bold text-red-500">Error loading measurements</div>
            </ErrorLoading>
        );
    }

    return (
        <div>
            {hidePopup.show && popup}
            <Layout>
                {data && <div className="p-6">
                    {components_to_render[viewType]}
                </div>}
            </Layout>
        </div>
    );
}