import Layout from "../../Layout/Dashboard/Layout";
import { useApiGet } from "../../utils/hooks/query";
import { usePopup } from "../../utils/hooks/usePopUp";
import { get_all_users } from "../../api/authentication";
import Table from "../Commons/Table";
import Button from "../Commons/Button";
import Popup from "../Commons/Popup";
import UserForm from "./Form";
import { BsTrash } from "react-icons/bs";
import { PiPen } from "react-icons/pi";

export default function Users(){
    const {hidePopup, handleHidePopup} = usePopup()
    const {
            data,
            isLoading,
            isFetching,
            isPending,
            error,
            isError,
            isLoadingError
        } = useApiGet(["users"], get_all_users)

        if (isLoading || isFetching || isPending){
            return <div>Fetching Users</div>
        }

        if (isError || isLoadingError){
            console.log(error)
            return (<div>Error fetching users</div>)
        }

        const table_columns = [
            {header: "First Name", accessorKey: "first_name"},
            {header: "Last Name", accessorKey: "last_name"},
            {header: "User Type", accessorKey: "user_type"},
            {header: "Company", accessorKey: "company", cell: ({ cell, row }) => {
                console.log(row, "This is the row")
                return <div>{row.original.company ? row.original.company.name: ""}</div>
                }},
            {header: "Email", accessorKey: "email"},
            {
            header: "Actions",
            accessorKey: "id",
            cell: ({ }) => {
                return <div className="flex gap-8">
                    <div className="shadow-md p-2 rounded-md hover:scale-110 hover:duration-150">
                        <BsTrash size={20} color="red" />
                    </div>
                    <div className="shadow-md p-2 rounded-md hover:scale-110 hover:duration-150">
                        <PiPen size={20} className="text-primary" />
                    </div>
                </div>
                }
        }
        ]

        const button = <Button text="Invite User" styling="text-white py-2" handleClick={() => handleHidePopup({ show: true, type: "create" })} />

        const popup = <Popup>
                    <div>
                        {hidePopup.type === "create" ? (
                            <div><UserForm /></div>
                        ) : (
                            <div>Other Popup Content</div>
                        )}
                    </div>
                </Popup>
    return (
        <div>
            {hidePopup.show && popup}
            <Layout>
                {data && <div className="p-6">
                    <Table data={data} columns={table_columns} initialPageSize={10} actionBtn={button} searchMsg={"Search Users"} />
                </div>}
            </Layout>
        </div>
    )
}