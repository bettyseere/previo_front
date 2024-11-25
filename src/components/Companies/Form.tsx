import Form from "../Commons/Form";
import { usePopup } from "../../utils/hooks/usePopUp";
import Button from "../Commons/Button";
import { useApiSend } from "../../utils/hooks/query";
import { useForm } from "react-hook-form";
import { create_company, update_company } from "../../api/companies";
import { UpdateCompany } from "../../types/Company";


export default function CompanyForm({ popup }: UpdateCompany ) {
    const { handleHidePopup} = usePopup()
    const operation = popup.type === "create" ? create_company: (data: any) => {
        console.log("calling update")
        return update_company(data, popup.data.id)
    };
    const { register, handleSubmit, reset } = useForm();
    const { mutate, isError, isSuccess, isPending, error } = useApiSend(operation, undefined, undefined, ["companies"]);

    // Handle form submission
    const onSubmit = (data: any) => {
        mutate(data, {
            onSuccess: () => {
                console.log(data)
                popup.type == "edit" && console.log("we made it")
                handleHidePopup({ show: false, type: "create" });
                reset(); // Reset form fields
                window.location.reload()
            },
            onError: (error) => {
                console.error("Error creating company:", error);
            },
        });
    };

    return (
        <Form formTitle={popup.type === "create" ? "Create New Company" : "Edit Company"} handleSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-2 gap-4 items-center mt-4 w-[36rem]">
                <div className="">
                    <label htmlFor="name" className="block text-sm font-medium text-black">
                        Name
                    </label>
                    <input
                        id="name"
                        defaultValue={popup.type == "edit" ? popup.data.name: ""}
                        type="text"
                        {...register("name", { required: "Company name is required" })}
                        className="outline-none border-b-2 border-primary w-full py-2"
                    />
                </div>

                <div>
                    <label htmlFor="country" className="block text-sm font-medium text-black">
                        Country
                    </label>
                    <input
                        id="country"
                        type="text"
                        defaultValue={popup.type == "edit" ? popup.data.country: ""}
                        {...register("country", { required: "Country is required" })}
                        className="outline-none border-b-2 border-primary w-full py-2"
                    />
                </div>

                <div>
                    <label htmlFor="city" className="block text-sm font-medium text-black">
                        City
                    </label>
                    <input
                        id="city"
                        type="text"
                        defaultValue={popup.type == "edit" ? popup.data.city: ""}
                        {...register("city", { required: "City is required" })}
                        className="outline-none border-b-2 border-primary w-full py-2"
                    />
                </div>

                <div>
                    <label htmlFor="piva" className="block text-sm font-medium text-black">
                        Piva
                    </label>
                    <input
                        id="piva"
                        type="text"
                        defaultValue={popup.type == "edit" ? popup.data.piva: ""}
                        {...register("piva", { required: "PIVA is required" })}
                        className="outline-none border-b-2 border-primary w-full py-2"
                    />
                </div>
                <div>
                    <label htmlFor="cap" className="block text-sm font-medium text-black">
                        Cap
                    </label>
                    <input
                        id="cap"
                        type="text"
                        defaultValue={popup.type == "edit" ? popup.data.cap: ""}
                        {...register("cap", { required: "Cap is required" })}
                        className="outline-none border-b-2 border-primary w-full py-2"
                    />
                </div>

                <div>
                    <label htmlFor="address" className="block text-sm font-medium text-black">
                        Address
                    </label>
                    <input
                        id="address"
                        type="text"
                        defaultValue={popup.type == "edit" ? popup.data.address: ""}
                        {...register("address", { required: "Address is required" })}
                        className="outline-none border-b-2 border-primary w-full py-2"
                    />
                </div>
            </div>

            {/* Submit Button */}
            <div className="mt-6">
                <Button
                    type="submit"
                    text={isPending ? "Submitting..." : popup.type === "create" ? "Create" : "Save"}
                    styling="text-white px-4 py-1 rounded"
                />
            </div>

            {/* Error and Success Messages */}
            {isError && (
                <div className="mt-4 text-sm text-red-600">
                    Error creating company: {"Something went wrong!"}
                </div>
            )}

            {isSuccess && (
                <div className="mt-4 text-sm text-green-600">{popup.type == "create" ? "Company created successfully!": "Company updated successfully!"}</div>
            )}
        </Form>
    );
}
