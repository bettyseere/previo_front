import { usePopup } from "../../utils/hooks/usePopUp";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../../utils/hooks/Auth";

export default function AdminViewPopup() {
  const {handleHidePopup} = usePopup()
  const {currentUser, updateCurrentUser} = useAuth()
  const navigate = useNavigate()

  const handleSelect = (asAdmin: boolean) => {
    handleHidePopup({type: "create", show: false})
    toast.success("Login Successful!");
    updateCurrentUser({...currentUser, admin_view: asAdmin, admin_check: true})
    localStorage.setItem("admin_view", String(asAdmin));
    localStorage.setItem("admin_check", "true");
    navigate("/")
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white rounded shadow p-4 max-w-[26rem] w-full text-center">
        <h2 className="text-xl font-semibold mb-6 uppercase bg-primary text-white py-2 shadow">Choose your view</h2>
        <p className="mb-1 font-semibold text-lg text-left mx-4">Would you like to login as Admin or Staff?</p>
        <p className="text-left mb-6 italic text-black/80 mx-4">We care about privacy, that's why we ask before. If you just need to see results, choose "Staff" during this session.</p>
        <div className="flex justify-between gap-2">
          <button
            onClick={() => handleSelect(true)}
            className="bg-primary w-1/2 text-white px-4 py-2 transition hover:scale-105"
          >
            Admin
          </button>
          <button
            onClick={() => handleSelect(false)}
            className="bg-secondary w-1/2 text-white px-4 py-2 transition hover:scale-105"
          >
            Staff
          </button>
        </div>
      </div>
    </div>
  );
}
