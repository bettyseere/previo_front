import Form from "../../Commons/Form";
import { usePopup } from "../../../utils/hooks/usePopUp";
import { useForm } from "react-hook-form";
import { update_user_info } from "../../../api/authentication";
import { useApiSend } from "../../../utils/hooks/query";
import Button from "../../Commons/Button";
import { queryClient } from "../../../main";

interface userInfo {
    first_name: string
    last_name: string
    address?: string
    country?: string
    city?: string
}

export default function EditInfo({first_name, last_name, address, country, city}: userInfo){
    const {hidePopup, handleHidePopup} = usePopup()
    const { register, handleSubmit, reset } = useForm()
    const { mutate, isError, isSuccess, isPending } = useApiSend(update_user_info, undefined, undefined, ["invites"]);

    const onSubmit = (data: any) => {
        mutate(data, {
            onSuccess: () => {
                queryClient.invalidateQueries(["current_user"]);
                handleHidePopup({ show: false, type: "create" }); // Close the popup on success
                reset(); // Reset form fields
            },
            onError: (error) => {
                console.error("Error inviting company user:", error);
            },
        });
    };


    return (
        <Form formTitle="Edit Your Information" handleSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-2 gap-4 items-center mt-4 w-[36rem]">
                <div className="">
                    <label htmlFor="first_name" className="block text-sm font-medium text-black">
                        First Name
                    </label>
                    <input
                        id="first_name"
                        type="text"
                        defaultValue={first_name}
                        placeholder="First name"
                        {...register("first_name", { required: "First name is required" })}
                        className="outline-none border-b-2 border-primary w-full py-2"
                    />
                </div>

                <div className="">
                    <label htmlFor="last_name" className="block text-sm font-medium text-black">
                        Last Name
                    </label>
                    <input
                        id="last_name"
                        defaultValue={last_name}
                        type="text"
                        placeholder="Last name"
                        {...register("last_name", { required: "Last name is required" })}
                        className="outline-none border-b-2 border-primary w-full py-2"
                    />
                </div>

                <div className="">
                    <label htmlFor="address" className="block text-sm font-medium text-black">
                        Address
                    </label>
                    <input
                        id="address"
                        defaultValue={address}
                        type="text"
                        placeholder="Your address"
                        {...register("address")}
                        className="outline-none border-b-2 border-primary w-full py-2"
                    />
                </div>

                <div className="">
                    <label htmlFor="country" className="block text-sm font-medium text-black">
                        Country
                    </label>
                    <input
                        id="country"
                        defaultValue={country}
                        type="text"
                        {...register("country")}
                        placeholder="Country of residence"
                        className="outline-none border-b-2 border-primary w-full py-2"
                    />
                </div>

                <div className="">
                    <label htmlFor="city" className="block text-sm font-medium text-black">
                        City
                    </label>
                    <input
                        id="city"
                        defaultValue={city}
                        placeholder="Your city"
                        type="text"
                        {...register("city")}
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
                        Error updating user info: {"Something went wrong!"}
                    </div>
                )}

                {isSuccess && (
                <div className="mt-4 text-sm text-green-600">Invite sent successfully!</div>
            )}
        </Form>
    )
}