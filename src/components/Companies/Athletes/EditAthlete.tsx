import Form from "../../Commons/Form";
import { usePopup } from "../../../utils/hooks/usePopUp";
import { useForm } from "react-hook-form";
import { update_athlete_info } from "../../../api/authentication";
import { useApiSend } from "../../../utils/hooks/query";
import Button from "../../Commons/Button";
import { useAuth } from "../../../utils/hooks/Auth";
import { queryClient } from "../../../main";

interface userInfo {
    id: string
    weight?: string
    height?: string
    gender?: string
    first_name?: string
    last_name?: string
    birth_date?: string
    address?: string
    country?: string
    city?: string
}

export default function EditAthleteInfo({id, first_name, last_name, height, weight, gender, birth_date, address, country, city}: userInfo){
    const {hidePopup, handleHidePopup} = usePopup()
    const currentUser = useAuth()
    const { register, handleSubmit, reset } = useForm()
    const { mutate, isError, isSuccess, isPending } = useApiSend(update_athlete_info, undefined, undefined, ["athletes"]);


    const onSubmit = (data: any) => {
        // clean up nullables
        for (const field of ["birth_date", "weight", "height"]) {
            if (!data[field]) data[field] = null;
        }
        data.id = id

        // call mutate correctly
        mutate(data,  // pass both values together
            {
            onSuccess: () => {
                queryClient.invalidateQueries(["athletes"]);
                reset();
                handleHidePopup({ show: false, type: "create" });
            },
            onError: (error) => {
                console.error("Error updating athlete info:", error);
            },
            }
        );
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
                        {...register("first_name")}
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
                        {...register("last_name")}
                        className="outline-none border-b-2 border-primary w-full py-2"
                    />
                </div>
                <div className="">
                    <label htmlFor="email" className="block text-sm font-medium text-black mt-2 w-[3rem]">
                        Sex
                    </label>
                    {/* <label htmlFor="company_id" className="block text-sm font-medium text-black">
                        Select Company
                    </label> */}
                    <select {...register("gender")} defaultValue={gender} name="gender" className="outline-none border-b-2 border-primary w-full py-2">
                        <option className="py-2" value={"f"} key={"f"}>Female</option>
                        <option className="py-2" value={"m"} key={"m"}>Male</option>
                        <option className="py-2" key={"o"}>Rather not say</option>
                    </select>
                </div>

                <div className="">
                    <label htmlFor="height" className="block text-sm font-medium text-black">
                        Height
                    </label>
                    <input
                        id="height"
                        defaultValue={height}
                        type="number" step="0.01"
                        placeholder="Height"
                        {...register("height")}
                        className="outline-none border-b-2 border-primary w-full py-2"
                    />
                </div>

                <div className="">
                    <label htmlFor="weight" className="block text-sm font-medium text-black">
                        Weight
                    </label>
                    <input
                        id="weight"
                        defaultValue={weight}
                        type="text"
                        placeholder="Weight"
                        {...register("weight")}
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

                <div className="mb-4 mt-2">
                    <label htmlFor="birth_date" className="block text-sm font-medium text-black mt-2 w-[6rem]">
                        Birth date
                    </label>
                    <input
                        id="birth_date"
                        // value={birth_date}
                        type="date"
                        {...register("birth_date")}
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