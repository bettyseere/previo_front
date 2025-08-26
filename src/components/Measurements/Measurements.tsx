import { get_measurements, delete_measurement } from "../../api/measurements/measurements";
import { useApiGet } from "../../utils/hooks/query";
import ErrorLoading from "../Commons/ErrorAndLoading";
import Layout from "../../Layout/Dashboard/Layout";
import Table from "../Commons/Table";
import { usePopup } from "../../utils/hooks/usePopUp";
import Popup from "../Commons/Popup";
import ConfirmModel from "../Commons/ConfirmModel";
import MeasurementForm from "../Users/UserInfo/Teams/Reports/Form";
import { useState } from "react";
import moment from "moment";
import { useAuth } from "../../utils/hooks/Auth";


export default function Measurements(){
    const {hidePopup, handleHidePopup} = usePopup()
    const [selectId, setSelectID] = useState("")
    const {language} = useAuth()
    const {
            data,
            isLoading,
            isFetching,
            isPending,
            refetch,
            error,
            isError,
            isLoadingError
        } = useApiGet(["measurements"], get_measurements)

    const handle_remove_measurement = async (id: string) => {
        await delete_measurement(id=id)
        refetch()
        handleHidePopup({show: false, type: "create"})
    }

    const initiate_delete = (id: string
    ) => {
        setSelectID(id)
        handleHidePopup({show: true, type: "create", confirmModel: true})
    }

    const popup = <Popup>
            {hidePopup.confirmModel ? <ConfirmModel title="Delete Measurement" message="Are you sure you want to delete this measurement?" handleSubmit={()=>handle_remove_measurement(selectId)} cancel_action={()=>handleHidePopup({show: false, type: "create", confirmModel: false})} /> : <MeasurementForm />}
        </Popup>


    if (isLoading || isFetching || isPending){
        return (
            <ErrorLoading>
                <div  className="text-2xl font-bold text-secondary">Fetching measurements...</div>
            </ErrorLoading>
        )
    }

    let data_to_render;

    if (data){
        data_to_render = data.map(measurement => {
            let sub_activity_name;
            sub_activity_name = measurement.sub_activity.translations.find(ac => ac.language_code === language)?.name || measurement.sub_activity.translations[0].name
            const attribute_name = measurement.attribute ? measurement.attribute.translations.find(at => at.language_code == language)?.name || measurement.attribute.translations[0].name: null
            const attribute_units = measurement.attribute ? measurement.attribute.translations[0].units: null
            const results = measurement.value
            return {
                id: measurement.id,
                sub_activity: {id: measurement.sub_activity.id, name: sub_activity_name},
                attribute: {name: attribute_name, units: attribute_units,  id: measurement.attribute ? measurement.attribute.id: null},
                device: measurement.device,
                athlete: measurement.athlete,
                results: results,
                start: measurement.start,
                created_at: measurement.created_at,
                updated_at: measurement.updated_at
            }
        })
    }

    const table_columns = [
        {
            header: "Activity",
            accessorKey: "sub_activity",
            cell: ({cell, row}) => (
                // <a className="" href="">
                    <div>
                        {row.original.start === true && row.original.sub_activity.name}
                    </div>
                // </a>
            )
        },
        {
            header: "Device",
            accessorKey: "device",
            cell: ({cell, row}) => (
                <a className="" href="">
                    <div>
                        {row.original.device.device_type.name}
                    </div>
                </a>
            )
        },
        {
            header: "Attribute",
            accessorKey: "attribute",
            cell: ({cell, row}) => (
                <a className="" href="">
                    <div>
                        {row.original.attribute.name}
                    </div>
                </a>
            )
        },
        {
            header: "Athlete",
            accessorKey: "athlete",
            cell: ({cell, row}) => (
                <div>
                    {row.original.athlete.first_name} {row.original.athlete.last_name}
                </div>
            )
        },
        {
            header: "Date/Time",
            accessorKey: "created_at",
            cell: ({cell, row}) => {
                return row.original.start === true && <p>{moment.utc(row.original.created_at).local().format("YYYY-MM-DD HH:mm:ss")}</p>
            }
        },

        {
            header: "Results",
            accessorKey: "results",
            cell: ({cell, row}) => (
                <div>
                    {row.original.results} {row.original.attribute.units}
                </div>
            )
        }
        // {
        //     header: "Actions",
        //     accessorKey: "id",
        //     cell: ({ cell, row }) => (
        //         <div className="flex gap-8 justify-center items-center px-4">
        //             <div onClick={()=>initiate_delete(row.original.id)} className="shadow-md p-2 rounded-md hover:scale-110 hover:duration-150">
        //                 <BsTrash size={20} color="red" />
        //             </div>
        //             <div className="hidden shadow-md p-2 rounded-md hover:scale-110 hover:duration-150">
        //                 <PiPen size={20} className="text-primary" />
        //             </div>
        //         </div>
        //     )
        // }
    ]


    return (
        <div>
            {hidePopup.show && popup}
            <Layout>
                {data && <div className="p-6">
                    <Table
                        data={data_to_render}
                        columns={table_columns} 
                        initialPageSize={10}
                        searchMsg={"Search Measurements"}
                        enableColumnVisibility={true}
                        // enableColumnFilters={true}
                    />
                </div>}
            </Layout>
        </div>
    )
}