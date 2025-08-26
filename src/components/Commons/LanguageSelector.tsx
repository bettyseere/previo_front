import { Tooltip } from "react-tooltip";
import { useAuth } from "../../utils/hooks/Auth";
import { useEffect, useState } from "react";

const language_flag_map = [
        {name: "en", flag: "/images/england-flag.png", full_name: "English"},
        {name: "es", flag: "/images/spanish-flag.png", full_name:  "Spanish"},
        {name: "fr", flag: "/images/france-flag.png", full_name: "French"},
        {name: "it", flag: "/images/italy-flag.png", full_name: "Italian"},
        {name: "de", flag: "/images/germany-flag.png", full_name: "German"},
    ]

export default function LanguageSelector(){
    const {language, handleLanguage, currentUser} = useAuth()

    const currentImage = () => {
        const current_flag = language_flag_map.find(item => item.name === language)
        // console.log(current_flag, "current flag")
        return current_flag
    }

    return (
        currentUser && <div className="z-50 cursor-pointer">
            <div data-tooltip-id="language-tooltip" className="rounded-full w-10 h-10">
                <img src={`${currentImage()?.flag}`} alt={`${language}`}></img>
            </div>

            <div>
                <Tooltip id="language-tooltip" clickable place="bottom-end">
                    <ul className="space-y-2">
                        {language_flag_map.map(item => {
                            return <li onClick={()=>handleLanguage && handleLanguage(item.name)} className="flex gap-4 items-center hover:rounded-md hover:bg-primary p-2">
                                    <div className="rounded-full h-6 w-6">
                                        <img src={item.flag} alt={item.name + " flag"} />
                                    </div>
                                    <p className="font-semibold">{item.full_name}</p>
                                </li>
                        })}
                    </ul>
                </Tooltip>
            </div>
        </div>
    )
}