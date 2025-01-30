import request from "../../utils/network";
import { MeasurementAttribute, CreateMeasurementAttribute } from "../../types/Measurements";

export const get_attributes = async () => request({
    method: "GET",
    url: "/measurement_attributes"
})

export const create_attribute = async (data: MeasurementAttribute) => request({
    method: "POST",
    url: "/measurement_attributes",
    data: data
})

export const get_attribute  =  async (id: string) => request({
    method: "GET",
    url: `/measurement_attributes/${id}`
})

export const delete_attribute = async (id: string) => request({
    method: "DELETE",
    url: `/measurement_attributes/${id}`
})

export const update_attribute = async (id: string, data: CreateMeasurementAttribute) => request({
    method: "PATCH",
    url: `/measurement_attributes/${id}`,
    data: data
})
