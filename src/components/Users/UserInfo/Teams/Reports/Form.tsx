import { usePopup } from "../../../../../utils/hooks/usePopUp";
import Form from "../../../../Commons/Form";
import { useForm } from "react-hook-form";
import Button from "../../../../Commons/Button";
import { get_company_devices } from "../../../../../api/devices";
import { get_team_members } from "../../../../../api/team_members";
import { useApiSend, useApiGet } from "../../../../../utils/hooks/query";
import { get_sub_activities } from "../../../../../api/activities/sub_activities/sub_activities";
import { queryClient } from "../../../../../main";
import { create_measurement, update_measurement } from "../../../../../api/measurements/measurements";
import { useAuth } from "../../../../../utils/hooks/Auth";
import Popup from "../../../../Commons/Popup";
import { get_attributes } from "../../../../../api/measurements/attributes";
import { useParams } from "react-router-dom";

export default function MeasurementForm(){
    const {currentUser} = useAuth()
    const {reset, handleSubmit, register} = useForm()
    const { hidePopup, handleHidePopup } = usePopup();
    const company_id = currentUser?.company
    let team_id = useParams().id

    const operation = hidePopup.type === "create" ? create_measurement : (data: any) =>  hidePopup.data.id && update_measurement(hidePopup.data.id, data);
    const { mutate, isPending } = useApiSend(operation, undefined, undefined, ["measurements"]);

    const { data: company_devices, isLoading: isLoadingDevices, error: CompanyDevicesError } = useApiGet(["company_devices", company_id], () => get_company_devices(company_id))
    const { data: team_members, isLoading: isLoadingAthletes, error: AthtletesError } = useApiGet(["team_members", team_id], () => get_team_members(team_id))
    const {data: activities, isLoading: activitiesLoading, error: activitiesError} = useApiGet(["sub_activities"], get_sub_activities)
    const {data: attributes, isLoading: isLoadingAttributes, error: attributesError} = useApiGet(["measurement_attributes"], get_attributes)

    if (isLoadingDevices){
        return (
            <Popup>
                <div  className="text-2xl font-bold text-secondary w-[24rem] p-8">Fetching devices ...</div>
            </Popup>
        )
        }

    let user_team = currentUser?.teams
    user_team = user_team?.find(team => team.team.id == team_id)
    const team_role = user_team?.role.id || null

    if (CompanyDevicesError){
        return (
            <Popup>
                <div  className="text-2xl font-bold text-secondary w-[24rem] p-8">Error fetching devices</div>
            </Popup>
        )
    }

    if (isLoadingAthletes){
        return (
            <Popup>
                <div  className="text-2xl font-bold text-secondary w-[24rem] p-8">Fetching athletes ...</div>
            </Popup>
        )
        }

    if (isLoadingAttributes){
        return(
            (
            <Popup>
                <div  className="text-2xl font-bold text-secondary w-[24rem] p-8">Fetching attributes ...</div>
            </Popup>
        )
        )
    }

    if (AthtletesError){
        return (
            <Popup>
                <div  className="text-2xl font-bold text-secondary w-[24rem] p-8">Error fetching athletes</div>
            </Popup>
        )
    }

    if (activitiesLoading){
        return (
            <Popup>
                <div  className="text-2xl font-bold text-secondary w-[24rem] p-8">Fetching activities ...</div>
            </Popup>
        )
        }

    if (activitiesError){
        return (
            <Popup>
                <div  className="text-2xl font-bold text-secondary w-[24rem] p-8">Error fetching activities</div>
            </Popup>
        )
    }

    if (attributesError){
        return (
            <Popup>
                <div  className="text-2xl font-bold text-secondary w-[24rem] p-8">Error fetching attributes</div>
            </Popup>
        )
    }

    const onSubmit = (data: any) => {
        data.team_id = team_id
        data.role_id = team_role
        mutate(data, {
            onSuccess: (response) => {
                console.log(response)
                queryClient.invalidateQueries(["measurements"]);
                handleHidePopup({ show: false, type: "create" });
                reset();
            },
            onError: (error) => {
                console.error("Error inviting company user:", error);
            },
        });
    }

    return(
        <div>
            <Form formTitle={hidePopup.type == "create" ? "Create Measurement": "Edit Measurement"} handleSubmit={handleSubmit(onSubmit)}>
                <div className="grid grid-cols-2 gap-4 items-center my-4 w-[24rem]">
                    <div className="mt-4">
                        <label htmlFor="owner" className="block text-sm font-medium text-black">
                            Athlete
                        </label>
                        <select id="athlete_id"
                            {...register("athlete_id", { required: "Owner is required" })} className="outline-none border-b-2 border-primary w-full py-2">
                            {hidePopup.type === "edit" && hidePopup.data?.owner_id && (
                                <option value={hidePopup.data.owner_id}>{hidePopup.data.owner}</option>
                            )}
                            {/* Filter out the current owner from the team_members list */}
                            {team_members
                                .map((user: any) => (
                                    <option key={user.user.id} value={user.user.id}>
                                        {user.user.first_name + " " + user.user.last_name}
                                    </option>
                                ))}
                        </select>
                    </div>

                    <div className="mt-4">
                        <label htmlFor="owner" className="block text-sm font-medium text-black">
                            Devices
                        </label>
                        <select id="device_id"
                            {...register("device_id", { required: "Device is required" })} className="outline-none border-b-2 border-primary w-full py-2">
                            {hidePopup.type === "edit" && hidePopup.data?.owner_id && (
                                <option value={hidePopup.data.owner_id}>{hidePopup.data.owner}</option>
                            )}
                            {/* Filter out the current owner from the company_devices list */}
                            {company_devices
                                .map((device: any) => (
                                    <option key={device.id} value={device.id}>
                                        {device.device_type.name}
                                    </option>
                                ))}
                        </select>
                    </div>

                    <div className="mt-4">
                        <label htmlFor="owner" className="block text-sm font-medium text-black">
                            Activities
                        </label>
                        <select id="sub_activity_id"
                            {...register("sub_activity_id", { required: "Activity is required" })} className="outline-none border-b-2 border-primary w-full py-2">
                            {/* Filter out the current owner from the team_members list */}
                            {activities
                                .map((activity: any) => (
                                    <option key={activity.id} value={activity.id}>
                                        {activity.name.en}
                                    </option>
                                ))}
                        </select>
                    </div>

                    <div className="mt-4">
                        <label htmlFor="attribute_id" className="block text-sm font-medium text-black">
                            Measurement
                        </label>
                        <select id="attribute_id"
                            {...register("attribute_id", { required: "Attribute is required" })} className="outline-none border-b-2 border-primary w-full py-2">
                            {/* Filter out the current owner from the team_members list */}
                            {attributes
                                .map((attribute: any) => (
                                    <option key={attribute.id} value={attribute.id}>
                                        {attribute.name.en}
                                    </option>
                                ))}
                        </select>
                    </div>

                    <div className="mt-4">
                        <label htmlFor="value" className="block text-sm font-medium text-black">
                            Result
                        </label>
                        <input
                            id="value"
                            type="text"
                            placeholder="50"
                            {...register("value", { required: "Result is required" })}
                            className="outline-none border-b-2 border-primary w-full py-2"
                        />
                    </div>

                </div>
                <Button
                    type="submit"
                    text={isPending ? "Submitting.." : "Submit"}
                    styling="text-white px-4 py-1 rounded"
                />
            </Form>
        </div>
    )
}