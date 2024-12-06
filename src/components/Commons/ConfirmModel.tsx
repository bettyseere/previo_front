import { IoClose } from "react-icons/io5";
import { usePopup } from "../../utils/hooks/usePopUp";
import Button from "./Button";

interface ConfirMModelProps {
    handleSubmit: () => void
    // children?: React.ReactNode
    action_btn?: string
    message?: string
    cancel_btn?: string
    action_btn_clr?: string
    cancel_btn_clr?: string
    title?: string
    cancel_action?: () => void
}

const ConfirmModel = ({handleSubmit, message, title, cancel_action,  cancel_btn="Cancel", action_btn="Delete" }: ConfirMModelProps) => {
    const {handleHidePopup} = usePopup()
    return (
        <div className="relative rounded-md bg-white max-w-[28rem]">
            <div className="p-8">
                <div className="flex justify-between gap-8">
                    <h2 className="font-semibold text-primary">{title}</h2>
                    <div className="bg-primary rounded-full cursor-pointer" onClick={()=>handleHidePopup({show: false, type: "create", confirmModel: false})}><IoClose size={28} color="white"  className="p-1"/></div>
                </div>
                <div className="mt-2">
                    <p className="px-2 font-semibold text-gray-700 text-center">{message}</p>
                </div>
                <div className=" flex justify-center mt-4 gap-20">
                    <Button text={cancel_btn} styling="bg-gray-500 px-4" handleClick={cancel_action} />
                    <Button styling="px-4 bg-red-500" text={action_btn} handleClick={handleSubmit} />
                </div>
            </div>
        </div>
    )
};

export default ConfirmModel;
