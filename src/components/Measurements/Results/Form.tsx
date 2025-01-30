import Form from "../../Commons/Form";
import Button from "../../Commons/Button";
import { usePopup } from "../../../utils/hooks/usePopUp";
import { useApiSend } from "../../../utils/hooks/query";
import { useForm } from "react-hook-form";
import { create_result, update_result } from "../../../api/measurements/results";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { queryClient } from "../../../main"
import { useEffect } from "react";


export default function ResultForm() {
    const { hidePopup, handleHidePopup } = usePopup();
    const [finished_translations, setFinishedTranslations] = useState(hidePopup.data?.activities || []);
    const { register, handleSubmit, reset, setValue } = useForm();
    const operation = hidePopup.type === "create" ? create_result : (data: any) =>  hidePopup.data.id && update_result(hidePopup.data.id, data);
    const { mutate, isError, isSuccess } = useApiSend(operation, undefined, undefined, ["measurement_results"]);
    const measurement_id = useParams().id

    // Handle form submission for adding a translation
    const onSubmit = (data: any) => {
        data.measurement_id = measurement_id
        mutate(data, {
            onSuccess: () => {
                queryClient.invalidateQueries(["measurement_results"]);
                handleHidePopup({ show: false, type: "create" }); // Close the popup on success
                reset(); // Reset form fields
                // refetch()
            },
            onError: (error) => {
                console.error("Error inviting company user:", error);
            },
        });
    };

    // Handle Edit button click
    const handleEdit = (index: number) => {
        const itemToEdit = finished_translations[index];

        // Debug logs
        console.log("Editing index:", index);
        console.log("Item to edit:", itemToEdit);

        // Set form values with the item to edit
        setValue("name", itemToEdit.name);
        setValue("language_code", itemToEdit.language_code);
        setValue("description", itemToEdit.description);

        // Remove the item from the finished_translations list
        setFinishedTranslations(prevTranslations => 
            prevTranslations.filter((_, i) => i !== index)
        );
    };

    // Handle Delete button click
    const handleDelete = (index: number) => {
        const new_translations = finished_translations.filter((_, i) => i !== index)
        setFinishedTranslations(new_translations)
        hidePopup.type == "edit" && handleHidePopup({type: "edit", show: true, data: {id: hidePopup.data.id, activities: new_translations}})
    };

    useEffect(() => {
        console.log(finished_translations, "Updated finished translations");
    }, [finished_translations]);


    return (
        <div>
            {/* Display the added translations */}
            <Form formTitle={hidePopup.type === "create" ? "Add measurement attribute" : "Edit measurement attribute"} handleSubmit={handleSubmit(onSubmit)}>
                <div className="">
                    <label htmlFor="value" className="block text-sm font-medium text-black">
                        Value
                    </label>
                    <input
                        id="value"
                        type="text"
                        {...register("value", { required: "Value is required" })}
                        className="outline-none border-b-2 border-primary w-full py-2"
                    />
                </div>

                {/* Submit Translation Button */}
                <div className="mt-6 flex justify-between items-center">

                    {/* Submit All Translations Button */}
                    {finished_translations.length > 0 && (
                        <div className="">
                            <Button
                                type="submit"
                                text="Submit"
                                styling="bg-green-600 text-white px-4 py-1 rounded"
                            />
                        </div>
                    )}
                </div>

                {/* Error and Success Messages */}
                {isError && (
                    <div className="mt-4 text-sm text-red-600">
                        Error creating result: {"Something went wrong!"}
                    </div>
                )}

                {isSuccess && (
                    <div className="mt-4 text-sm text-green-600">Result created successfully!</div>
                )}
            </Form>
        </div>
    );
}
