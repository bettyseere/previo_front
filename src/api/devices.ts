import request from "../utils/network";
import { Device } from "../types/Device";


export const get_devices = () => request({
    method: "GET",
    url: "/devices"
})

export const get_single_devices = (device_id: string) => request({
    method: "GET",
    url: `/devices/${device_id}`
})


export const get_user_devices = (user_id: string) => request({
    method: "GET",
    url: "/devices",
    params: {user_id: user_id}
})

export const get_company_devices = (company_id: string) => request({
    method: "GET",
    url: "/devices/company_devices",
    params: {company_id: company_id}
})


export const get_device_type_devices = (device_type_id: string) => request({
    method: "GET",
    url: "/devices/device_type_devices",
    params: {device_type_id: device_type_id}
})

export const remove_user = (id: string) => request({
    method: "PATCH",
    url: "/devices/remove_user/"+id
})


export const create_device = (data: Device) => request({
    method: "POST",
    url: "/devices",
    data: data
})

export const delete_device = (device_id: string) => request({
    method: "DELETE",
    url: `/devices/${device_id}`
})


export const update_device = async (data: Device, id: string) => request({
    method: "PATCH",
    url: `/devices/${id}`,
    data: data
})
