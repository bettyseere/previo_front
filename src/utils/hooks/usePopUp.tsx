import React, { useState, createContext, Dispatch, SetStateAction } from "react";
import { useContext } from "react";

type Popup = {
    show: boolean;
    type: string;
}

interface IPopupContext {
    hidePopup: Popup;
    setHidePopup: Dispatch<SetStateAction<Popup>>;
}


export const PopupContext = createContext<IPopupContext>({
    hidePopup: {show: false, type: "create"},
    setHidePopup: () => {},
}
)



export const PopupContextProvider = ({ children }: {children: React.ReactNode}) => {

    const [hidePopup, setHidePopup] = useState({show: false, type: "create"})

    const value = {hidePopup,  setHidePopup}

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