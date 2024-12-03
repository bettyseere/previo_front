import Form from "../../Commons/Form";
import { usePopup } from "../../../utils/hooks/usePopUp";
import Button from "../../Commons/Button";
import { useApiGet, useApiSend } from "../../../utils/hooks/query";
import { get_company_users } from "../../../api/authentication";
import { useForm } from "react-hook-form";
import { update_device, get_company_devices } from "../../../api/devices";
import { UpdateDevice } from "../../../types/Device";

export default function AddUserToDeviceForm({ company_id }: {company_id: string}) {
    const { hidePopup, handleHidePopup } = usePopup();
    const operation = (data: any) => update_device(data, hidePopup.data.id);

    const { mutate, isError, isSuccess, isPending } = useApiSend(operation, undefined, undefined, ["devices"]);
    const { data: company_users, isLoading: isLoadingCompanyUsers } = useApiGet(["company_users", company_id], () => get_company_users(company_id, false))
    const { refetch } = useApiGet(["company_devices", company_id], () => get_company_devices(company_id));


    const { register, handleSubmit, reset } = useForm();

    // Handle form submission
    const onSubmit = (data: any) => {
        mutate(data, {
            onSuccess: () => {
                refetch()
                handleHidePopup({ show: false, type: "create" }); // Close the popup on success
                reset(); // Reset form fields
            },
            onError: (error) => {
                console.error("Error inviting company user:", error);
            },
        });
    };

    if (isLoadingCompanyUsers) {
        return <div>Loading users...</div>;
    }


    return (
        <Form formTitle={hidePopup.type === "create" ? "Add owner to device" : "Change device owner"} handleSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 gap-4 items-center mt-4 w-[24rem]">

                <div className="mt-4">
                <label htmlFor="owner" className="block text-sm font-medium text-black">
                    Device Owner
                </label>
                <select
                    id="owner_id"
                    {...register("owner_id", { required: "Owner is required" })}
                    className="outline-none border-b-2 border-primary w-full py-2"
                >
                    {/* Show the current owner in the first option when editing */}
                    {hidePopup.type === "edit" && hidePopup.data?.owner_id && (
                        <option value={hidePopup.data.owner_id}>{hidePopup.data.owner}</option>
                    )}
                    {/* Filter out the current owner from the company_users list */}
                    {company_users
                        ?.filter((user: any) => hidePopup.type == "edit" ? user.id !== hidePopup.data.owner_id: company_users)
                        .map((user: any) => (
                            <option key={user.id} value={user.id}>
                                {user.first_name + " " + user.last_name}
                            </option>
                        ))}
                </select>
            </div>
            </div>


            {/* Submit Button */}
            <div className="mt-6">
                <Button
                    type="submit"
                    text={isPending ? "Submitting..." : hidePopup.type === "create" ? "Create" : "Save"}
                    styling="text-white px-4 py-1 rounded"
                />
            </div>

            {/* Error and Success Messages */}
            {isError && (
                <div className="mt-4 text-sm text-red-600">Error: {"Something went wrong!"}</div>
            )}

            {isSuccess && (
                <div className="mt-4 text-sm text-green-600">
                    {hidePopup.type === "create" ? "Device created successfully!" : "Device updated successfully!"}
                </div>
            )}
        </Form>
    );
}
