import { Outlet} from "react-router-dom";
import Layout from "../../Layout/Dashboard/Layout";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../utils/hooks/Auth";

interface props {
    children: React.ReactNode
}

export default function CompanyLayout({children}: props) {
    const company_id = useParams()
    const navigate = useNavigate()
    const location = useLocation()
    const { currentUser } = useAuth()
    const is_super = currentUser?.user_type == "super"

    const navigation = [
        {name: "Overview", link: `/${company_id.id}`},
        {name: "Teams", link: `/${company_id.id}/teams`},
        {name: "Staff", link: `/${company_id.id}/staff`},
        {name: "Athletes", link: `/${company_id.id}/athletes`},
        {name: "Devices", link: `/${company_id.id}/devices`}
    ]

    return (
        <>
            <Layout>
                {is_super && <div className="flex justify-between gap-1">
                    {navigation.map(item=>{
                        const isActive = location.pathname === item.link;
                        return (<div key={item.name} onClick={()=>navigate(item.link)} className={`w-full text-center font-semibold ${isActive ? "bg-tertiary": "bg-primary"} p-4 hover:scale-95 text-white cursor-pointer hover:duration-150`}>
                        {item.name}
                    </div>)})}
                </div>}
                <Outlet /><div className="pt-4 px-4">{children}</div>
            </Layout>
        </>
    );
}
