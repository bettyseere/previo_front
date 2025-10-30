import CompanyLayout from "../CompanyDetails";
import { useApiGet } from "../../../utils/hooks/query";
import { get_company_users, delete_user } from "../../../api/authentication";
import { useParams } from "react-router-dom";
import { useAuth } from "../../../utils/hooks/Auth";
import Table from "../../Commons/Table";
import { BsTrash } from "react-icons/bs";
import ErrorLoading from "../../Commons/ErrorAndLoading";
import { usePopup } from "../../../utils/hooks/usePopUp";
import Button from "../../Commons/Button";
import CompanyUserForm from "./Form";
import Popup from "../../Commons/Popup";
import { toast } from "react-toastify";
import { useState } from "react";
import ConfirmModel from "../../Commons/ConfirmModel";
import { FaRegEdit } from "react-icons/fa";
import EditAthleteInfo from "./EditAthlete";

export default function CompanyAthletes() {
    const {hidePopup, handleHidePopup} = usePopup()
    const { currentUser } = useAuth()
    const [selectedID, setSelectedID] = useState("")
    let company_id: any = useParams();
    company_id = company_id.id
    const [selectedAthlete, setSelectedAthlete] = useState(null)

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

    const is_admin = currentUser?.user_type == "admin"
    is_admin ? company_id = currentUser?.company: company_id = company_id

    const { data, isError, isLoading, error, refetch } = useApiGet(
        ["athletes", company_id],
        () => get_company_users(company_id)
    );

    if (isLoading) {
        return (
            <ErrorLoading>
                <div  className="text-2xl font-bold text-secondary">Fetching athletes ...</div>
            </ErrorLoading>
        )
    }

    const popup = <Popup>
                    {hidePopup.type === "edit" ? 
                    <EditAthleteInfo
                        id={selectedAthlete.id}
                        first_name={selectedAthlete.first_name}
                        last_name={selectedAthlete.last_name}
                        height={selectedAthlete.height}
                        weight={selectedAthlete.weight}
                        gender={selectedAthlete.gender}
                        birth_date={selectedAthlete.birth_date}
                        city={selectedAthlete.city}
                        country={selectedAthlete.country}
                        address={selectedAthlete.address}
                    />:
                    <div>
                        {hidePopup.confirmModel ? <ConfirmModel
                            message="Are you sure you want to delete this user?"
                            title="Delete User"
                            handleSubmit={()=>handle_delete(selectedID)}
                        />:hidePopup.type === "create" ? (
                            <CompanyUserForm company_id={company_id} />
                        ) : (
                            <div>Other Popup Content</div>
                        )}
                    </div>
                    }
                </Popup>

    if (isError) {
        return (
            <div>
            {hidePopup.show && popup}
            <ErrorLoading>
                <div className="flex items-center justify-center flex-col gap-4">
                    <div  className="text-xl font-bold text-red-400">{error.response.status === 404 ? "No not athletes found": "Error fetching athletes"}</div>
                    {error.response.status == 404 && <Button text="Invite athlete" handleClick={()=>handleHidePopup({show: true, type: "create"})} />}
                </div>
            </ErrorLoading>
            </div>
        )
    }

    const table_columns = [
            {header: "First Name", accessorKey: "first_name"},
            {header: "Last Name", accessorKey: "last_name"},
            {header: "Is Admin", accessorKey: "user_type", cell: ({cell, row}) => {
                return <div>{row.original.user_type === "admin" ? "Yes": "No"}</div>
            }},
            {header: "Email", accessorKey: "email"},
            {
            header: "Actions",
            accessorKey: "id",
            cell: ({cell, row }) => {
                return <div className="">
                    {row.original.id !== currentUser?.id &&
                    <div className="flex gap-8 justify-center items-center">
                        <div onClick={()=>init_delete(row.original.id)} className="shadow-md p-2 rounded-md hover:scale-110 hover:duration-150">
                            <BsTrash size={20} color="red" />
                        </div>
                        <div onClick={()=>{
                            setSelectedAthlete(row.original)
                            handleHidePopup({show: true, type: "edit"})
                        }} className="shadow-md text-primary p-2 rounded-md hover:scale-110 hover:duration-150">
                            <FaRegEdit size={20} color="" />
                        </div>
                    </div>}
                </div>
                }
        }
        ]


        const button = <Button text="Invite Athlete" styling="text-white py-2" handleClick={() => handleHidePopup({ show: true, type: "create" })} />

    return (
        <div>
            {hidePopup.show && popup}
            <CompanyLayout>
                <div className="">
                    <Table data={data} searchMode="double" searchMsg="Search Athletes" actionBtn={button} columns={table_columns} />
                </div>
            </CompanyLayout>
        </div>
    );
}
