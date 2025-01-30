import { CreateRole, UpdateRole } from "../types/Role";
import request from "../utils/network";


export const get_roles = async () => request({
    method: "GET",
    url: "/roles"
})

export const get_role = async (id: string) => request({
    method: "GET",
    url: `/roles/${id}`
})

export const create_role = async (data: CreateRole) => request({
    method: "POST",
    url: "/roles",
    data: data
})

export const delete_role = async (id: string) => request({
    method: "DELETE",
    url: `/roles/${id}`
})


export const update_role = async (data: UpdateRole, id: string) => request({
    method: "PATCH",
    url: `/roles/${id}`,
    data: data
})