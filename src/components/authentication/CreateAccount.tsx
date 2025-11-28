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
    const token = urlParams.get("token");

    const navigate = useNavigate();
    const { register, handleSubmit, reset } = useForm<CreateUserAccount>();
    const [showPassword, setShowPassword] = useState(false);

    const onSubmit = async (data: CreateUserAccount) => {
        try {
            const res = await create_account(data, token);
            toast.success(res.message);
            reset();
            navigate("/login");
        } catch (error) {
            toast.error("There was a problem creating your account.");
            reset();
        }
    };

    return (
        <div className="font-jarkata flex flex-col md:flex-row h-screen">
            {/* Left logo section */}
            <div className="min-h-[200px] md:flex-1 flex items-center justify-center p-4 md:p-8">
                <img
                className="w-full max-w-[180px] sm:max-w-xs md:max-w-md lg:max-w-lg"
                src="/images/logo_seere/png/previo-long.png"
                alt="previo logo"
                />
            </div>

            {/* Right form section */}
            <div className="bg-primary flex-1 flex items-center justify-center p-6 sm:p-8 md:p-12 relative">
                <div className="bg-primary md:bg-transparent rounded-lg md:rounded-none w-full max-w-md">
                    <div className="text-white w-full mb-6 px-2">
                    <h1 className="font-bold text-2xl sm:text-3xl text-center leading-snug max-w-[22rem] mx-auto">
                    Welcome to Previo®. Create your account
                    </h1>
                </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-4">
                        <input
                            type="text"
                            placeholder="First Name"
                            className="rounded-md py-2 px-3 w-full outline-none bg-white focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                            {...register("first_name", { required: true })}
                        />

                        <input
                            type="text"
                            placeholder="Last Name"
                            className="rounded-md py-2 px-3 w-full outline-none bg-white focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                            {...register("last_name", { required: true })}
                        />

                        <div className="flex items-center bg-white rounded-md px-3 py-2 w-full focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary">
                            <input
                                minLength={8}
                                maxLength={50}
                                type="number" step="0.01"
                                placeholder="Height (cm)"
                                className="flex-1 outline-none bg-transparent"
                                {...register("height", { required: false })}
                            />
                        </div>

                        <div className="flex items-center bg-white rounded-md px-3 py-2 w-full focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary">
                            <input
                                minLength={8}
                                maxLength={50}
                                type="number" step="0.01"
                                placeholder="Weight (kg)"
                                className="flex-1 outline-none bg-transparent"
                                {...register("weight", { required: false })}
                            />
                        </div>

                        <div className="flex items-center bg-white rounded-md px-3 py-2 w-full focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary">
                            <input
                                minLength={8}
                                maxLength={50}
                                type={showPassword ? "text" : "password"}
                                placeholder="Password"
                                className="flex-1 outline-none bg-transparent"
                                {...register("password", { required: true })}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                {showPassword ? <FaEye /> : <FaEyeSlash />}
                            </button>
                        </div>

                        <p className="text-white text-sm text-center">
                            Already have an account?{" "}
                            <a href="/login" className="font-bold underline">
                                Login
                            </a>
                        </p>

                        <div className="pt-2">
                            <Button type="submit" text="Create account" styling="w-full py-2" />
                        </div>
                    </form>
                    <div className="text-white font-semibold absolute bottom-4 text-center w-full left-0 right-0 px-4 text-sm sm:text-base">
                        <p className="pt-4">Previo is a registred trademark of Seere S.r.l</p>
                        <a href="https://www.seere.cloud/privacy-policy-previo">
                        <p className="hover:text-green-500 cursor-pointer underline">Privacy Policy</p>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateAccount;
