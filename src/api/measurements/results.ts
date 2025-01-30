import { CreateResult, UpdateResult } from "../../types/Measurements";
import request from "../../utils/network";


export const get_results = async (measurement_id: string) => request({
    method: "GET",
    url: `/measurement_results?measurement_id=${measurement_id}`
})

export const create_result = async (data: CreateResult) => request({
    method: "POST",
    url: "/measurement_results",
    data: data
})

export const get_result =  async (id: string) => request({
    method: "GET",
    url: `/measurement_results/${id}`
})

export const delete_result = async (id: string) => request({
    method: "DELETE",
    url: `/measurement_results/${id}`
})

export const update_result = async (id: string, data: UpdateResult) => request({
    method: "PATCH",
    url: `/measurement_results/${id}`,
    data: data
})