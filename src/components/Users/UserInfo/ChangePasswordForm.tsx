import Form from "../../Commons/Form";
import { usePopup } from "../../../utils/hooks/usePopUp";
import Button from "../../Commons/Button";
import { useApiSend } from "../../../utils/hooks/query";
import { useForm } from "react-hook-form";
import { change_password } from "../../../api/authentication";


export default function ChangePassword() {
    const { hidePopup, handleHidePopup } = usePopup();
    const { register, handleSubmit, reset } = useForm();
    const { mutate, isError, isSuccess, isPending, error } = useApiSend(change_password);

    // Handle form submission
    const onSubmit = (data: any) => {
        mutate(data, {
            onSuccess: () => {
                handleHidePopup({ show: false, type: "create" }); // Close the popup on success
                reset(); // Reset form fields
            },
            onError: (error) => {
                console.error("Error changing password:", error);
            },
        });
    };

    return (
        <Form formTitle={"Change Password"} handleSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 gap-4 items-center mt-4 w-[24rem]">
                <div className="">
                    <label htmlFor="old_password" className="block text-sm font-medium text-black">
                        Current Password
                    </label>
                    <input
                        id="old_password"
                        type="text"
                        {...register("old_password", { required: "Old password is required" })}
                        className="outline-none border-b-2 border-primary w-full py-2"
                    />
                </div>

                <div className="">
                    <label htmlFor="new_password" className="block text-sm font-medium text-black">
                        New Password
                    </label>
                    <input
                        id="new_password"
                        type="text"
                        {...register("new_password", { required: "New password is required" })}
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
                    Error changing password: {"Something went wrong!"}
                </div>
            )}

            {isSuccess && (
                <div className="mt-4 text-sm text-green-600">Password changed successfully!</div>
            )}
        </Form>
    );
}
