import Form from "../../Commons/Form";
import { usePopup } from "../../../utils/hooks/usePopUp";
import { useForm } from "react-hook-form";

export default function ChangePassword(){
    const {handleHidePopup} = usePopup()
    return(
        <Form formTitle="Change Password" handleSubmit={()=>console.log("Form Submited")}>
            <div>Change Password</div>
        </Form>
    )
}