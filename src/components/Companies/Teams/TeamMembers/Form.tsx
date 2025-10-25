import Form from "../../../Commons/Form";
import Button from "../../../Commons/Button";
import { usePopup } from "../../../../utils/hooks/usePopUp";
import { useApiSend } from "../../../../utils/hooks/query";
import { useForm } from "react-hook-form";
import { create_team_member, update_team_member } from "../../../../api/team_members";
import { useState } from "react";
import { get_company_users } from "../../../../api/authentication";
import { useApiGet } from "../../../../utils/hooks/query";
import { queryClient } from "../../../../main";
import Popup from "../../../Commons/Popup";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../../utils/hooks/Auth";
import { get_roles } from "../../../../api/roles";
import Dropdown from "../../../Commons/Dropdown";

interface athletes {
    added_athletes?: [any]
    team_id?: string
}

export default function TeamMembersForm({team_id, added_athletes}: athletes) {
    const { hidePopup, handleHidePopup } = usePopup();
    const [selected_athletes, setSelectedAthletes] = useState([]);
    const { register, handleSubmit, reset, control } = useForm();
    const {currentUser} = useAuth()
    const user_id = currentUser?.id
    const company_id = currentUser?.company


    const operation = hidePopup.type === "create" ? create_team_member : (data: any) => update_team_member(data, team_id, user_id);
    const { mutate, isError, isSuccess, isPending, error } = useApiSend(operation, undefined, undefined, ["team_members"]);
    const { data: athletes, isLoading: isAthletesLoading } = useApiGet(["athletes", company_id], ()=>get_company_users(company_id))
    const { data: roles, isLoading: isLoadingRoles } = useApiGet(["roles"], get_roles)
    const navigate = useNavigate()
    const access_types = [
            // {key: "individual", value: "Individual"},
            {key: "role", value: "Based on role"},
            {key: "all", value: "All Data"}
        ]

    const handle_create_more_athletes = () => {
        navigate("/athletes")
        handleHidePopup({show: true, type: "create"})
    }

    if (isAthletesLoading) {
        return <Popup><div  className="text-2xl font-bold text-secondary bg-white p-4 w-[20rem]">Fetching athletes...</div></Popup>
        }

    if (isLoadingRoles) {
        return <Popup><div  className="text-2xl font-bold text-secondary bg-white p-4 w-[20rem]">Fetching roles...</div></Popup>
        }

    if (athletes && athletes.length == added_athletes?.length){
        return (
            <Popup>
                <div className="w-[24rem] text-white p-4">
                    <div  className="text font-semibold text-red-500">
                        All existing athletes have been added to this team. You need to invite new members.
                    </div>
                    <div className="mt-2 flex justify-between">
                        <Button text="Invite more athletes" handleClick={handle_create_more_athletes} />
                        <Button text="Cancel" styling="bg-red-500" handleClick={()=>handleHidePopup({show: false, type: "create"})} />
                    </div>
                </div>
            </Popup>
        )
    }

    let athletes_to_select = athletes.filter(athlete => !selected_athletes.some(item => item.user_id === athlete.id));
    athletes_to_select = athletes_to_select.filter(athlete => !added_athletes?.some(item => item.user.id === athlete.id))
    // athletes_to_select = Array(100).fill(athletes_to_select).flat();


    const onSubmit = (data: any) => {
        const role_name = roles.find(role => role.id === data.role_id)
        const athlete_name = athletes.find(athlete => athlete.id == data.user_id)
        data.athlete_name = athlete_name.email
        role_name ? role_name.name : null
        data.team_id = team_id



        // Add the new translation to the finished_translations array
        setSelectedAthletes(prevAthletes => [
            ...prevAthletes,
            data
        ]);

        // Reset the form for the next translation input
        console.log(athletes_to_select.length, "This is the number of remaining slots")
        reset();
    };

    const submitTeamMembers = () => {
            // Send all translations to the API (you can adjust this API call as needed)
            let athletes_to_submit = [];
            selected_athletes.forEach(athlete => athletes_to_submit.push({
                team_id: athlete.team_id,
                user_id: athlete.user_id,
                role_id: athlete.role_id.length > 0 ? athlete.role_id: null,
                access_type: athlete.access_type
            }))
            mutate({ team_members: athletes_to_submit }, {
                onSuccess: () => {
                    queryClient.invalidateQueries(["team_members"]);
                    handleHidePopup({ show: false, type: "create" }); // Close the popup on success
                    setSelectedAthletes([]); // Clear the translations after submission
                    reset(); // Reset form fields
                },
                onError: (error) => {
                    console.error("Error adding team members:", error);
                },
            });
        };

    // Handle Delete button click
    const handleDelete = (index: number) => {
        // Remove the item from the finished_translations list
        const new_selected_athletes = selected_athletes.filter((_, i) => index !== i)
        setSelectedAthletes(new_selected_athletes)
        // hidePopup.type == "edit" && handleHidePopup({type: "edit", show: true, data: {id: hidePopup.data.id, activities: new_translations}})
    };


    return (
        <div>
            {/* Display the added translations */}
            <Form formTitle={hidePopup.type === "create" ? "Add Team Member" : "Edit Team Member"} handleSubmit={handleSubmit(onSubmit)}>
                {selected_athletes.length > 0 && (
                    <div className="py-4 border-b bg-white rounded-t-md w-[22rem]">
                        <h3 className="font-semibold text-secondary text-xl">Added Athletes</h3>

                        <div className="flex py-2 gap-2 flex-col">
                            {selected_athletes.map((item, i) => (
                                <div className="rounded-md w-full flex justify-between gap-12" key={i}>
                                    <div className="flex gap-4">
                                        <div>{item.athlete_name}</div> {item.role_name && <div>{item.role_name}</div>}
                                    </div>
                                    <div className="flex gap-4">
                                        <Button text="Remove" styling="bg-red-500" handleClick={() => handleDelete(i)} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

            {athletes_to_select.length > 0 && <div className="grid grid-cols-1 gap-4 items-center mt-2 w-[22rem]">
                <div className="flex w-full items-center">
                    <div className="w-full">
                        <label htmlFor="user_id" className="block text-sm font-medium text-black mb-2">
                            Team Member
                        </label>
                        {/* <select
                            id="user_id"
                            {...register("user_id", { required: "Team member is required" })}
                            className="outline-none border-b-2 border-primary w-[22rem] py-2"
                        >
                        <option value={""}>Select Team Member</option>
                        {athletes_to_select.map(item => (
                            <option key={item.id} value={item.id}>
                                {item.first_name} {item.last_name}
                            </option>
                        ))}
                        </select> */}

                        <Dropdown
                            name="user_id"
                            options={athletes_to_select.map(athlete => ({value: athlete.id, label: `${athlete.email}`}))}
                            control={control}
                            onSelect={(val) => console.log("Selected:", val)}
                            rules={{ required: "Team member is required" }}
                        />
                    </div>
                </div>

                <div className="flex w-full items-center">
                    <div className="">
                        <label htmlFor="access_type" className="block text-sm font-medium text-black">
                            Data access
                        </label>
                        <select
                            id="access_type"
                            {...register("access_type", { required: "Attribute is required" })}
                            className="outline-none border-b-2 border-primary w-[22rem] py-2"
                        >
                        <option value={"individual"}>Individual</option>
                        {access_types.map(item => (
                            <option key={item.key} value={item.key}>
                                {item.value}
                            </option>
                        ))}
                        </select>
                    </div>
                </div>

                <div className="flex w-full items-center">
                    <div className="">
                        <label htmlFor="roles" className="block text-sm font-medium text-black">
                            Role
                        </label>
                        <select
                            id="role_id"
                            {...register("role_id")}
                            className="outline-none border-b-2 border-primary w-[22rem] py-2"
                        >
                        <option value={""}>Set Role</option>
                        {roles.map(item => (
                            <option key={item.id} value={item.id}>
                                {item.name}
                            </option>
                        ))}
                        </select>
                    </div>
                </div>
            </div>}

            <div className="mt-6 flex justify-between items-center w-[22rem]">
                <div className="">
                    <Button
                    type="submit"
                    text={"Add athlete"}
                    styling="text-white px-4 py-1 rounded"
                />
                </div>

                    {/* Submit All Translations Button */}
                    {selected_athletes.length > 0 && (
                        <div className="">
                            <Button
                                type="button"
                                text="Submit"
                                handleClick={submitTeamMembers}
                                styling="bg-green-600 text-white px-4 py-1 rounded"
                            />
                        </div>
                    )}
                </div>

                {/* Error and Success Messages */}
                {isError && (
                    <div className="mt-4 text-sm text-red-600">
                        Error adding team member: {"Something went wrong!"}
                    </div>
                )}

                {isSuccess && (
                    <div className="mt-4 text-sm text-green-600">Team member added successfully!</div>
                )}
            </Form>
        </div>
    );
}
