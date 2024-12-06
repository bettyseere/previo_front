import request from "../utils/network";
import { DeviceType } from "../types/DeviceTypes";


export const get_single_device_type = (id: string) => request({
    method: "GET",
    url: `/device_types/${id}`
})


export const create_device_type = (data: DeviceType) => request({
    method: "POST",
    url: "/device_types",
    data: data
})

export const delete_device_type = (device_id: string) => request({
    method: "DELETE",
    url: `/device_types/${device_id}`
})


export const update_device_type = async (data: DeviceType, id: string) => request({
    method: "PATCH",
    url: `/device_types/${id}`,
    data: data
})


export const get_device_types = () => request({
    method: "GET",
    url: "/device_types"
})