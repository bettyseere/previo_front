import Form from "../Commons/Form";
import { usePopup } from "../../utils/hooks/usePopUp";
import Button from "../Commons/Button";
import { useApiGet, useApiSend } from "../../utils/hooks/query";
import { get_device_types } from "../../api/device_types";
import { useForm } from "react-hook-form";
import { create_device, update_device } from "../../api/devices";
import { get_companies } from "../../api/companies";
import { UpdateDevice } from "../../types/Device";
import { remove_company, remove_user } from "../../api/devices";
import { toast } from "react-toastify";
import { queryClient } from "../../main";
import { useState } from "react";
import { get_company_users } from "../../api/authentication";

export default function DeviceForm({ popup }: UpdateDevice) {
    const { handleHidePopup } = usePopup();
    const [isPublic, setIsPublic] = useState(popup?.data?.is_public || false)
    const operation =
        popup.type === "create"
            ? create_device
            : (data: any) => update_device(data, popup.data.id);

    const { mutate, isError, isSuccess, isPending } = useApiSend(operation, undefined, undefined, ["devices"]);
    const { data: companies, isLoading: isCompaniesLoading } = useApiGet(["companies"], get_companies);
    const { data: device_types, isLoading: isDeviceTypesLoading } = useApiGet(["device_types"], get_device_types)
    // const { data: devices, refetch } = useApiGet(["devices"], get_devices);


    const { register, handleSubmit, reset, watch, setValue } = useForm({
    defaultValues: {
        company_id: popup.type === "edit" ? popup.data.company_id ?? "" : "",
        owner_id: popup.type === "edit" ? popup.data.owner_id ?? "" : "",
        is_public: popup.type === "edit" ? popup.data.is_public ?? false : false,
    },
    });

    const company_id = watch("company_id");

    const { data: company_users, isLoading: isCompanyUsersLoading } = useApiGet(
        ["company_users", company_id],
        () => get_company_users(company_id),
        { enabled: !!company_id }
    );

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

    const handle_remove_user = async (id: string) => {
        try {
            await remove_user(id)
            queryClient.invalidateQueries(["devices"]);
            toast("Owner removed")
            handleHidePopup({ show: false, type: "create" }); // Close the popup on success
            reset(); // Reset form fields
        } catch (error) {
            toast("Error removing company")
        }
    }

    // Handle form submission
    const onSubmit = (data: any) => {
        data.company_id == "" ? data.company_id = null: ""
        data.owner_id = data.owner_id === "" ? null : data.owner_id;
        data.is_public = isPublic;

        console.log(data, "To submit")
        // return

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
                    {popup.type == "edit" && popup.data.device_type_id ? <option value={popup.data.device_type_id}>{popup.data.device_type_name}</option>: <option value="">Select Device Type</option>}
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
                    {...register("company_id", {
                        onChange: () => setValue("owner_id", ""),
                    })}
                    className="outline-none border-b-2 border-primary w-full py-2"
                    disabled={isPublic}
                >
                    <option value="">Select Company</option>

                    {companies?.map((company: any) => (
                        <option key={company.id} value={company.id}>
                            {company.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* ignore this field for now */}
            <div className="mt-4">
                <label htmlFor="owner" className="block text-sm font-medium text-black">
                    Owner (Optional)
                </label>
                <select
                    id="owner"
                    {...register("owner_id")}
                    className="outline-none border-b-2 border-primary w-full py-2"
                    disabled={!company_id || isCompanyUsersLoading || isPublic}
                >
                    <option value="">
                        {!company_id
                            ? "Select a company first"
                            : isCompanyUsersLoading
                                ? "Loading users..."
                                : "Select Owner"}
                    </option>

                    {company_users?.map((user: any) => (
                        <option key={user.id} value={user.id}>
                            {user.first_name} {user.last_name}
                        </option>
                    ))}
                </select>
            </div>

                <div className="mt-4">
                    <label htmlFor="is_public" className="block text-sm font-medium text-black">
                        Make Public
                    </label>

                    <select
                        id="is_public"
                        {...register("is_public", {
                            setValueAs: (value) => value === "true",
                        })}
                        value={String(isPublic)}
                        onChange={(e) => setIsPublic(e.target.value === "true")}
                        className="outline-none border-b-2 border-primary w-full py-2"
                    >
                        <option value="true">Yes</option>
                        <option value="false">No</option>
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
                {popup.type == "edit" && popup.data.owner_id && <Button text="Remove Owner" styling="bg-red-600" handleClick={()=>handle_remove_user(popup.data.id)} />}
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
