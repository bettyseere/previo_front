import CompanyLayout from "../CompanyDetails";
import { useApiGet } from "../../../utils/hooks/query";
import { get_company_users} from "../../../api/authentication";
import { useParams } from "react-router-dom";
import { useAuth } from "../../../utils/hooks/Auth";
import Table from "../../Commons/Table";
import { BsTrash } from "react-icons/bs";
import ErrorLoading from "../../Commons/ErrorAndLoading";
import { usePopup } from "../../../utils/hooks/usePopUp";
import Button from "../../Commons/Button";
import CompanyUserForm from "./Form";
import Popup from "../../Commons/Popup";

export default function CompanyAthletes() {
    const {hidePopup, handleHidePopup} = usePopup()
    const { currentUser } = useAuth()
    let company_id: any = useParams();
    company_id = company_id.id

    const is_admin = currentUser?.user_type == "admin"
    is_admin ? company_id = currentUser?.company: company_id = company_id

    const { data, isError, isLoading, error } = useApiGet(
        ["athletes", company_id],
        () => get_company_users(company_id, false)
    );

    if (isLoading) {
        return (
            <ErrorLoading>
                <div  className="text-2xl font-bold text-secondary">Fetching athletes ...</div>
            </ErrorLoading>
        )
    }

    if (isError) {
        return (
            <ErrorLoading>
                <div className="text-2xl font-bold text-red-400">{error.response.status === 404 ? "No athletes found!": "Error fetching athletes!"}</div>
            </ErrorLoading>
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
            header: "Actions",
            accessorKey: "id",
            cell: ({ }) => {
                return <div className="flex gap-8 justify-center items-center">
                    <div className="shadow-md p-2 rounded-md hover:scale-110 hover:duration-150">
                        <BsTrash size={20} color="red" />
                    </div>
                    {/* <div className="shadow-md p-2 rounded-md hover:scale-110 hover:duration-150">
                        <PiPen size={20} className="text-primary" />
                    </div> */}
                </div>
                }
        }
        ]

        const popup = <Popup>
                    <div>
                        {hidePopup.type === "create" ? (
                            <CompanyUserForm company_id={company_id} />
                        ) : (
                            <div>Other Popup Content</div>
                        )}
                    </div>
                </Popup>

        const button = <Button text="Invite Athlete" styling="text-white py-2" handleClick={() => handleHidePopup({ show: true, type: "create" })} />

    return (
        <div>
            {hidePopup.show && popup}
            <CompanyLayout>
                <div className="">
                    <Table data={data} searchMsg="Search Athletes" actionBtn={button} columns={table_columns} />
                </div>
            </CompanyLayout>
        </div>
    );
}
