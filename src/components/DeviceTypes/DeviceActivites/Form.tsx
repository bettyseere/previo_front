import Form from "../../Commons/Form";
import { usePopup } from "../../../utils/hooks/usePopUp";
import Button from "../../Commons/Button";
import { useApiSend, useApiGet } from "../../../utils/hooks/query";
import { useForm } from "react-hook-form";
import { useParams } from "react-router-dom";
import Dropdown from "../../Commons/Dropdown";
import { create_device_activity } from "../../../api/device_activities";
import { get_activities } from "../../../api/activities/activities";
import { queryClient } from "../../../main";

export default function DeviceActivitiesForm() {
    const { handleHidePopup, hidePopup } = usePopup();
    const operation = create_device_activity
    const device_type_id: any = useParams()


    const { mutate, isError, isSuccess,  isPending } = useApiSend(operation, undefined, undefined, ["device_activities"]);
    const { data: activities } = useApiGet(["activities"], get_activities);


    const { register, handleSubmit, reset, control } = useForm();

    // Handle form submission
    const onSubmit = (data: any) => {
        data.device_type_id = device_type_id.id
        mutate(data, {
            onSuccess: () => {
                handleHidePopup({ show: false, type: "create" }); // Close the popup on success
                reset(); // Reset form fields
                queryClient.invalidateQueries(["device_activities"]);
            },
            onError: (error) => {
                console.error("Error inviting company user:", error);
            },
        });
    };


    return (
        <Form formTitle="Create New Device Activity" handleSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 gap-4 items-center mt-4 w-[24rem]">
                <div className="">
                    <label htmlFor="serial_number" className="block text-sm font-medium text-black mb-2">
                        Select Activity
                    </label>
                    <Dropdown
                        name="activity_id"
                        options={activities ? activities.map(activity => ({value: activity.id, label: activity.name.en})): []}
                        control={control}
                        onSelect={(val) => console.log("Selected:", val)}
                        rules={{ required: "Activity is required" }}
                    />
                </div>
            </div>


            {/* Submit Button */}
            <div className="mt-6">
                <Button
                    type="submit"
                    text={isPending ? "Submitting..." : "Submit"}
                    styling="text-white px-4 py-1 rounded"
                />
            </div>

            {/* Error and Success Messages */}
            {isError && (
                <div className="mt-4 text-sm text-red-600">Error: {"Something went wrong!"}</div>
            )}

            {isSuccess && (
                <div className="mt-4 text-sm text-green-600">
                    Device type created successfully!
                </div>
            )}
        </Form>
    );
}
