import Form from "../../Commons/Form";
import { usePopup } from "../../../utils/hooks/usePopUp";
import Button from "../../Commons/Button";
import { useApiSend, useApiGet } from "../../../utils/hooks/query";
import { useForm } from "react-hook-form";
import { useParams } from "react-router-dom";
import Dropdown from "../../Commons/Dropdown";
import { create_device_attribute, update_device_attribute } from "../../../api/device_attributes";
import { get_attributes } from "../../../api/measurements/attributes";
import { queryClient } from "../../../main";

export default function DeviceAttributesForm() {
    const { handleHidePopup, hidePopup } = usePopup();
    const operation = hidePopup.type === "edit" ?(data: any) => update_device_attribute(data, hidePopup.data.device_type_id, hidePopup.data.attribute_id) :create_device_attribute
    const device_type_id: any = useParams()


    const { mutate, isError, isSuccess,  isPending } = useApiSend(operation, undefined, undefined, ["device_type_attributes"]);
    const { data: attributes } = useApiGet(["attributes"], get_attributes);


    const { register, handleSubmit, reset, control } = useForm();

    // Handle form submission
    const onSubmit = (data: any) => {
        data.device_type_id = device_type_id.id
        if (hidePopup.type === "create"){
            data.attributes = [
                {
                    id: data.attribute_id,
                    position: data.position
                }
            ]
        }
        mutate(data, {
            onSuccess: () => {
                handleHidePopup({ show: false, type: "create" }); // Close the popup on success
                reset(); // Reset form fields
                queryClient.invalidateQueries({ queryKey: ["device_type_attributes"] });
            },
            onError: (error) => {
                console.error("Error inviting company user:", error);
            },
        });
    };


    return (
        <Form formTitle="Create New Device Activity" handleSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 gap-4 items-center mt-4 w-[24rem]">
                {hidePopup.type === "create" && <div className="">
                    <label htmlFor="serial_number" className="block text-sm font-medium text-black mb-2">
                        Select Attribute
                    </label>
                    <Dropdown
                        name="attribute_id"
                        options={attributes ? attributes.map(attribute => ({value: attribute.id, label: attribute.name.en})): []}
                        control={control}
                        onSelect={(val) => console.log("Selected:", val)}
                        rules={{ required: "Activity is attribute" }}
                    />
                </div>}
                <div>
                    <label htmlFor="position" className="block text-sm font-medium text-black mb-2">
                        Position
                    </label>
                    <input
                        id="position"
                        maxLength={13}
                        defaultValue={hidePopup?.type == "edit" ? hidePopup.data?.position : ""}
                        type="number"
                        {...register("position", { required: "Position is required" })}
                        className="outline-none border-b-2 border-primary w-full py-2"
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
                    Device attribute successfully!
                </div>
            )}
        </Form>
    );
}
