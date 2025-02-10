import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { ResetPassword as ResetPasswordType } from "../../types/Auth";
import { reset_password } from "../../api/authentication";
import Button from "../Commons/Button";
import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa6";


const ResetPassword = () => {
    const navigate = useNavigate();
    const { register, handleSubmit } = useForm<ResetPasswordType>();
    const [showPassword, setShowPassword] = useState(false)
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const token = urlParams.get("token") || ""

    const onSubmit = async (data: ResetPasswordType) => {
        if (data.confirm_password !== data.password){
            toast("Passwords do not match")
        } else {
            try {
                await reset_password(data, token);
                toast.success("Password reset successfully!")
                navigate("/login");
            } catch (error) {
                toast.error("There was a problem resetting your password. Try again later.");
            }
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
                        <h1 className="mb-4 font-bold text-2xl text-center">We got you. Reset your password here.</h1>
                        {/* <p className="font-bold text-center uppercase text-lg">Login</p> */}
                    </div>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="mb-2 flex flex-col gap-4">
                            <div className="flex gap-1 bg-white w-[20rem] justify-between items-center rounded-md py-2 px-2 ">
                                <input
                                    className="outline-none"
                                    type={!showPassword ? "password": "text"}
                                    placeholder="Password"
                                    {...register("password", { required: true })}
                                />
                                <div onClick={()=>setShowPassword(!showPassword)} >{!showPassword ? <FaEyeSlash /> : <FaEye />}</div>
                            </div>
                            <input
                                className="rounded-md py-2 px-2 w-[20rem] outline-none bg-white"
                                type="text"
                                placeholder="Confirm Password"
                                {...register("confirm_password", { required: true })}
                            />
                        </div>
                        <a href="/login">
                            <p className="mb-2 text-white font-semibold cursor-pointer text-sm">Back to login?</p>
                        </a>
                        <Button type="submit" text="Reset password" styling="px-6 py-2" />
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
