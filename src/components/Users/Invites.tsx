import { useApiGet } from "../../utils/hooks/query";
import { usePopup } from "../../utils/hooks/usePopUp";
import { get_all_users, delete_user } from "../../api/authentication";
import { delete_invite, get_single_invite, invites } from "../../api/invites";
import { TbSend } from "react-icons/tb";

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

export default function Invites(){
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
        } = useApiGet(["invites"], invites)

    const init_delete = (id: string) => {
        setSelectedID(id)
        handleHidePopup({show: true, type: "create", confirmModel: true})
    }

    const handle_delete = async (id: string) => {
        try {
            await delete_invite(id)
            refetch()
            toast.success("Invite deleted successfully")
            handleHidePopup({show: false, type: "create", confirmModel: false})
        } catch {
            toast.error("Error deleting invite.")
            handleHidePopup({show: false, type: "create", confirmModel: false})
        }
    }

    if (isLoading || isFetching || isPending) {
        return (
            <ErrorLoading>
                <div  className="text-2xl font-bold text-secondary">Fetching invites ...</div>
            </ErrorLoading>
        )
    }

    const popup = <Popup>
                    <div>
                        {hidePopup.confirmModel ? <ConfirmModel
                            message="Are you sure you want to delete this invite?"
                            title="Delete Invite"
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
                        <div  className="text-xl font-bold text-red-400">{error.response?.status === 404 ? "No invites found": "Error fetching invites"}</div>
                        {error.response?.status == 404 && <Button text="Invite athlete" handleClick={()=>handleHidePopup({show: true, type: "create"})} />}
                    </div>
                </ErrorLoading>
                </div>
            )
        }

        const table_columns = [
            {header: "Email", accessorKey: "email"},
            {header: "Company", accessorKey: "company", cell: ({ cell, row }) => {
                console.log(row, "This is the row")
                return <div>{row.original.company ? row.original.company.name: ""}</div>
                }},
            // {header: "User Type", accessorKey: "user_type"},
            {
                header: "Status", 
                accessorKey: "invite_status",
                cell: ({cell, row}) => (
                    <div>{row.original.invite_status === "accepted"? "Accepted": <div className="text-red-500 font-semibold">Pending</div>}</div>
                )
            },
            {
                header: "Sent",
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
                    {(row.original.id !== currentUser?.id && row.original.invite_status !== "accepted") && <div onClick={()=>init_delete(row.original.id)} className="shadow-md p-2 rounded-md hover:scale-110 hover:duration-150">
                        <BsTrash size={20} color="red" />
                    </div>}
                    {row.original.invite_status !== "accepted" ? <div className="shadow-md p-2 rounded-md hover:scale-110 hover:duration-150">
                        <TbSend size={20} className="text-primary" />
                    </div>: <div></div>}
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
                    <Table data={data} columns={table_columns} initialPageSize={10} actionBtn={button} searchMsg={"Search Invites"} />
                </div>}
            </UserSubMenu>
        </div>
    )
}
