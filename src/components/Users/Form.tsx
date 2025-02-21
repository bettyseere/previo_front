import SuperUserForm from "./Invites/Forms/Super";
import CompanyUserForm from "./Invites/Forms/Company";
import { useEffect, useState } from "react";


export default function UserForm() {
    const [company_user, setCompanyUser] = useState(false)

    useEffect(()=>{}, [company_user])

    return (
        <div>
            <div className="flex justify-between text-white font-bold">
                <h2 className={`cursor-pointer p-4 ${!company_user ? "bg-secondary": "bg-primary"} w-1/2`} onClick={()=>setCompanyUser(false)}>Super User</h2>
                <h2 className={`cursor-pointer p-4 ${company_user ? "bg-secondary": "bg-primary"} w-1/2`} onClick={()=>setCompanyUser(true)}>Company User</h2>
            </div>
            {company_user ? <CompanyUserForm /> : <SuperUserForm />}
        </div>
    );
}
