import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { ResetPasswordRequest } from "../../types/Auth";
import Button from "../Commons/Button";
import { request_password_reset } from "../../api/authentication";

const ForgotPassword = () => {
  const { register, handleSubmit, reset } = useForm<ResetPasswordRequest>();
  const base_url = window.location.origin;
  const redirect_url = `${base_url}/reset_password`;

  const onSubmit = async (data: any) => {
    data.redirect_url = redirect_url;
    try {
      const res = await request_password_reset(data);
      toast.success(res.message);
      reset();
    } catch {
      toast.success(
        "If your email is registered, check your inbox for instructions to reset your password!"
      );
      reset();
    }
  };

  return (
    <div className="font-jarkata flex flex-col md:flex-row h-screen">
      {/* Logo Section */}
      <div className="flex-1 flex items-center justify-center p-4 md:p-8">
        <img
          className="w-full max-w-[180px] sm:max-w-xs md:max-w-md lg:max-w-lg"
          src="/images/logo_seere/png/previo-long.png"
          alt="previo logo"
        />
      </div>

      {/* Form Section */}
      <div className="bg-primary flex-1 flex items-center justify-center p-6 sm:p-8 md:p-12 relative">
        <div className="bg-primary md:bg-transparent rounded-lg md:rounded-none w-full max-w-md">
          <div className="text-white w-full mb-6 px-2">
            <h1 className="font-bold text-2xl sm:text-3xl text-center leading-snug max-w-[22rem] mx-auto">
              Send a request to reset your password.
            </h1>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="w-full px-2 sm:px-4 space-y-4"
          >
            <input
              type="text"
              className="rounded-md py-3 px-3 w-full outline-none bg-white text-sm sm:text-base"
              placeholder="Email"
              {...register("email", {
                required: true,
                pattern: /^\S+@\S+$/,
              })}
            />

            <a href="/login">
              <p className="text-white font-semibold cursor-pointer text-xs sm:text-sm hover:underline">
                Back to login?
              </p>
            </a>

            <Button
              type="submit"
              text="Request reset"
              styling="px-6 py-2 w-full"
            />
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

export default ForgotPassword;
