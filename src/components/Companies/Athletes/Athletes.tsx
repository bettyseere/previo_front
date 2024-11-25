import CompanyLayout from "../CompanyDetails";
import Form from "../../Commons/Form";
import { useParams } from "react-router-dom";
import { Outlet } from "react-router-dom";

export default function Atheltes(){
    const link = useParams()
    console.log(link, "this")

    const form = <Form handleSubmit={()=>{}} formTitle=""><div></div></Form>
    return (
        <div>
        <CompanyLayout>
            <div>This is the athletes page</div>
        </CompanyLayout>
        </div>
    )
}