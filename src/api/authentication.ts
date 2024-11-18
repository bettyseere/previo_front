import request from "../utils/network";
import { Login, ResetPasswordRequest } from "../types/Auth";

export const login = async (data: Login) => await request ({
    method: "POST",
    url: "/auth/login",
    data: data
})


export const logout = async () => await request({
    method: "GET",
    url: "/auth/logout"
})


export const get_all_users = async () => await request({
    method: "GET",
    url: "/auth"
})


export const me = async () => await request({
    method: "GET",
    url: "/auth/me"
})

export const delete_user = async (id: string) => await request({
    method: "GET",
    url: `/auth/${id}`
})


export const request_password_reset = async (data: ResetPasswordRequest) => await request({
    method: "POST",
    url: `/auth/password_reset_request`,
    data: data
})
