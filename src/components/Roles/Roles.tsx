import Layout from "../../Layout/Dashboard/Layout";
import { useApiGet } from "../../utils/hooks/query";
import { usePopup } from "../../utils/hooks/usePopUp";
import { get_roles, delete_role } from "../../api/roles";
import Table from "../Commons/Table";
import Button from "../Commons/Button";
import { BsTrash } from "react-icons/bs";
import { PiPen } from "react-icons/pi";
import Popup from "../Commons/Popup";
import RoleForm from "./Form";
import ErrorLoading from "../Commons/ErrorAndLoading";
import { toast } from "react-toastify";
import ConfirmModel from "../Commons/ConfirmModel";
import { useState } from "react";



export default function Roles(){
    const {hidePopup ,handleHidePopup} = usePopup()
    const [deleteID, setDeleteID] = useState("")

    const handleUpdate = (data: any) => {
        handleHidePopup({show: true, data: data, type: "edit"})
        console.log(data, hidePopup)
    }

    const handleDeletePopup = (id: string) => {
        setDeleteID(id)
        handleHidePopup({show: true, type: "create", confirmModel: true})
    }
    // const {hidePopup, setHidePopup} = usePopup()
    const {
            data,
            isLoading,
            isFetching,
            isPending,
            error,
            isError,
            isLoadingError,
            refetch
        } = useApiGet(["roles"], get_roles)

    const handleDelete = async (id: string) => {
        try{
            await delete_role (id=id)
            refetch()
            toast("Role deleted successfully.")
            handleHidePopup({show: false, type: "create"})
        } catch (error) {
            toast("Error deleting role.")
            handleHidePopup({show: false, type: "create"})
        }
    }


    if (isLoading || isFetching || isPending){
        return (
            <ErrorLoading>
                <div  className="text-2xl font-bold text-secondary">Fetching roles ...</div>
            </ErrorLoading>
        )
    }

    const popup = <Popup>
                    <div>
                        {hidePopup.confirmModel ? <ConfirmModel
                            message="Are you sure you want to delete this role? This action cannot be reversed."
                            title="Delete role"
                            handleSubmit={()=>handleDelete(deleteID)}
                            cancel_action={()=>handleHidePopup({confirmModel: false, type: "create", show: false})}
                        /> : <RoleForm />}
                    </div>
                </Popup>

    if (isError || isLoadingError){
        return (
            <div>
                {hidePopup.show && popup}
                <ErrorLoading>
                    <div className="flex items-center justify-center flex-col gap-4">
                        <div  className="text-xl font-bold text-red-400">{error.response.status === 404 ? "No activities found": "Error fetching roles"}</div>
                        <Button text="Add Role" handleClick={()=>handleHidePopup({show: true, type: "create"})} />
                    </div>
                </ErrorLoading>
            </div>
        )
    }


        const table_columns = [
            {header: "Name", accessorKey: "name", cell: ({cell, row}) => {
                return <div className=""><a href={`/device_types/${row.original.id}`}>{row.original.name}</a></div>
            }},
            {header: "Description", accessorKey: "description", cell: ({cell, row}) => {
                return <div className="">{row.original.description}</div>
            }},
            {
            header: "Actions",
            accessorKey: "id",
            cell: ({ cell, row}) => {
                return <div className="flex gap-8 px-4 justify-center">
                    <div onClick={()=>handleDeletePopup(row.original.id)} className="shadow-md p-2 rounded-md hover:scale-110 hover:duration-150">
                        <BsTrash size={20} color="red" />
                    </div>
                    <div onClick={()=>handleUpdate(row.original)} className="shadow-md p-2 rounded-md hover:scale-110 hover:duration-150">
                        <PiPen size={20} className="text-primary" />
                    </div>
                </div>
                }
        }
        ]

        const button = <Button text="Create Roles" styling="text-white py-2" handleClick={()=>handleHidePopup({ show: true, type: "create" })} />
    return (
        <div>
            {hidePopup.show && popup}
            <Layout>
                {data && <div className="p-6">
                    <Table data={data} columns={table_columns} initialPageSize={10} actionBtn={button} searchMsg={"Search Roles"} />
                </div>}
            </Layout>
        </div>
    )
}