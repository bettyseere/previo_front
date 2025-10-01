import { useAuth } from "../../utils/hooks/Auth";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { Login as LoginData } from "../../types/Auth";
import Button from "../Commons/Button";
import { FaEye, FaEyeSlash } from "react-icons/fa6";
import { usePopup } from "../../utils/hooks/usePopUp";
import AdminViewPopup from "./AdminPopup";

const Login = () => {
  const { handleLogin, currentUser, handleLogout } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit } = useForm<LoginData>();
  const [showPassword, setShowPassword] = useState(false);
  const {hidePopup, handleHidePopup} = usePopup()


  const onSubmit = async (data: LoginData) => {
    try {
      const user = await handleLogin?.(data);
      // const is_admin = currentUser?.user_type === "admin";
      const is_admin = user?.user_type === "admin"
      is_admin && handleHidePopup({show: true, type: "create"})
    } catch {
      toast.error("Login failed. Please check your credentials.");
    }
  };

  // popup component

  useEffect(() => {
    if (currentUser && !hidePopup.show) {
      if (currentUser.user_type === "admin"){
        const check_render = localStorage.getItem("admin_check")
        if (!check_render){
          handleLogout && handleLogout()
        } else {
          navigate("/");
        }
      } else {
        navigate("/");
      }
    }
  }, [currentUser, navigate]);

  return (
    // check for render of popup component before redirecting to main UI
    <div>
    {hidePopup.show && <AdminViewPopup />}
    <div className="font-jarkata flex flex-col md:flex-row h-screen">
      {/* Logo Section */}
      <div className="flex-1 flex items-center justify-center p-4 md:p-8">
        <img
          className="w-full max-w-[180px] sm:max-w-xs md:max-w-md lg:max-w-lg"
          src="/images/logo_seere/png/previo-long.png"
          alt="seere logo"
        />
      </div>

      {/* Form Section */}
      <div className="bg-primary flex-1 flex items-center justify-center p-6 sm:p-8 md:p-12 relative">
        <div className="bg-primary md:bg-transparent rounded-lg md:rounded-none w-full max-w-md">
          <div className="text-white w-full mb-8 px-2">
            <h1 className="font-bold text-2xl sm:text-3xl text-center leading-snug max-w-[22rem] mx-auto">
              Welcome Back to Previo®
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
              {...register("email", { required: true, pattern: /^\S+@\S+$/ })}
            />

            <div className="flex gap-2 bg-white w-full justify-between items-center rounded-md py-3 px-3">
              <input
                className="outline-none flex-1 text-sm sm:text-base"
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

            <a href="/forgot_password">
              <p className="text-white font-semibold cursor-pointer text-xs sm:text-xs hover:underline">
                Forgot password?
              </p>
            </a>

            <Button type="submit" text="Login" styling="px-6 py-2 w-full" />
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
    </div>
  );
};

export default Login;
