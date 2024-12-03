import request from "../utils/network";
import { Login, ResetPasswordRequest } from "../types/Auth";
import { CreateUserAccount } from "../types/Auth";

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

export const get_company_users = (company_id: string, is_staff: boolean = false) => request({
    method: "GET",
    url: "/auth/company_users",
    params: {company_id: company_id, is_staff: is_staff}
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


export const create_account = async (data: CreateUserAccount, token: string) => await request ({
        method: "POST",
        url: "/invites/register_invited_user",
        data: data,
        params: {token: token}
    })

