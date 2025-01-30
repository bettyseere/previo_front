import Form from "../Commons/Form";
import { usePopup } from "../../utils/hooks/usePopUp";
import Button from "../Commons/Button";
import { useApiSend } from "../../utils/hooks/query";
import { useForm } from "react-hook-form";
import { create_role, update_role } from "../../api/roles";


export default function RoleForm() {
    const { hidePopup, handleHidePopup} = usePopup()

    const operation = hidePopup.type === "create" ? create_role: (data: any) => {
        console.log("calling update")
        return update_role(data, hidePopup.data.id)
    };
    const { register, handleSubmit, reset } = useForm();
    const { mutate, isError, isSuccess, isPending, error } = useApiSend(operation, undefined, undefined, ["roles"]);

    // Handle form submission
    const onSubmit = (data: any) => {
        mutate(data, {
            onSuccess: () => {
                handleHidePopup({ show: false, type: "create" });
                reset(); // Reset form fields
                window.location.reload()
            },
            onError: (error) => {
                console.error("Error creating role:", error);
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

                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-black">
                        Description
                    </label>
                    <textarea
                        id="description"
                        defaultValue={hidePopup.type == "edit" ? hidePopup.data.description: ""}
                        {...register("description", { required: "Description is required" })}
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
