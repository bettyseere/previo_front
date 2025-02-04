import request from "../../utils/network";
import { CreateMeasurement, UpdateMeasurement } from "../../types/Measurements";


export const get_measurements = async () => request({
    method: "GET",
    url: "/measurements"
})

export const get_user_measurements = async (athlete_id: string) => request({
    method: "GET",
    url: `/measurements?athlete_id=${athlete_id}`
})

export const get_team_measurements = async (team_id: string, access: string = "individual", role_id: any = null) => request({
    method: "GET",
    url: `/measurements?team_id=${team_id}&access=${access}&role_id=${role_id}`
})

export const create_measurement = async (data: CreateMeasurement) => request({
    method: "POST",
    url: "/measurements",
    data: data
})

export const get_measurement =  async (id: string) => request({
    method: "GET",
    url: `/measurements/${id}`
})

export const delete_measurement = async (id: string) => request({
    method: "DELETE",
    url: `/measurements/${id}`
})

export const update_measurement = async (id: string, data: UpdateMeasurement) => request({
    method: "PATCH",
    url: `/measurements/${id}`,
    data: data
})