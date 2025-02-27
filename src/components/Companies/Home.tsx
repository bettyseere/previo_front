import Layout from "../../Layout/Dashboard/Layout";
import { useApiGet, useApiSend } from "../../utils/hooks/query";
import { usePopup } from "../../utils/hooks/usePopUp";
import { get_companies, delete_company } from "../../api/companies";
import Table from "../Commons/Table";
import Button from "../Commons/Button";
import Popup from "../Commons/Popup";
import CompanyForm from "./Form";
import { useNavigate } from "react-router-dom";
import { BsTrash } from "react-icons/bs";
import { PiPen } from "react-icons/pi";
import { toast } from "react-toastify";
import ErrorLoading from "../Commons/ErrorAndLoading";
import ConfirmModel from "../Commons/ConfirmModel";
import { useState } from "react";
import moment from "moment";

export default function Home() {
    const { hidePopup, handleHidePopup } = usePopup();
    const navigate = useNavigate()
    const [deleteID, setDeleteID] = useState("")

    const {
        data,
        isLoading,
        isPending,
        isFetching,
        error,
        isError,
        isLoadingError,
    } = useApiGet(["companies"], get_companies);

    const handleDeletePopup = (id: string) => {
        setDeleteID(id)
        handleHidePopup({show: true, type: "create", confirmModel: true})
    }

    if (isLoading || isPending || isFetching) {
        return (
            <ErrorLoading>
                <div  className="text-2xl font-bold text-secondary">Fetching companies ...</div>
            </ErrorLoading>
        )
    }

    const popup = <Popup>
                    {!hidePopup.confirmModel ?
                    <div>
                        {hidePopup.type === "create" ? (
                            <div><CompanyForm popup={hidePopup} /></div>
                        ) : (
                            <div>
                            {
                                <CompanyForm
                                    popup={hidePopup}
                                />
                            }
                            </div>
                        )}
                    </div>: <ConfirmModel cancel_action={()=>handleHidePopup({show: false, type: "create", confirmModel: false})} handleSubmit={()=>handleDelete(deleteID)} message="Are you sure you want to delete this company? This action cannot be reversed." title="Delete Company" />}
                </Popup>

    if (isError) {
        return (
            <div>
            {hidePopup.show && popup}
            <ErrorLoading>
                <div className="flex items-center justify-center flex-col gap-4">
                    <div  className="text-xl font-bold text-red-400">{error.response.status === 404 ? "No companies found": "Error fetching companies"}</div>
                    {error.response.status == 404 && <Button text="Create Company" handleClick={()=>handleHidePopup({show: true, type: "create"})} />}
                </div>
            </ErrorLoading>
            </div>
        )
    }

    data && localStorage.setItem("companies", JSON.stringify(data))

    const handleUpdate = (data: any) => {
        handleHidePopup({show: true, data: data, type: "edit"})
    }

    const handleDelete = async (id: string) => {
        try{
            await delete_company(id=id)
            toast("Company delete successfully.")
            handleHidePopup({show: false, type: "create"})
            window.location.reload()
        } catch (error) {
            toast("Error deleting company")
            handleHidePopup({show: false, type: "create"})
        }
    }


    const table_columns = [
        { header: "Name", accessorKey: "name", enableSorting: true, cell: ({cell, row}) => <a href={`/${row.original.id}/devices`} className="text-secondary font-bold hover:scale-110">{row.original.name}</a> },
        { header: "Country", accessorKey: "country", enableSorting: true},
        { header: "City", accessorKey: "city", enableSorting: true },
        { header: "Address", accessorKey: "address", enableSorting: true },
        {
            header: "Created At",
            accessorKey: "created_at",
            enableSorting: true,
            cell: ({cell, row}) => {
                return <p>{moment(row.original.created_at).format("YYYY-MM-DD")}</p>
            }
        },
        {
            header: "Actions",
            accessorKey: "id",
            cell: ({ cell, row}) => {
                return <div className="flex gap-8 justify-center items-center px-4">
                    <div onClick={()=>handleDeletePopup(row.original.id)} className="shadow-md p-2 rounded-md hover:scale-110 hover:duration-150">
                        <BsTrash size={20} color="red" />
                    </div>
                    <div onClick={()=>handleUpdate(row.original)} className="shadow-md p-2 rounded-md hover:scale-110 hover:duration-150">
                        <PiPen size={20} className="text-primary" />
                    </div>
                </div>
                }
        }
    ];


    const button = (
        <Button
            text="Create Company"
            styling="text-white py-2"
            handleClick={()=>handleHidePopup({ show: true, type: "create" })}
        />
    );


    return (
        <div className="">
            {hidePopup.show && popup}
            <Layout>
                {data && (
                    <div className="p-6">
                        <Table
                            data={data}
                            columns={table_columns}
                            initialPageSize={10}
                            actionBtn={button}
                            searchMsg={"Search Companies"}
                            onRowClick={(row) => navigate(`/${row.id}`)}
                        />
                    </div>
                )}
            </Layout>
        </div>
    );
}
