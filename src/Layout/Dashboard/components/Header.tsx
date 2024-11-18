export default function DashboardHeader(){
    return (
        <div className="h-[2rem] mr-5 w-ful rounded-md mt-4">
            <div className="flex justify-between items-center w-full">
                        <div className="flex items-center px-2 gap-2">
                        </div>
                        <div className="flex md:gap-8 lg:gap-12 text-gray-800">
                            <div className="flex items-center gap-2 cursor-pointer">
                                <h4 className="rounded-full bg-primary w-6 h-6 flex items-center justify-center text-white font-medium">J</h4>
                                <h4 className="text-seere-text font-semibold">John</h4>
                            </div>
                        </div>
                    </div>
        </div>
    )
}