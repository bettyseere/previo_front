import Layout from "../../Layout/Dashboard/Layout";
import { useApiGet } from "../../utils/hooks/query";
import { usePopup } from "../../utils/hooks/usePopUp";
import { get_teams } from "../../api/teams";
import Table from "../Commons/Table";
import Button from "../Commons/Button";


export default function Teams(){
    const {hidePopup, setHidePopup} = usePopup()
    const {
            data,
            isLoading,
            isFetching,
            isPending,
            error,
            isError,
            isLoadingError
        } = useApiGet(["teams"], get_teams)

        if (isLoading || isFetching || isPending){
            return <div>Fetching teams</div>
        }

        if (isError || isLoadingError){
            console.log(error)
            if (error.response.status === 404){
                return (<div>No teams found</div>)
            }
            return (<div>Error fetching teams</div>)
        }


        const table_columns = [
            {header: "Name", accessorKey: "name"}
        ]

        // const button = <Button text="Create Team" styling="text-white py-2" />
    return (
        <Layout>
            {data && <div className="p-6">
                <Table data={data} columns={table_columns} initialPageSize={10} searchMsg={"Search Teams"} />
            </div>}
        </Layout>
    )
}
