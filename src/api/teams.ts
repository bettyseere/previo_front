import request from "../utils/network";
import { CreateTeam, UpdateTeam } from "../types/Team";


export const get_company_teams = async (company_id: string) => request({
    method: "GET",
    url: `/team/company_teams?company_id=${company_id}`
})

export const get_teams = async () => request({
    method: "GET",
    url: "/team"
})


export const get_team = async (id: string) => request({
    method: "GET",
    url: `/team/${id}`
})

export const create_team = async (data: CreateTeam) => request({
    method: "POST",
    url: "/team",
    data: data
})

export const delete_team = async (id: string) => request({
    method: "DELETE",
    url: `/team/${id}`
})


export const update_team = async (data: UpdateTeam, id: string) => request({
    method: "PATCH",
    url: `/team/${id}`,
    data: data
})