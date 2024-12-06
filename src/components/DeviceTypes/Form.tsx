import Form from "../Commons/Form";
import { usePopup } from "../../utils/hooks/usePopUp";
import Button from "../Commons/Button";
import { useApiSend, useApiGet } from "../../utils/hooks/query";
import { useForm } from "react-hook-form";
import { create_device_type, update_device_type, get_device_types } from "../../api/device_types";
import { UpdateDevice } from "../../types/Device";

export default function DeviceTypeForm({ popup }: UpdateDevice) {
    const { handleHidePopup } = usePopup();
    const operation =
        popup.type === "create"
            ? create_device_type
            : (data: any) => update_device_type(data, popup.data.id);


    const { mutate, isError, isSuccess, isPending } = useApiSend(operation, undefined, undefined, ["device_types"]);
    const { data: device_types, refetch } = useApiGet(["device_types"], get_device_types);


    const { register, handleSubmit, reset } = useForm();

    // Handle form submission
    const onSubmit = (data: any) => {
        data.company_id == "" ? data.company_id = null: ""
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


    return (
        <Form formTitle={popup.type === "create" ? "Create New Device" : "Edit Device"} handleSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 gap-4 items-center mt-4 w-[24rem]">
                <div className="">
                    <label htmlFor="serial_number" className="block text-sm font-medium text-black">
                        Name
                    </label>
                    <input
                        id="name"
                        maxLength={13}
                        defaultValue={popup.type == "edit" ? popup.data.name : ""}
                        type="text"
                        {...register("name", { required: "Name is required" })}
                        className="outline-none border-b-2 border-primary w-full py-2"
                    />
                </div>
            </div>


            {/* Submit Button */}
            <div className="mt-6">
                <Button
                    type="submit"
                    text={isPending ? "Submitting..." : popup.type === "create" ? "Create" : "Save"}
                    styling="text-white px-4 py-1 rounded"
                />
            </div>

            {/* Error and Success Messages */}
            {isError && (
                <div className="mt-4 text-sm text-red-600">Error: {"Something went wrong!"}</div>
            )}

            {isSuccess && (
                <div className="mt-4 text-sm text-green-600">
                    {popup.type === "create" ? "Device type created successfully!" : "Device updated successfully!"}
                </div>
            )}
        </Form>
    );
}
