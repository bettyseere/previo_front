import CompanyLayout from "../CompanyDetails";
import { useApiGet } from "../../../utils/hooks/query";
import { get_company_devices, remove_user } from "../../../api/devices";
import { useParams } from "react-router-dom";
import { useAuth } from "../../../utils/hooks/Auth";
import Table from "../../Commons/Table";
import Popup from "../../Commons/Popup";
import AddUserToDeviceForm from "./Form";
import ErrorLoading from "../../Commons/ErrorAndLoading";
import { usePopup } from "../../../utils/hooks/usePopUp";
import { toast } from "react-toastify";
import Button from "../../Commons/Button";
import { useNavigate } from "react-router-dom";

export default function CompanyDevices() {
    const navigate = useNavigate()
    const { currentUser } = useAuth()
    const { hidePopup, handleHidePopup } = usePopup()
    let company_id: any = useParams();
    company_id = company_id.id

    const is_admin = currentUser?.user_type == "admin"
    is_admin ? company_id = currentUser?.company: company_id = company_id

    const { data, isError, isLoading, error, refetch } = useApiGet(
        ["company_devices", company_id],
        () => get_company_devices(company_id)
    );

    const handle_remove_user = async (id: string) => {
        try {
            await remove_user(id)
            toast("Owner removed")
            refetch()
        } catch (error) {
            toast("Error removing owner")
        }
    }

    const popup = <Popup>
                <AddUserToDeviceForm popup={hidePopup} company_id={company_id} />
            </Popup>


    if (isLoading) {
        return (
            <ErrorLoading>
                <div  className="text-2xl font-bold text-secondary">Fetching devices ...</div>
            </ErrorLoading>
        )
    }

    if (isError) {
        return (
            <div>
            {hidePopup.show && popup}
            <ErrorLoading>
                <div className="flex items-center justify-center flex-col gap-4">
                    <div  className="text-xl font-bold text-red-400">{error.response.status === 404 ? "No devices found": "Error fetching devices"}</div>
                    {error.response.status == 404 && <Button text="Add Device" handleClick={()=>navigate("/device_types")}/>}
                </div>
            </ErrorLoading>
            </div>
        )
    }

    let data_to_render;

        if (data){
            data_to_render = data.map(device => ({
            id: device.id,
            serial_number: device.serial_number,
            mac_address: device.mac_address,
            create_at: device.created_at,
            owner: `${device.owner ? device.owner.first_name + " " + device.owner.last_name: ""}`,
            owner_id: `${device.owner ? device.owner.id: ""}`,
            device_type_id: device.device_type?.id || "",
            device_type_name: device.device_type?.name || ""
        }))
        }

        const table_columns = [
            {header: "Name", accessorKey: "device_type_name"},
            {header: "Mac Address", accessorKey: "mac_address"},
            {header: "Serial Number", accessorKey: "serial_number"},
            {header: "Owner", accessorKey: "owner"},
            {
            header: "Modify Owner",
            accessorKey: "id",
            cell: ({ cell, row }) => {
                console.log(row.original)
                return <div className="flex gap-4 justify-center items-center">
                    <div onClick={()=>handleHidePopup({show: true, type: row.original.owner ? "edit": "create", data: row.original})} className="shadow-md p-2 rounded-md hover:scale-110 hover:duration-150">{row.original.owner ? "Change": "Assign"}
                    </div>
                    {row.original.owner && <div onClick={()=>handle_remove_user(row.original.id)} className="shadow-md p-2 rounded-md hover:scale-110 hover:duration-150">Remove</div>}
                    {/* <div className="shadow-md p-2 rounded-md hover:scale-110 hover:duration-150">
                        <PiPen size={20} className="text-primary" />
                    </div> */}
                </div>
                }
            }
        ]

        console.log(data[0], "This is the data we need")

    return (
        <div>
            {hidePopup.show && popup}
            <CompanyLayout>
                <Table data={data_to_render} entity_name={data && data[0].company ? data[0].company.name: ""} searchMsg="Search Devices" columns={table_columns} />
            </CompanyLayout>
        </div>
    );
}