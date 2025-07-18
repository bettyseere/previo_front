import Form from "../../Commons/Form";
import Button from "../../Commons/Button";
import { usePopup } from "../../../utils/hooks/usePopUp";
import { useApiSend } from "../../../utils/hooks/query";
import { useForm } from "react-hook-form";
import { create_attribute, update_attribute } from "../../../api/measurements/attributes";
import { useState } from "react";
import { DE, FR, ES, IT, GB } from "country-flag-icons/react/3x2";
import { queryClient } from "../../../main"
import { useEffect } from "react";


export default function AttributeForm() {
    const { hidePopup, handleHidePopup } = usePopup();
    const [finished_translations, setFinishedTranslations] = useState(hidePopup.data?.activities || []);
    const { register, handleSubmit, reset, setValue } = useForm();
    const operation = hidePopup.type === "create" ? create_attribute : (data: any) =>  hidePopup.data.id && update_attribute(hidePopup.data.id, data);
    const { mutate, isError, isSuccess } = useApiSend(operation, undefined, undefined, ["measurement_attributes"]);

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
            { name: data.name, language_code: data.language_code, description: data.description, units: data.units }
        ]);

        // Reset the form for the next translation input
        reset();
    };

    // Handle the submission of all translations to the API
    const submitAllTranslations = () => {
        // Send all translations to the API (you can adjust this API call as needed)
        mutate({ names_and_descriptions: finished_translations }, {
            onSuccess: () => {
                queryClient.invalidateQueries(["measurement_attributes"]).then(()=>{
                    setFinishedTranslations([]); // Clear the translations after submission
                    reset(); // Reset form field
                    handleHidePopup({ show: false, type: "create" }); 
                });
                // Close the popup on success
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

        // Set form values with the item to edit
        setValue("name", itemToEdit.name);
        setValue("language_code", itemToEdit.language_code);
        setValue("description", itemToEdit.description);
        setValue("units", itemToEdit.units)

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
                                    placeholder="Jane Doe"
                                    {...register("name", { required: "Name is required" })}
                                    className="outline-none border-b-2 border-primary w-full py-2"
                                />
                            </div>

                            <div className="w-1/2">
                                <label htmlFor="units" className="block text-sm font-medium text-black">
                                    Units
                                </label>
                                <input
                                    id="units"
                                    type="text"
                                    placeholder="kg"
                                    {...register("units", { required: "Units required" })}
                                    className="outline-none border-b-2 border-primary w-full py-2"
                                />
                            </div>
                        </div>

                        <div className="">
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

                        <div className="">
                            <label htmlFor="description" className="block text-sm font-medium text-black">
                                Description
                            </label>
                            <textarea
                                {...register("description")}
                                name="description"
                                placeholder="Description goes here"
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
                        Error creating attribute: {"Something went wrong!"}
                    </div>
                )}

                {isSuccess && (
                    <div className="mt-4 text-sm text-green-600">Attribute created successfully!</div>
                )}
            </Form>
        </div>
    );
}
