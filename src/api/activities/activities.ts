import request from "../../utils/network"
import { Activity, CreateActivity } from "../../types/Activity"

export const get_activities = async () => request({
    method: "GET",
    url: "/activities"
})

export const create_activity = async (data: Activity) => request({
    method: "POST",
    url: "/activities",
    data: data
})

export const get_activity =  async (id: string) => request({
    method: "GET",
    url: `/activities/${id}`
})

export const delete_activity = async (id: string) => request({
    method: "DELETE",
    url: `/activities/${id}`
})

export const update_activity = async (id: string, data: CreateActivity) => request({
    method: "PATCH",
    url: `/activities/${id}`,
    data: data
})
