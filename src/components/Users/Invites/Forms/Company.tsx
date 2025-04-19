import Form from "../../../Commons/Form";
import { usePopup } from "../../../../utils/hooks/usePopUp";
import Button from "../../../Commons/Button";
import { useApiSend } from "../../../../utils/hooks/query";
import { useForm } from "react-hook-form";
import { invite_company_user } from "../../../../api/invites";


export default function CompanyUserForm() {
    const [errorMessage, setErrorMessage] = useState("Something went went wrong!")
    const { hidePopup, handleHidePopup } = usePopup();
    const { register, handleSubmit, reset } = useForm();
    const { mutate, isError, isSuccess, isPending, error } = useApiSend(invite_company_user, undefined, undefined, ["invites"]);

    // Handle form submission
    const onSubmit = (data: any) => {
        data.is_admin ? data.user_type = "admin": data.user_type = "staff"
        mutate(data, {
            onSuccess: () => {
                console.log("company user invited successfully!", data);
                handleHidePopup({ show: false, type: "create" }); // Close the popup on success
                reset(); // Reset form fields
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
        <Form formTitle={hidePopup.type === "create" ? "Invite Company USer" : "Edit Invite"} handleSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-2 gap-4 items-center mt-4 w-[36rem]">
                <div className="">
                    <label htmlFor="email" className="block text-sm font-medium text-black">
                        Email
                    </label>
                    <input
                        id="email"
                        type="text"
                        required
                        {...register("email", { required: "Email is required" })}
                        className="outline-none border-b-2 border-primary w-full py-2"
                    />
                </div>

                <div className="">
                    <label htmlFor="company_id" className="block text-sm font-medium text-black">
                        Select Company
                    </label>
                    <select {...register("company_id", { required: "Company is required" })} name="company_id" className="outline-none border-b-2 border-primary w-full pb-2 pt-2">
                        {companies && companies.map(company => <option value={company.id} key={company.id}>{company.name}</option>)}
                    </select>
                </div>


                <div className="">
                    <label htmlFor="notes" className="block text-sm font-medium text-black">
                        Notes
                    </label>
                    <textarea {...register("notes")} name="notes" rows={4} maxLength={100} className="outline-none border-b-2 border-primary w-[36rem] py-2"></textarea>
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

            <div className="flex items-center gap-2 mt-2">
                <input type="checkbox" {...register("is_admin")} name="is_admin" className="h-4 w-4 text-primary bg-primary" />
                <p className="font-bold text-secondary">Is admin user?</p>
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
                    Error inviting user: {errorMessage}
                </div>
            )}

            {isSuccess && (
                <div className="mt-4 text-sm text-green-600">Invite sent successfully!</div>
            )}
        </Form>
    );
}
