import { CreateTeamMembers, UpdateTeamMember } from "../types/TeamMember";
import request from "../utils/network";



export const get_team_members = async (team_id: any) => request({
    method: "GET",
    url: `/team_members?team_id=${team_id}`
})

export const get_team_member = async (user_id: string, team_id: string) => request({
    method: "GET",
    url: `/team_members?user_id=${user_id}&team_id=${team_id}`
})

export const create_team_member = async (data: CreateTeamMembers) => request({
    method: "POST",
    url: "/team_members",
    data: data
})

export const delete_team_member = async (user_id: any, team_id: any) => request({
    method: "DELETE",
    url: `/team_members?user_id=${user_id}&team_id=${team_id}`
})


export const update_team_member = async (data: UpdateTeamMember, team_id: any, user_id: any) => request({
    method: "PATCH",
    url: `/team_members?user_id=${user_id}&team_id=${team_id}`,
    data: data
})
