import { useAuth } from "../../../../utils/hooks/Auth";
import UserInfo from "../UserInfo";
import Table from "../../../Commons/Table";
import { get_user_measurements } from "../../../../api/measurements/measurements";
import { useApiGet } from "../../../../utils/hooks/query";


export default function UserReports(){
    const { currentUser } = useAuth()
    const athlete_id = currentUser?.id
    const {
            data,
            isLoading,
            error,
            isError
        } = useApiGet(["user_measurements", athlete_id], ()=> get_user_measurements(athlete_id))

    let data_to_render = []

    data && data.forEach(item => {
        console.log(item)
        data_to_render.push({
            activity: item.sub_activity.translations[0].name,
            measurement: item.attribute.translations[0].name,
            results: item.value + item.attribute.translations[0].units,
            device: item.device.device_type.name
        })
    })

    const table_columns = [
        {header: "Activity", accessorKey: "activity"},
        {header: "Device", accessorKey: "device"},
        {header: "Measurement", accessorKey: "measurement"},
        {header: "Results", accessorKey: "results"}
        ]

    if (isError){
        <UserInfo>
            <p className="font-semibold mt-4">Error loading records</p>
        </UserInfo>
    }

    if (isLoading){
        return(
            <UserInfo>
                <p className="font-semibold mt-4">Loading your records</p>
            </UserInfo>
        )
    }



    return (
        <UserInfo>
            {
            data ? <Table data={data_to_render} columns={table_columns} entity_name="Your Records" searchMsg="Search your records"/>
            : <div className="font-semibold mt-4">You don't have any records yet</div>
            }
        </UserInfo>
    )

}