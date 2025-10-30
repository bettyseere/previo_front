import request from "../utils/network";
import { Login, ResetPasswordRequest, UpdateUserInfo } from "../types/Auth";
import { CreateUserAccount, ChangePassword, ResetPassword } from "../types/Auth";

export const login = async (data: Login) => await request ({
    method: "POST",
    url: "/auth/login",
    data: data
})

export const user_info = async () => await request({
    method: "GET",
    url: "/auth/me"
})

export const update_user_info = async (data: UpdateUserInfo) => await request({
    method: "PATCH",
    url: "/auth",
    data: data
})

export const update_athlete_info = async (data: UpdateUserInfo) => await request({
    method: "PATCH",
    url: `/auth?id=${data?.id}`,
    data: data
})

export const logout = async () => await request({
    method: "GET",
    url: "/auth/logout"
})


export const get_all_users = async () => await request({
    method: "GET",
    url: `/auth?user_type=admin`
})

export const get_company_users = (company_id: string) => request({
    method: "GET",
    url: "/auth/company_users",
    params: {company_id: company_id}
})


export const me = async () => await request({
    method: "GET",
    url: "/auth/me"
})

export const delete_user = async (id: string) => await request({
    method: "DELETE",
    url: `/auth/${id}`
})


export const request_password_reset = async (data: ResetPasswordRequest) => await request({
    method: "POST",
    url: `/auth/password_reset_request`,
    data: data
})

export const reset_password = async (data: ResetPassword, token: string) => await request({
    method: "POST",
    url: `/auth/password_reset_confirm?token=${token}`,
    data: data
})

export const create_account = async (data: CreateUserAccount, token: string) => await request ({
        method: "POST",
        url: "/invites/register_invited_user",
        data: data,
        params: {token: token}
    })


export const change_password = async (data: ChangePassword) => request({
    method: "PATCH",
    url: "/auth/change_password",
    data: data
})
