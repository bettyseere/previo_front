import Layout from "../../Layout/Dashboard/Layout";
import { useApiGet } from "../../utils/hooks/query";
import { usePopup } from "../../utils/hooks/usePopUp";
import { get_devices } from "../../api/devices";
import Table from "../Commons/Table";
import Button from "../Commons/Button";


export default function Devices(){
    const {hidePopup, setHidePopup} = usePopup()
    const {
            data,
            isLoading,
            isFetching,
            isPending,
            error,
            isError,
            isLoadingError
        } = useApiGet(["devices"], get_devices)

        if (isLoading || isFetching || isPending){
            <div>Fetching Devices</div>
        }

        if (isError || isLoadingError){
            console.log(error)
            return (<div>Error fetching companies</div>)
        }

        console.log(data)
        let data_to_render;

        if (data){
            data_to_render = data.map(device => ({
            id: device.id,
            serial_number: device.serial_number,
            mac_address: device.mac_address,
            create_at: device.created_at,
            device_type_id: device.device_type?.id || null,
            device_type_name: device.device_type?.name || null
        }))
        }

        const table_columns = [
            {header: "Name", accessorKey: "device_type_name"},
            {header: "Mac Address", accessorKey: "mac_address"},
            {header: "Serial Number", accessorKey: "serial_number"}
        ]

        const button = <Button text="Create Device" styling="text-white py-2" />
    return (
        <Layout>
            {data && <div className="p-6">
                <Table data={data_to_render} columns={table_columns} initialPageSize={10} actionBtn={button} searchMsg={"Search Devices"} />
            </div>}
        </Layout>
    )
}