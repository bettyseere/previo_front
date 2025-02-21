interface Props {
    styling?: string,
    text?: string,
    type?: "submit" | "button",
    disabled?: boolean,
    isSelect?: boolean,
    selectOptions?: Array<string>,
    default_select_option?: string,
    handleClick?: () => void
}

export default function Button({styling, handleClick, text, disabled=false, type="button"}: Props){
    return(
    <button type={type} disabled={disabled} onClick={handleClick && handleClick} className={`py-1 px-2 rounded-md bg-secondary outline-none text-white font-bold flex justify-center items-center ${styling ? styling: ""}`}>
        {text}
    </button>
    )
}