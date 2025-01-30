import Form from "../../Commons/Form";
import { usePopup } from "../../../utils/hooks/usePopUp";
import Button from "../../Commons/Button";
import { useApiSend } from "../../../utils/hooks/query";
import { useForm } from "react-hook-form";
import { create_team, update_team } from "../../../api/teams";
import { useAuth } from "../../../utils/hooks/Auth";


export default function TeamForm() {
    const { hidePopup, handleHidePopup} = usePopup()
    const { currentUser } = useAuth()

    const operation = hidePopup.type === "create" ? create_team: (data: any) => {
        return update_team(data, hidePopup.data.id)
    };
    const { register, handleSubmit, reset } = useForm();
    const { mutate, isError, isSuccess, isPending} = useApiSend(operation, undefined, undefined, ["teams"]);

    // Handle form submission
    const onSubmit = (data: any) => {
        data.company_id = currentUser?.company
        mutate(data, {
            onSuccess: () => {
                handleHidePopup({ show: false, type: "create" });
                reset(); // Reset form fields
                window.location.reload()
            },
            onError: (error) => {
                console.error("Error creating team:", error);
            },
        });
    };

    return (
        <Form formTitle={hidePopup.type === "create" ? "Create New Role" : "Edit Role"} handleSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 gap-4 items-center mt-4 w-[24rem]">
                <div className="">
                    <label htmlFor="name" className="block text-sm font-medium text-black">
                        Name
                    </label>
                    <input
                        id="name"
                        defaultValue={hidePopup.type == "edit" ? hidePopup.data.name: ""}
                        type="text"
                        {...register("name", { required: "Company name is required" })}
                        className="outline-none border-b-2 border-primary w-full py-2"
                    />
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
                <div className="mt-4 text-sm text-red-600">
                    Error creating role: {"Something went wrong!"}
                </div>
            )}

            {isSuccess && (
                <div className="mt-4 text-sm text-green-600">{hidePopup.type == "create" ? "Role created successfully!": "Role updated successfully!"}</div>
            )}
        </Form>
    );
}
