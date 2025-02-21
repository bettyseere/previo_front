import { useAuth } from "../../utils/hooks/Auth";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { Login as LoginData } from "../../types/Auth";
import Button from "../Commons/Button";
import { FaEye, FaEyeSlash } from "react-icons/fa6";

const Login = () => {
    const { handleLogin, currentUser } = useAuth();
    const navigate = useNavigate();
    const { register, handleSubmit } = useForm<LoginData>();
    const [showPassword, setShowPassword] = useState(false)

    const onSubmit = async (data: LoginData) => {
        try {
            await handleLogin?.(data);
            toast.success("Login Successful!")
            navigate("/");
        } catch (error) {
            toast.error("Login failed. Please check your credentials.");
        }
    };

    useEffect(() => {
        if (currentUser) {
            navigate("/");
        }
    }, [currentUser, navigate]);

    return (
        <div className="font-jarkata flex items-center h-screen">
            <div className="w-[70%] h-full flex items-center justify-center">
                <img width={600} src="/images/logo_seere/png/previo-long.png" alt="seere logo" />
            </div>
            <div className="bg-primary h-full w-[30%] flex items-center justify-center">
                <div className="flex flex-col justify-center items-center">
                    <div className="text-white max-w-72 mb-8">
                        <h1 className="mb-4 font-bold text-2xl text-center">Welcome Back to Seere. Please Login</h1>
                        {/* <p className="font-bold text-center uppercase text-lg">Login</p> */}
                    </div>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="mb-2 flex flex-col gap-4">
                            <input
                                type="text"
                                className="rounded-md py-2 px-2 w-[20rem] outline-none bg-white"
                                placeholder="Email"
                                {...register("email", { required: true, pattern: /^\S+@\S+$/ })}
                            />
                            <div className="flex gap-1 bg-white w-[20rem] justify-between items-center rounded-md py-2 px-2 ">
                                <input
                                    className="outline-none"
                                    type={!showPassword ? "password": "text"}
                                    placeholder="Password"
                                    {...register("password", { required: true })}
                                />
                                <div onClick={()=>setShowPassword(!showPassword)} >{!showPassword ? <FaEyeSlash /> : <FaEye />}</div>
                            </div>
                        </div>
                        <a href="/forgot_password">
                            <p className="mb-2 text-white font-semibold cursor-pointer text-sm">Forgot password?</p>
                        </a>
                        <Button type="submit" text="Login" styling="px-6 py-2" />
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
