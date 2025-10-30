import Layout from "../../Layout/Dashboard/Layout";
import { useApiGet } from "../../utils/hooks/query";
import { usePopup } from "../../utils/hooks/usePopUp";
import { get_all_users, delete_user } from "../../api/authentication";
import Table from "../Commons/Table";
import Button from "../Commons/Button";
import Popup from "../Commons/Popup";
import UserForm from "./Form";
import { BsTrash } from "react-icons/bs";
import ConfirmModel from "../Commons/ConfirmModel";
import ErrorLoading from "../Commons/ErrorAndLoading";
import { useState } from "react";
import { toast } from "react-toastify";
import { useAuth } from "../../utils/hooks/Auth";
import UserSubMenu from "./UserSubMenu";
import moment from "moment";

export default function Users(){
    const {currentUser} = useAuth()
    const {hidePopup, handleHidePopup} = usePopup()
    const [selectedID, setSelectedID] = useState("")
    const {
            data,
            isLoading,
            isFetching,
            isPending,
            error,
            refetch,
            isError,
            isLoadingError
        } = useApiGet(["users"], get_all_users)

    const init_delete = (id: string) => {
        setSelectedID(id)
        handleHidePopup({show: true, type: "create", confirmModel: true})
    }

    const handle_delete = async (id: string) => {
        try {
            await delete_user(id)
            refetch()
            toast.success("User deleted successfully")
            handleHidePopup({show: false, type: "create", confirmModel: false})
        } catch {
            toast.error("Error deleting user.")
            handleHidePopup({show: false, type: "create", confirmModel: false})
        }
    }

    if (isLoading || isFetching || isPending) {
        return (
            <ErrorLoading>
                <div  className="text-2xl font-bold text-secondary">Fetching users ...</div>
            </ErrorLoading>
        )
    }

    const popup = <Popup>
                    <div>
                        {hidePopup.confirmModel ? <ConfirmModel
                            message="Are you sure you want to delete this user?"
                            title="Delete User"
                            handleSubmit={()=>handle_delete(selectedID)}
                        />: <div>{hidePopup.type === "create" ? ( <div><UserForm /></div>) : ( <div>Other Popup Content</div>)}</div>}
                    </div>
                </Popup>

    if (isError) {
            return (
                <div>
                {hidePopup.show && popup}
                <ErrorLoading>
                    <div className="flex items-center justify-center flex-col gap-4">
                        <div  className="text-xl font-bold text-red-400">{error.response.status === 404 ? "No users found": "Error fetching users"}</div>
                        {error.response.status == 404 && <Button text="Invite athlete" handleClick={()=>handleHidePopup({show: true, type: "create"})} />}
                    </div>
                </ErrorLoading>
                </div>
            )
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
                header: "Created At",
                accessorKey: "created_at",
                cell: ({cell, row}) => {
                    return <p>{moment(row.original.created_at).format("YYYY-MM-DD")}</p>
                }
            },
            {
            header: "Actions",
            accessorKey: "id",
            cell: ({ cell, row}) => {
                return <div className="flex gap-8 justify-center items-center">
                    {row.original.id !== currentUser?.id && <div onClick={()=>init_delete(row.original.id)} className="shadow-md p-2 rounded-md hover:scale-110 hover:duration-150">
                        <BsTrash size={20} color="red" />
                    </div>}
                    {/* <div className="shadow-md p-2 rounded-md hover:scale-110 hover:duration-150">
                        <PiPen size={20} className="text-primary" />
                    </div> */}
                </div>
                }
        }
        ]

        const button = <Button text="Invite User" styling="text-white py-2" handleClick={() => handleHidePopup({ show: true, type: "create" })} />

    return (
        <div>
            {hidePopup.show && popup}
            <UserSubMenu>
                {data && <div className="">
                    <Table data={data} columns={table_columns} initialPageSize={10} actionBtn={button} searchMsg={"Search Users"} />
                </div>}
            </UserSubMenu>
        </div>
    )
}