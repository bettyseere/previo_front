export default function SeereLogo({styling}: {stying?: string}){
    return (
        <div className="">
            <img
                className={`${styling ? styling: "p-0 mt-4"}`}
                width={80}
                src="/images/logo_seere/png/previo.png"
                alt="seere logo"
            />
        </div>
    )
}

// /images/logo_seere/svg/previocolori.svg