import Form from "../../../Commons/Form";
import Button from "../../../Commons/Button";
import { usePopup } from "../../../../utils/hooks/usePopUp";
import { useApiSend } from "../../../../utils/hooks/query";
import { useForm } from "react-hook-form";
import { create_activity_attribute, update_activity_attribute } from "../../../../api/activities/sub_activities/attributes";
import { useState } from "react";
import { get_attributes } from "../../../../api/measurements/attributes";
import { useApiGet } from "../../../../utils/hooks/query";
import { queryClient } from "../../../../main";
import Popup from "../../../Commons/Popup";
import { useNavigate } from "react-router-dom";

interface activities {
    added_attributes?: [any]
    id?: string
    sub_activity_id: string
}

export default function ActivityAttributeForm({sub_activity_id, added_attributes}: activities) {
    const { hidePopup, handleHidePopup } = usePopup();
    const [selected_attributes, setSelectedAttributes] = useState([]);
    const { register, handleSubmit, reset, setValue } = useForm();
    const operation = hidePopup.type === "create" ? create_activity_attribute : (data: any) => update_activity_attribute(hidePopup.data?.attribute_id, hidePopup.data?.sub_activity_id,data);
    const { mutate, isError, isSuccess, isPending, error } = useApiSend(operation, undefined, undefined, ["sub_activity_attributes"]);
    const { data: attributes, isLoading: isAttributesLoading } = useApiGet(["measurement_attributes"], get_attributes)
    const navigate = useNavigate()

    const handle_create_more_attributes = () => {
        navigate("/attributes")
        handleHidePopup({show: true, type: "create"})
    }

    if (isAttributesLoading) {
        return <Popup><div  className="text-2xl font-bold text-secondary bg-white p-4 w-[20rem]">Fetching attributes...</div></Popup>
        }


    if (attributes && attributes.length == added_attributes?.length){
        return (
            <Popup>
                <div className="w-[24rem] text-white p-4">
                    <div  className="text font-semibold text-red-500">
                        All existing attributes have been added to this activity. You need to add new attributes.
                    </div>
                    <div className="mt-2 flex justify-between">
                        <Button text="Create more attributes" handleClick={handle_create_more_attributes} />
                        <Button text="Cancel" styling="bg-red-500" handleClick={()=>handleHidePopup({show: false, type: "create"})} />
                    </div>
                </div>
            </Popup>
        )
    }

    let attributes_to_select = attributes.filter(attribute => !selected_attributes.some(item => item.attribute_id === attribute.id));
    console.log(attributes_to_select, "attributes to select")
    console.log(added_attributes, "added attributes")
    attributes_to_select = attributes_to_select.filter(attribute => !added_attributes?.some(item => item.attribute.id === attribute.id))
    const show_selected_attributes = attributes.filter(attribute => selected_attributes.some(item => item.attribute_id === attribute.id))


    const onSubmit = (data: any) => {
        // Add the new translation to the finished_translations array
        setSelectedAttributes(prevAttributes => [
            ...prevAttributes,
            data
        ]);

        // Reset the form for the next translation input
        reset();
    };

    const submitAttributes = () => {
            // Send all translations to the API (you can adjust this API call as needed)
            let attributes_to_submit = [];
            selected_attributes.forEach(attribute => attributes_to_submit.push(attribute.attribute_id))
            mutate({ sub_activity_id: sub_activity_id, attribute_id:  attributes_to_submit}, {
                onSuccess: () => {
                    queryClient.invalidateQueries(["activity_attributes"]);
                    handleHidePopup({ show: false, type: "create" }); // Close the popup on success
                    setSelectedAttributes([]); // Clear the translations after submission
                    reset(); // Reset form fields
                },
                onError: (error) => {
                    console.error("Error submitting attributes:", error);
                },
            });
        };

    // Handle Delete button click
    const handleDelete = (index: number) => {
        // Remove the item from the finished_translations list
        const new_selected_attributes = selected_attributes.filter((_, i) => index !== i)
        setSelectedAttributes(new_selected_attributes)
        // hidePopup.type == "edit" && handleHidePopup({type: "edit", show: true, data: {id: hidePopup.data.id, activities: new_translations}})
    };


    return (
        <div>
            {/* Display the added translations */}
            <Form formTitle={hidePopup.type === "create" ? "Add attribute" : "Edit activity attributes"} handleSubmit={handleSubmit(onSubmit)}>
                {selected_attributes.length > 0 && (
                    <div className="py-4 border-b bg-white rounded-t-md w-[22rem]">
                        <h3 className="font-semibold text-secondary text-xl">Added Attributes</h3>

                        <div className="flex py-2 gap-2 flex-col">
                            {show_selected_attributes.map((item, i) => (
                                <div className="rounded-md w-full flex justify-between gap-12" key={i}>
                                    <div className="flex gap-4">
                                        <div>{item.name.en}</div>
                                    </div>
                                    <div className="flex gap-4">
                                        <Button text="Remove" styling="bg-red-500" handleClick={() => handleDelete(i)} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

            <div className="grid grid-cols-1 gap-4 items-center mt-4 w-[22rem]">
                <div className="flex w-full items-center">
                    <div className="">
                        <label htmlFor="attribute_id" className="block text-sm font-medium text-black">
                            Select Attribute
                        </label>
                        <select
                            id="attribute_id"
                            {...register("attribute_id", { required: "Attribute is required" })}
                            className="outline-none border-b-2 border-primary w-[22rem] py-2"
                        >
                        <option value={""}>Select Attribute</option>
                        {attributes_to_select.map(attribute => (
                            <option key={attribute.id} value={attribute.id}>
                                {attribute.name.en}
                            </option>
                        ))}
                        </select>
                    </div>
                </div>
            </div>

                {/* Submit Translation Button */}
                <div className="mt-6 flex justify-between items-center">
                    <div className="">
                        <Button
                            type="submit"
                            text={"Add attribute"}
                            styling="text-white px-4 py-1 rounded"
                        />
                    </div>

                    {/* Submit All Translations Button */}
                    {selected_attributes.length > 0 && (
                        <div className="">
                            <Button
                                type="button"
                                text="Submit"
                                handleClick={submitAttributes}
                                styling="bg-green-600 text-white px-4 py-1 rounded"
                            />
                        </div>
                    )}
                </div>

                {/* Error and Success Messages */}
                {isError && (
                    <div className="mt-4 text-sm text-red-600">
                        Error adding attribute: {"Something went wrong!"}
                    </div>
                )}

                {isSuccess && (
                    <div className="mt-4 text-sm text-green-600">Attribute added successfully!</div>
                )}
            </Form>
        </div>
    );
}
