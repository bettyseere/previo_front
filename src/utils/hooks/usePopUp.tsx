import React, { useState, createContext} from "react";
import { useContext } from "react";

type Popup = {
    show: boolean;
    type: string;
    data?: any
}

interface IPopupContext {
    hidePopup: Popup;
    handleHidePopup: (values: Popup) => void;
}


export const PopupContext = createContext<IPopupContext>({
    hidePopup: {show: false, type: "create"},
    handleHidePopup: () => {}
})



export const PopupContextProvider = ({ children }: {children: React.ReactNode}) => {

    const [hidePopup, setHidePopup] = useState({show: false, type: "create", data: undefined})


    const handleHidePopup = (values: Popup) => {
        setHidePopup({show: values.show, type: values.type, data: values.data})
    }
    const value = {hidePopup,  handleHidePopup}

    return <PopupContext.Provider value={value}>
        {children}
    </PopupContext.Provider>
}


export function usePopup() {
    const context = useContext(PopupContext);

    if (context === undefined) {
        throw new Error("useAuth must be used inside of AuthProvider");
    }

    return context;
}