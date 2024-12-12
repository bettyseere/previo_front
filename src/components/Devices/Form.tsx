import Form from "../Commons/Form";
import { usePopup } from "../../utils/hooks/usePopUp";
import Button from "../Commons/Button";
import { useApiGet, useApiSend } from "../../utils/hooks/query";
import { get_devices } from "../../api/devices";
import { get_device_types } from "../../api/device_types";
import { useForm } from "react-hook-form";
import { create_device, update_device } from "../../api/devices";
import { get_companies } from "../../api/companies";
import { UpdateDevice } from "../../types/Device";
import { remove_company } from "../../api/devices";
import { toast } from "react-toastify";
import { queryClient } from "../../main";

export default function DeviceForm({ popup }: UpdateDevice) {
    const { handleHidePopup } = usePopup();
    const operation =
        popup.type === "create"
            ? create_device
            : (data: any) => update_device(data, popup.data.id);

    const { mutate, isError, isSuccess, isPending } = useApiSend(operation, undefined, undefined, ["devices"]);
    const { data: companies, isLoading: isCompaniesLoading } = useApiGet(["companies"], get_companies);
    const { data: device_types, isLoading: isDeviceTypesLoading } = useApiGet(["device_types"], get_device_types)
    const { data: devices, refetch } = useApiGet(["devices"], get_devices);


    const { register, handleSubmit, reset } = useForm();

     const handle_remove_company = async (id: string) => {
        try {
            await remove_company(id)
            queryClient.invalidateQueries(["devices"]);
            toast("Company removed")
            handleHidePopup({ show: false, type: "create" }); // Close the popup on success
            reset(); // Reset form fields
        } catch (error) {
            toast("Error removing company")
        }
    }

    // Handle form submission
    const onSubmit = (data: any) => {
        data.company_id == "" ? data.company_id = null: ""
        mutate(data, {
            onSuccess: () => {
                queryClient.invalidateQueries(["devices"]);
                handleHidePopup({ show: false, type: "create" }); // Close the popup on success
                reset(); // Reset form fields
                // refetch()
            },
            onError: (error) => {
                console.error("Error inviting company user:", error);
            },
        });
    };

    if (isCompaniesLoading) {
        return <div>Loading companies...</div>;
    }

    if (isDeviceTypesLoading){
        return <div>Loading Device Types...</div>
    }

    return (
        <Form formTitle={popup.type === "create" ? "Create New Device" : "Edit Device"} handleSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-2 gap-4 items-center mt-4 w-[36rem]">
                <div className="">
                    <label htmlFor="serial_number" className="block text-sm font-medium text-black">
                        Serial Number
                    </label>
                    <input
                        id="serial_number"
                        maxLength={13}
                        defaultValue={popup.type == "edit" ? popup.data.serial_number : ""}
                        type="text"
                        {...register("serial_number", { required: "Serial number is required" })}
                        className="outline-none border-b-2 border-primary w-full py-2"
                    />
                </div>

                <div>
                    <label htmlFor="mac_address" className="block text-sm font-medium text-black">
                        Mac Address
                    </label>
                    <input
                        id="mac_address"
                        type="text"
                        defaultValue={popup.type == "edit" ? popup.data.mac_address : ""}
                        {...register("mac_address", { required: "Mac address is required" })}
                        className="outline-none border-b-2 border-primary w-full py-2"
                    />
                </div>

                <div className="mt-4">
                <label htmlFor="device_type" className="block text-sm font-medium text-black">
                    Device Type
                </label>
                <select
                    id="device_type"
                    {...register("device_type_id", { required: "Device type is required" })}
                    className="outline-none border-b-2 border-primary w-full py-2"
                >
                    {popup.type === "create" && <option value="">Select Device Type</option>}
                    {popup.type == "edit" && popup.data.device_type_id ? <option value={popup.data.device_type_id}>{popup.data.device_type_name}</option>: <option value="">Select Company</option>}
                    {device_types?.map((device_type: any) => (
                        <option key={device_type.id} value={device_type.id}>
                            {device_type.name}
                        </option>
                    ))}
                </select>
            </div>

            <div className="mt-4">
                <label htmlFor="device_type" className="block text-sm font-medium text-black">
                    Company (Optional)
                </label>
                <select
                    id="company"
                    {...register("company_id")} // No 'required' rule here
                    className="outline-none border-b-2 border-primary w-full py-2"
                >
                    {popup.type === "create" && <option value="">Select Company</option>}
                    {popup.type == "edit" && popup.data.company ? <option value={popup.data.company_id}>{popup.data.company}</option>: <option value="">Select Company</option>}
                    {companies?.map((company: any) => (
                        <option key={company.id} value={company.id}>
                            {company.name}
                        </option>
                    ))}
                </select>
            </div>
            </div>


            {/* Submit Button */}
            <div className={`mt-6 ${popup.type == "edit" && popup.data.company_id ? "flex gap-4": ""}`}>
                <Button
                    type="submit"
                    text={isPending ? "Submitting..." : popup.type === "create" ? "Create" : "Save"}
                    styling="text-white px-4 py-1 rounded"
                />
                {popup.type == "edit" && popup.data.company_id && <Button text="Remove Company" styling="bg-red-600" handleClick={()=>handle_remove_company(popup.data.id)} />}
            </div>

            {/* Error and Success Messages */}
            {isError && (
                <div className="mt-4 text-sm text-red-600">Error: {"Something went wrong!"}</div>
            )}

            {isSuccess && (
                <div className="mt-4 text-sm text-green-600">
                    {popup.type === "create" ? "Device created successfully!" : "Device updated successfully!"}
                </div>
            )}
        </Form>
    );
}
