import Form from "../../../Commons/Form";
import { usePopup } from "../../../../utils/hooks/usePopUp";
import Button from "../../../Commons/Button";
import { useApiSend } from "../../../../utils/hooks/query";
import { useForm } from "react-hook-form";
import { invite_super_user } from "../../../../api/invites";


export default function SuperUserForm() {
    const { hidePopup, handleHidePopup } = usePopup();
    const { register, handleSubmit, reset } = useForm();
    const { mutate, isError, isSuccess, isPending, error } = useApiSend(invite_super_user, undefined, undefined, ["invites"]);

    // Handle form submission
    const onSubmit = (data: any) => {
        mutate(data, {
            onSuccess: () => {
                console.log("Super user invited successfully!", data);
                handleHidePopup({ show: false, type: "create" }); // Close the popup on success
                reset(); // Reset form fields
            },
            onError: (error) => {
                console.error("Error inviting super user:", error);
            },
        });
    };

    return (
        <Form formTitle={hidePopup.type === "create" ? "Invite Super USer" : "Edit Invite"} handleSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 gap-4 items-center mt-4 w-[24rem]">
                <div className="">
                    <label htmlFor="email" className="block text-sm font-medium text-black py-2">
                        Email
                    </label>
                    <input
                        id="email"
                        type="text"
                        {...register("email", { required: "Email is required" })}
                        className="outline-none border-b-2 border-primary w-full"
                    />
                </div>

                <div className="">
                    <label htmlFor="notes" className="block text-sm font-medium text-black">
                        Notes
                    </label>
                    <textarea {...register("notes")} name="notes" rows={4} maxLength={100} className="outline-none border-b-2 border-primary w-full py-2"></textarea>
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
                    Error inviting user: {"Something went wrong!"}
                </div>
            )}

            {isSuccess && (
                <div className="mt-4 text-sm text-green-600">Invite sent successfully!</div>
            )}
        </Form>
    );
}
