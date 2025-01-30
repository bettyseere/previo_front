import { CreateSubActivity, SubActivity } from "../../../types/Activity";
import request from "../../../utils/network";


// export const get_sub_activities = async ()
export const get_sub_activities = async () => request({
    method: "GET",
    url:   `/sub_activities`
})

export const create_sub_activity = async (data: SubActivity) => request({
    method: "POST",
    url: "/sub_activities",
    data: data
})

export const get_activity_sub_activities = async (activity_id: string) => request({
    method: "GET",
    url: "/sub_activities/activity/"+activity_id
})

export const get_sub_activity =  async (id: string) => request({
    method: "GET",
    url: `/sub_activities/${id}`
})

export const delete_sub_activity = async (id: string) => request({
    method: "DELETE",
    url: `/sub_activities/${id}`
})

export const update_sub_activity = async (id: string, data: CreateSubActivity) => request({
    method: "PATCH",
    url: `/sub_activities/${id}`,
    data: data
})