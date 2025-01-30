import { CreateActivityAttribute } from "../../../types/Activity";
import request from "../../../utils/network";


export const get_activity_attributes = async (sub_activity_id: string) => request({
    method: "GET",
    url:   `/activity_attributes?sub_activity=${sub_activity_id}`
})

export const create_activity_attribute = async (data: CreateActivityAttribute) => request({
    method: "POST",
    url: "/activity_attributes",
    data: data
})


export const delete_activity_attribute = async (attribute_id: string, sub_activity_id : any) => request({
    method: "DELETE",
    url: `/activity_attributes?attribute_id=${attribute_id}&sub_activity_id=${sub_activity_id}`
})

export const update_activity_attribute = async (attribute_id: string, sub_activity_id : string, data: CreateActivityAttribute) => request({
    method: "PATCH",
    url: `/activity_attributes?attribute_id=${attribute_id}&sub_activity_id=${sub_activity_id}`,
    data: data
})
