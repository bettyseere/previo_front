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
  const [showPassword, setShowPassword] = useState(false);

  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const token = urlParams.get("token") || "";

  const onSubmit = async (data: ResetPasswordType) => {
    if (data.confirm_password !== data.password) {
      toast("Passwords do not match");
    } else {
      try {
        await reset_password(data, token);
        toast.success("Password reset successfully!");
        navigate("/login");
      } catch {
        toast.error(
          "There was a problem resetting your password. Try again later."
        );
      }
    }
  };

  return (
    <div className="font-jarkata flex flex-col md:flex-row h-screen">
      {/* Logo Section */}
      <div className="min-h-[200px] md:flex-1 flex items-center justify-center p-4 md:p-8">
        <img
          className="w-full max-w-[180px] sm:max-w-xs md:max-w-md lg:max-w-lg"
          src="/images/logo_seere/png/previo-long.png"
          alt="previo logo"
        />
      </div>

      {/* Form Section */}
      <div className="bg-primary flex-1 flex items-center justify-center p-6 sm:p-8 md:p-12 relative">
        <div className="bg-primary md:bg-transparent rounded-lg md:rounded-none w-full max-w-md">
          <div className="text-white w-full mb-8 px-2">
            <h1 className="font-bold text-2xl sm:text-3xl text-center leading-snug max-w-[22rem] mx-auto">
              We got you. Reset your password here.
            </h1>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="w-full px-2 sm:px-4 space-y-4"
          >
            <div className="flex gap-2 bg-white w-full justify-between items-center rounded-md py-3 px-3">
              <input
                className="outline-none bg-transparent flex-1 text-sm sm:text-base"
                type={!showPassword ? "password" : "text"}
                placeholder="Password"
                {...register("password", { required: true })}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-600 hover:text-gray-800"
              >
                {!showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            <input
              className="rounded-md py-3 px-3 w-full outline-none bg-white text-sm sm:text-base"
              type="text"
              placeholder="Confirm Password"
              {...register("confirm_password", { required: true })}
            />

            <a href="/login">
              <p className="text-white font-semibold cursor-pointer text-xs sm:text-sm hover:underline">
                Back to login?
              </p>
            </a>

            <Button
              type="submit"
              text="Reset password"
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

export default ResetPassword;
