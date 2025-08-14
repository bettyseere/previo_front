import request from "../utils/network";
import { CompanyUserInvite } from "../types/Invites";
import { SuperUserInvite } from "../types/Invites";

export const invite_super_user = async (data: SuperUserInvite) => request ({
    method: "POST",
    url: "/invites/invite_super_user",
    data: data,
    params: {redirect_url: `${window.origin}/create_account`}
})


export const invite_company_user = async (data: CompanyUserInvite) => request({
    method: "POST",
    url: "/invites/invite_company_user",
    data: data,
    params: {redirect_url: `${window.origin}/create_account`}
})


export const invites = async () => request({
    method: "GET",
    url: "/invites"
})


export const get_single_invite = async (id: string) => request({
    method: "GET",
    url: `/invites/${id}`
})


export const delete_invite = async (id: string) => request({
    method: "DELETE",
    url: `/invites/${id}`
})

export const resend_invite = async (id: string) => request({
    method: "GET",
    url: "/invites/resend_invite?id="+id+"&redirect_url="+window.origin+"/create_account"
})