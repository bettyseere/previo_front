import request from "../utils/network";
import { CreateDeviceActivity, UpdateDeviceActivity } from "../types/DeviceTypes";


export const get_single_device_activity = (activity_id: string, device_type_id: string) => request({
    method: "GET",
    url: `/device_activities/?activity_id=${activity_id}&device_type_id=${device_type_id}/`
})


export const create_device_activity = (data: CreateDeviceActivity) => request({
    method: "POST",
    url: "/device_activities",
    data: data
})

export const delete_device_activity = (device_type_id: string, activity_id: string) => request({
    method: "DELETE",
    url: `/device_activities/?device_type_id=${device_type_id}&activity_id=${activity_id}`
})


export const update_device_activity = async (data: UpdateDeviceActivity, old_device_type_id: string, old_activity_id: string) => request({
    method: "PATCH",
    url: `/device_activities/?old_device_type_id=${old_device_type_id}&old_activity_id=${old_activity_id}`,
    data: data
})


export const get_device_activities = async (device_type_id: string) => request({
    method: "GET",
    url: `/device_activities?device_type_id=${device_type_id}`
})
