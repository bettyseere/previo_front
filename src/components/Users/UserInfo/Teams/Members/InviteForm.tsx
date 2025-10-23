import Form from "../../../../Commons/Form";
import { usePopup } from "../../../../../utils/hooks/usePopUp";
import Button from "../../../../Commons/Button";
import { useApiSend } from "../../../../../utils/hooks/query";
import { useForm } from "react-hook-form";
import { invite_company_user } from "../../../../../api/invites";
import { useState } from "react";


export default function AthleteInviteForm({company_id, team_id}: {company_id?: string, team_id?: string}) {
    const { hidePopup, handleHidePopup } = usePopup();
    const { register, handleSubmit, reset } = useForm();
    const [errorMessage, setErrorMessage] = useState("Something went wrong!")
    const { mutate, isError, isSuccess, isPending } = useApiSend(invite_company_user, undefined, undefined, ["invites"]);

    // Handle form submission
    const onSubmit = (data: any) => {
        data.is_admin ? data.user_type = "admin": data.user_type = "staff"
        data.company_id = company_id
        data.team = team_id
        mutate(data, {
            onSuccess: () => {
                handleHidePopup({ show: false, type: "create" }); // Close the popup on success
                console.log(data)
                reset(); // Reset form fields
                // window.location.reload()
            },
            onError: (error) => {
                setErrorMessage(error.response.data.detail)
                console.error("Error inviting company user:", error);
            },
        });
    };
    let companies = localStorage.getItem("companies")
    companies ? companies = JSON.parse(companies) : companies = null
    return (
        <Form formTitle={hidePopup.type === "create" ? "Invite Athlete" : "Edit Invite"} handleSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 gap-4 items-center mt-4 w-[24rem]">
                <div className="">
                    <label htmlFor="email" className="block text-sm font-medium text-black">
                        Email
                    </label>
                    <input
                        id="email"
                        type="text"
                        {...register("email", { required: "Email is required" })}
                        className="outline-none border-b-2 border-primary w-full py-2"
                    />
                </div>

                {/* <div className="flex w-full items-center">
                    <div className="">
                        <label htmlFor="access_type" className="block text-sm font-medium text-black">
                            Data access
                        </label>
                        <select
                            id="access_type"
                            {...register("access_type", { required: "Attribute is required" })}
                            className="outline-none border-b-2 border-primary w-[22rem] py-2"
                        >
                        <option value={"individual"}>Individual</option>
                        {hidePopup.data?.access_types.map(item => (
                            <option key={item.key} value={item.key}>
                                {item.value}
                            </option>
                        ))}
                        </select>
                    </div>
                </div> */}

                <div className="flex w-full items-center">
                    <div className="">
                        <label htmlFor="roles" className="block text-sm font-medium text-black">
                            Role
                        </label>
                        <select
                            id="role_id"
                            {...register("role")}
                            className="outline-none border-b-2 border-primary min-w-[24rem] py-2"
                        >
                        <option value={""}>Set Role</option>
                        {hidePopup.data?.roles.map(item => (
                            <option key={item.id} value={item.id}>
                                {item.name}
                            </option>
                        ))}
                        </select>
                    </div>
                </div>


                <div className="">
                    <label htmlFor="notes" className="block text-sm font-medium text-black">
                        Invitation Message
                    </label>
                    <textarea {...register("notes")} name="notes" rows={4} maxLength={100} className="outline-none border-b-2 border-primary w-[24rem] py-2"></textarea>
                </div>
            </div>

            <div className="mb-4 mt-2 flex items-end">
                <label htmlFor="email" className="block text-sm font-medium text-black mt-2 w-[6rem]">
                    Birth date
                </label>
                <input
                    id="birth_date"
                    type="date"
                    {...register("birth_date", { required: "Birth date is required" })}
                    className="outline-none border-b-2 border-primary w-full py-2"
                />
            </div>


            {/* Submit Button */}
            <div className="mt-6 flex justify-between items-center">
                <Button
                    type="submit"
                    text={isPending ? "Submitting..." : hidePopup.type === "create" ? "Send Invite" : "Save"}
                    styling="text-white px-4 py-1 rounded"
                />

                {<button
                    type="button"
                    disabled={isPending}
                    className="text-white px-4 py-1 rounded bg-red-500"
                    onClick={()=>handleHidePopup({show: true, type: "create"})}
                >Cancel</button>}
            </div>

            {/* Error and Success Messages */}
            {isError && (
                <div className="mt-4 text-sm text-red-600">
                    Error inviting user: {errorMessage}
                </div>
            )}

            {isSuccess && (
                <div className="mt-4 text-sm text-green-600">Invite sent successfully!</div>
            )}
        </Form>
    );
}
