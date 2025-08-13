
import SubMenu from "../Commons/Submenu"

interface props {
    children: React.ReactNode
}

export default function UserSubMenu({children}: props){
    const sub_menu_nav = [
        {name: "Users", link: "/users"},
        {name: "Invites", link: "/invites/"}
    ]
    return (
        <SubMenu sub_page_props={sub_menu_nav}>
            {children}
        </SubMenu>
    )
}
