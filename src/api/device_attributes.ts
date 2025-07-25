import request from "../utils/network";
import { CreateDeviceAttribute, UpdateDeviceAttribute } from "../types/DeviceTypes";


export const get_single_device_attribute = (attribute_id: string, device_type_id: string) => request({
    method: "GET",
    url: `/device_attributes/?attribute_id=${attribute_id}&device_type_id=${device_type_id}/`
})


export const create_device_attribute = (data: CreateDeviceAttribute) => request({
    method: "POST",
    url: "/device_attributes",
    data: data
})

export const delete_device_attribute = (device_type_id: string, attribute_id: string) => request({
    method: "DELETE",
    url: `/device_attributes?device_type_id=${device_type_id}&attribute_id=${attribute_id}`
})


export const update_device_attribute = async (data: UpdateDeviceAttribute, device_type_id: string, attribute_id: string) => request({
    method: "PATCH",
    url: `/device_attributes?device_type_id=${device_type_id}&attribute_id=${attribute_id}`,
    data: data
})


export const get_device_attributes = async (device_type_id: string) => request({
    method: "GET",
    url: `/device_attributes?device_type_id=${device_type_id}`
})
