import { usePopup } from "../../utils/hooks/usePopUp";

interface PopupProps {
    children: React.ReactNode;
}


export default function Popup({children}: PopupProps){
    const {hidePopup} = usePopup()
    return (
        <div className={`${!hidePopup.show ? "hidden": "block"} absolute bg-gray-100 bg-opacity-70 right-0 left-0 bottom-0 top-0 flex justify-center items-center z-10`}>
            <div className="relative shadow-md rounded-sm">
                {children}
            </div>
        </div>
    )
}