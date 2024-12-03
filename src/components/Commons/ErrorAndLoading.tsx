import Layout from "../../Layout/Dashboard/Layout";

interface LayoutProps {
    children: React.ReactNode;
}

export default function ErrorLoading({children}: LayoutProps){
    return (
        <Layout>
            <div className="flex justify-center items-center absolute bottom-[50%] right-auto text-center w-full">
                {children}
            </div>
        </Layout>
    )
}