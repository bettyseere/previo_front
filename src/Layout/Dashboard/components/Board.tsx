export default function Board({children}: {children: React.ReactNode}){
    return (
        <div className="bg-[#FFF] mr-4 border-1 mt-14 h-[calc(100vh-4rem)] relative">
            <div className="-z-10">
                {children}
            </div>
        </div>
    )
}