import CompanyLayout from "../CompanyDetails";
import Form from "../../Commons/Form";
import { useParams } from "react-router-dom";
import { Outlet } from "react-router-dom";

export default function Staff(){
    const params = useParams()

    return (
        <CompanyLayout>
            <div>This is the staff page</div>
        </CompanyLayout>
    )
}