export default function Board({children}: {children: React.ReactNode}){
    return (
        <div className="bg-[#FFF] mr-4 border-1 h-[calc(100vh-6rem)] mt-[1rem] relative">
            <div className="">
                {children}
            </div>
        </div>
    )
}