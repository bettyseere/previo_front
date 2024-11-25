import { IoClose } from "react-icons/io5";
import { usePopup } from "../../utils/hooks/usePopUp";

interface FormProps {
    handleSubmit: () => void
    children: React.ReactNode
    formTitle: string
}

const Form = ({children, handleSubmit, formTitle}: FormProps) => {
    const {handleHidePopup} = usePopup()
    return (
        <div className="relative rounded-md bg-white">
            <div className="p-8">
                <div className="flex justify-between gap-8">
                    <h2 className="font-semibold text-primary">{formTitle}</h2>
                    <div className="bg-primary rounded-full cursor-pointer" onClick={()=>handleHidePopup({show: false, type: "create"})}><IoClose size={28} color="white"  className="p-1"/></div>
                </div>
                <form onSubmit={handleSubmit}>{children}</form>
            </div>
        </div>
    )
};

export default Form;
