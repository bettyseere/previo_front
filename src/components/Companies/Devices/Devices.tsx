import CompanyLayout from "../CompanyDetails";
import { useApiGet } from "../../../utils/hooks/query";
import { get_company_devices } from "../../../api/devices";
import { useParams } from "react-router-dom";
import { BsHouseFill, BsMailbox, BsPeople, BsTablet } from "react-icons/bs";
import { BiBuildingHouse } from "react-icons/bi";
import { GrLocationPin } from "react-icons/gr";
import { FaPeopleGroup } from "react-icons/fa6";
import { useAuth } from "../../../utils/hooks/Auth";
import Layout from "../../../Layout/Dashboard/Layout";
import Table from "../../Commons/Table";

export default function CompanyDevices() {
    const { currentUser } = useAuth()
    let company_id: any = useParams();
    company_id = company_id.id

    const is_admin = currentUser?.user_type == "admin"
    is_admin ? company_id = currentUser?.company: company_id = company_id

    const { data, isError, isLoading } = useApiGet(
        ["company_devices", company_id],
        () => get_company_devices(company_id!)
    );

    if (isLoading) {
        return <Layout><div>Loading devices...</div></Layout>;
    }

    if (isError) {
        return <Layout><div>Error fetching devices. Please try again later.</div></Layout>;
    }

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




    return (
        <CompanyLayout>
           <Table data={data_to_render} searchMsg="Search Devices" columns={table_columns} />
        </CompanyLayout>
    );
}
