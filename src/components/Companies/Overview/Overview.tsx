import CompanyLayout from "../CompanyDetails";
import { useApiGet } from "../../../utils/hooks/query";
import { get_company } from "../../../api/companies";
import { useParams } from "react-router-dom";
import { BsHouseFill, BsMailbox, BsPeople, BsTablet } from "react-icons/bs";
import { BiBuildingHouse } from "react-icons/bi";
import { GrLocationPin } from "react-icons/gr";
import { FaPeopleGroup } from "react-icons/fa6";
import { useAuth } from "../../../utils/hooks/Auth";
import Layout from "../../../Layout/Dashboard/Layout";

export default function CompanyOverview() {
    const { currentUser } = useAuth()
    let company_id: any = useParams();
    console.log(currentUser)
    company_id = company_id.id


    const is_admin = currentUser?.user_type == "admin"
    is_admin ? company_id = currentUser?.company: company_id = company_id

    const { data, isError, isLoading } = useApiGet(
        ["company", company_id],
        () => get_company(company_id!)
    );

    if (isLoading) {
        return <Layout><div>Loading company details...</div></Layout>;
    }

    if (isError) {
        return <Layout><div>Error fetching company details. Please try again later.</div></Layout>;
    }

    console.log(data)


    return (
        <CompanyLayout>
            <div className="flex">
                <div className="border-r mt-4 flex flex-col ml-4">
                    <div className="flex gap-4 items-center mt-4 mr-8">
                        <div className="">
                            <BsHouseFill size={40} />
                        </div>
                        <div>
                            <h2 className="font-bold text-secondary">{data.name}</h2>
                            <h4 className="font-bold text-sm">Tax ID: {data.piva}</h4>
                        </div>
                    </div>
                    <div className="py-8 mr-8 border-y my-8">
                        <h2 className="font-bold text-secondary mb-2">Address Info</h2>
                        <div>
                            <ul className="flex flex-col gap-4">
                                <li className="flex gap-2 text-sm">
                                    <GrLocationPin size={24} />
                                    <h6 className="font-bold text-tertiary">Address:</h6>
                                    <p className="font-bold max-w-36"> {data.address}</p>
                                </li>
                                <li className="flex gap-2 text-sm">
                                    <BsMailbox size={24} />
                                    <h6 className="font-bold text-tertiary">Post Code:</h6>
                                    <p className="font-bold">{data.cap}</p>
                                </li>
                                <li className="flex gap-2 text-sm">
                                    <BiBuildingHouse size={24} />
                                    <h6 className="font-bold text-tertiary">City / State:</h6>
                                    <p className="font-bold">{data.city}, {data.country}</p>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="mr-8">
                        <h2 className="font-bold text-secondary mb-2">Structure Summary</h2>
                        <div>
                            <ul className="flex flex-col gap-4">
                                <li className="flex gap-2 text-sm">
                                    <BsPeople size={24} />
                                    <h6 className="font-bold text-tertiary">Users:</h6>
                                    <p className="font-bold"> {data.users.length} users</p>
                                </li>
                                <li className="flex gap-2 text-sm">
                                    <FaPeopleGroup size={24} />
                                    <h6 className="font-bold text-tertiary">Teams:</h6>
                                    <p className="font-bold">{data.teams.length} teams</p>
                                </li>
                                <li className="flex gap-2 text-sm">
                                    <BsTablet size={24} />
                                    <h6 className="font-bold text-tertiary">Devices:</h6>
                                    <p className="font-bold">{data.devices.length} devices</p>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </CompanyLayout>
    );
}
