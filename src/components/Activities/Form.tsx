import Form from "../Commons/Form";
import Button from "../Commons/Button";
import { usePopup } from "../../utils/hooks/usePopUp";
import { useApiSend } from "../../utils/hooks/query";
import { useForm } from "react-hook-form";
import { create_activity, update_activity } from "../../api/activities/activities";
import { useState } from "react";
import { DE, FR, ES, IT, GB } from "country-flag-icons/react/3x2";
import { queryClient } from "../../main"
import { name_and_description } from "../../types/Activity";
import { useEffect } from "react";

interface activities {
    activities?:[name_and_description]
    id?: string
}

export default function ActivityForm() {
    const { hidePopup, handleHidePopup } = usePopup();
    const [finished_translations, setFinishedTranslations] = useState(hidePopup.data?.activities || []);
    const { register, handleSubmit, reset, setValue } = useForm();
    const operation = hidePopup.type === "create"
  ? create_activity
  : (data: any) => hidePopup.data?.id
      ? update_activity(hidePopup.data.id, data)
      : Promise.reject("No ID found for update");

    const { mutate, isError, isSuccess } = useApiSend(operation, undefined, undefined, ["activities"]);

    const flags = {
        "it": <IT title="Italian" className="w-8" />,
        "en": <GB title="English" className="w-8" />,
        "de": <DE title="German" className="w-8" />,
        "fr": <FR title="French" className="w-8" />,
        "es": <ES title="Spanish" className="w-8" />
    };

    const language_codes = ["en", "it", "de", "fr", "es"];

    // Filter out the language codes that have already been used
    const select_codes = language_codes.filter(code => !finished_translations.some(item => item.language_code === code));

    // Handle form submission for adding a translation
    const onSubmit = (data: any) => {
        // Add the new translation to the finished_translations array
        setFinishedTranslations(prevTranslations => [
            ...prevTranslations,
            { name: data.name, language_code: data.language_code, description: data.description }
        ]);

        // Reset the form for the next translation input
        reset();
    };

    // Handle the submission of all translations to the API
    const submitAllTranslations = () => {
        // Send all translations to the API (you can adjust this API call as needed)
        mutate({ names_and_descriptions: finished_translations }, {
            onSuccess: () => {
                console.log("Submitted just now")
                queryClient.invalidateQueries(["activities"]).then(()=>{
                    setFinishedTranslations([]); // Clear the translations after submission
                    reset(); // Reset form fields
                    handleHidePopup({ show: false, type: "create" }); // Close the popup on success
                });
            },
            onError: (error) => {
                console.error("Error submitting translations:", error);
            },
        });
    };

    // Handle Edit button click
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
        console.log("Deleting index:", index);
        console.log(finished_translations, "finished translations")
        const new_translations = finished_translations.filter((_, i) => i !== index)
        console.log(new_translations, "New translations")
        setFinishedTranslations(new_translations)
        hidePopup.type == "edit" && handleHidePopup({type: "edit", show: true, data: {id: hidePopup.data.id, activities: new_translations}})
        console.log(finished_translations, "Finished again")
    };

    useEffect(() => {
        console.log(finished_translations, "Updated finished translations");
    }, [finished_translations]);

    useEffect(() => {
    if (hidePopup.type === "edit" && !hidePopup.data?.id) {
        console.warn("Missing ID for editing activity.");
    }
    }, [hidePopup]);

    return (
        <div>
            {/* Display the added translations */}
            <Form formTitle={hidePopup.type === "create" ? "Add activity" : "Edit Activity"} handleSubmit={handleSubmit(onSubmit)}>
                {finished_translations.length > 0 && (
                <div className="py-4 border-b bg-white rounded-t-md">
                    <h3 className="font-semibold text-secondary text-xl">Added Translations</h3>

                    <div className="flex py-2 gap-2 flex-col">
                        {finished_translations.map((item, i) => (
                            <div className="rounded-md w-full flex justify-between gap-12" key={i}>
                                <div className="flex gap-4">
                                    {flags[item.language_code]}
                                    <div>{item.name}</div>
                                </div>
                                <div className="flex gap-4">
                                    <Button text="Edit" handleClick={() => handleEdit(i)} />
                                    <Button text="Remove" styling="bg-red-500" handleClick={() => handleDelete(i)} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
                {finished_translations.length < 5 && (
                    <div className="grid grid-cols-1 gap-4 items-center mt-4 w-[24rem]">
                        <div className="flex w-full gap-4 items-center">
                            <div className="w-1/2">
                                <label htmlFor="name" className="block text-sm font-medium text-black">
                                    Name
                                </label>
                                <input
                                    id="name"
                                    type="text"
                                    {...register("name", { required: "Name is required" })}
                                    className="outline-none border-b-2 border-primary w-full py-2"
                                />
                            </div>
                            <div className="w-1/2">
                                <label htmlFor="language_code" className="block text-sm font-medium text-black">
                                    Language
                                </label>
                                <select
                                    id="language_code"
                                    {...register("language_code", { required: "Language is required" })}
                                    className="outline-none border-b-2 border-primary w-full py-2"
                                >
                                    {select_codes.map(code => (
                                        <option key={code} value={code}>
                                            {flags[code]}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="">
                            <label htmlFor="description" className="block text-sm font-medium text-black">
                                Description
                            </label>
                            <textarea
                                {...register("description")}
                                name="description"
                                rows={2}
                                maxLength={200}
                                className="outline-none border-b-2 border-primary w-[24rem] py-2"
                            ></textarea>
                        </div>
                    </div>
                )}

                {/* Submit Translation Button */}
                <div className="mt-6 flex justify-between items-center">
                    {finished_translations.length < 5 && (
                        <div className="">
                            <Button
                                type="submit"
                                text={"Add to translations"}
                                styling="text-white px-4 py-1 rounded"
                            />
                        </div>
                    )}

                    {/* Submit All Translations Button */}
                    {finished_translations.length > 0 && (
                        <div className="">
                            <Button
                                type="button"
                                text="Submit"
                                styling="bg-green-600 text-white px-4 py-1 rounded"
                                handleClick={submitAllTranslations}
                            />
                        </div>
                    )}
                </div>

                {/* Error and Success Messages */}
                {isError && (
                    <div className="mt-4 text-sm text-red-600">
                        Error inviting user: {"Something went wrong!"}
                    </div>
                )}

                {isSuccess && (
                    <div className="mt-4 text-sm text-green-600">Activity created successfully!</div>
                )}
            </Form>
        </div>
    );
}
