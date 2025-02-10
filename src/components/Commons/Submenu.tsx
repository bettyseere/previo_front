import { Outlet} from "react-router-dom";
import Layout from "../../Layout/Dashboard/Layout";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../utils/hooks/Auth";
import { Link } from "react-router-dom";

interface props {
    children: React.ReactNode
    sub_page_props: [NavValue]
}

type NavValue = {
    name: string
    link: string
}


export default function SubMenu({children, sub_page_props}: props) {
    const navigate = useNavigate()
    const location = useLocation()
    const { currentUser } = useAuth()
    const is_super = currentUser?.user_type == "super"

    const navigation = sub_page_props

    return (
        <>
            <Layout>
                {is_super && <div className="flex justify-between gap-1">
                    {navigation.map(item=>{
                        const isActive = location.pathname === item.link;
                        return (<div className="w-full"><Link to={item.link}><div key={item.name} className={`w-full text-center font-semibold ${isActive ? "bg-tertiary": "bg-primary"} p-4 hover:scale-95 text-white cursor-pointer hover:duration-150`}>
                        {item.name}
                    </div></Link></div>)})}
                </div>}
                <Outlet /><div className="pt-4 px-4">{children}</div>
            </Layout>
        </>
    );
}
