import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { ResetPasswordRequest } from "../../types/Auth";
import Button from "../Commons/Button";
import { request_password_reset } from "../../api/authentication";

const ForgotPassword = () => {
    const { register, handleSubmit, reset } = useForm< ResetPasswordRequest>();
    const base_url = window.location.origin
    const redirect_url = `${base_url}/reset_password`

    const onSubmit = async (data: any) => {
        data.redirect_url = redirect_url
        try {
            const res = await request_password_reset(data);
            toast.success(res.message)
            reset()
            // navigate("/");
        } catch (error) {
            toast.success("If your email is registered, check your inbox for instructions to reset your password!");
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
                    <div className="text-white max-w-72 mb-6">
                        <h1 className="mb-4 font-bold text-2xl text-center">Send a request to reset your password.</h1>
                        {/* <p className="font-bold text-center uppercase text-lg">Login</p> */}
                    </div>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="mb-2">
                            <input
                                type="text"
                                className="rounded-md py-2 px-2 w-[20rem] outline-none bg-white"
                                placeholder="Email"
                                {...register("email", { required: true, pattern: /^\S+@\S+$/ })}
                            />
                        </div>
                        <a href="/login">
                            <p className="mb-2 text-white font-semibold cursor-pointer text-sm">Back to login?</p>
                        </a>
                        <Button type="submit" text="Request reset" styling="px-6 py-2" />
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
