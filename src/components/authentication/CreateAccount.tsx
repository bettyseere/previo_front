import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { CreateUserAccount } from "../../types/Auth";
import { create_account } from "../../api/authentication";
import Button from "../Commons/Button";
import { FaEye, FaEyeSlash } from "react-icons/fa6";

const CreateAccount = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    const navigate = useNavigate();
    const { register, handleSubmit, reset } = useForm<CreateUserAccount>();
    const [showPassword, setShowPassword] = useState(false)

    const onSubmit = async (data: CreateUserAccount) => {
        try {
            const res = await create_account(data, token);
            console.log(res)
            toast.success(res.message)
            reset()
            navigate("/login");
        } catch (error) {
            toast.error("There was a problem creating your account..");
            reset()
        }
    };

    return (
        <div className="font-jarkata flex items-center h-screen">
            <div className="w-[70%] h-full flex items-center justify-center">
                <img width={600} src="/images/logo_seere/svg/main_logo_dark.svg" alt="seere logo" />
            </div>
            <div className="bg-secondary h-full w-[30%] flex items-center justify-center">
                <div className="flex flex-col justify-center items-center">
                    <div className="text-white max-w-72 mb-8">
                        <h1 className="font-bold text-2xl text-center">Welcome to Seere. Create your account</h1>
                        {/* <p className="font-bold text-center uppercase text-lg">Login</p> */}
                    </div>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="mb-2 flex flex-col gap-4">
                            <input
                                type="text"
                                className="rounded-md py-2 px-2 w-[20rem] outline-none bg-white"
                                placeholder="First Name"
                                {...register("first_name", { required: true})}
                            />
                            <input
                                className="rounded-md py-2 px-2 w-[20rem] outline-none bg-white"
                                type="last_name"
                                placeholder="Last Name"
                                {...register("last_name", { required: true })}
                            />
                            <div className="flex gap-1 bg-white w-[20rem] justify-between items-center rounded-md py-2 px-2 ">
                                <input
                                    minLength={8}
                                    maxLength={50}
                                    className="outline-none"
                                    type={!showPassword ? "password": "text"}
                                    placeholder="Password"
                                    {...register("password", { required: true })}
                                />
                                <div onClick={()=>setShowPassword(!showPassword)} >{!showPassword ? <FaEyeSlash /> : <FaEye />}</div>
                            </div>
                        </div>
                        <p className="text-white mb-2">Already have an account? <a href="/login" className="text-primary font-bold">Login</a></p>
                        <Button type="submit" text="Create account" styling="px-6 py-2" />
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateAccount;
