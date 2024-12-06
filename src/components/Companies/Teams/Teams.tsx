import CompanyLayout from "../CompanyDetails";
import Form from "../../Commons/Form";
import { useParams } from "react-router-dom";

export default function CompanyTeams(){
    const link = useParams()
    console.log(link, "this")

    const form = <Form handleSubmit={()=>{}} formTitle=""><div></div></Form>
    return (
        <CompanyLayout>
            <div>This is the teams page</div>
        </CompanyLayout>
    )
}