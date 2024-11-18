import Layout from "../../Layout/Dashboard/Layout";
import { useApiGet } from "../../utils/hooks/query";
import { usePopup } from "../../utils/hooks/usePopUp";
import { get_companies } from "../../api/companies";
import Table from "../Commons/Table";
import Button from "../Commons/Button";


export default function Home(){
    const {hidePopup, setHidePopup} = usePopup()
    const {
            data,
            isLoading,
            isPending,
            isFetching,
            error,
            isError,
            isLoadingError
        } = useApiGet(["companies"], get_companies)

        if (isLoading || isPending || isFetching){
            <div>Fetching companies</div>
        }

        if (isError || isLoadingError){
            console.log(error)
            return (<div>Error fetching companies</div>)
        }

        const table_columns = [
            {header: "Name", accessorKey: "name"},
            {country: "Country", accessorKey: "country"},
            {country: "City", accessorKey: "city"}
        ]

        const button = <Button text="Create Company" styling="text-white py-2" />
        console.log(data)
    return (
        <Layout>
            {data && <div className="p-6">
                <Table data={data} columns={table_columns} initialPageSize={10} actionBtn={button} searchMsg={"Search Companies"} />
            </div>}
        </Layout>
    )
}