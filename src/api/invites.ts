import request from "../utils/network";
import { CompanyUserInvite } from "../types/Inites";
import { SuperUserInvite } from "../types/Inites";

export const invite_super_user = async (data: SuperUserInvite) => request ({
    method: "POST",
    url: "/invites/invite_super_user",
    data: data
})


export const invite_company_user = async (data: CompanyUserInvite) => request({
    method: "POST",
    url: "/invites/invite_company_user",
    data: data
})


export const invites = async () => request({
    method: "GET",
    url: "/invites"
})


export const get_single_invite = async (id: string) => request({
    method: "GET",
    url: `/invites/${id}`
})