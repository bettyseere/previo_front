export default function SeereLogo({styling}: {stying?: string}){
    return (
        <div className="">
            <img
                className={`${styling ? styling: "p-0 -mx-4 mt-2"}`}
                width={130}
                src="/images/logo_seere/svg/main_logo_dark.svg"
                alt="seere logo"
            />
        </div>
    )
}