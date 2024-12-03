import request from "../utils/network";
import { Company } from "../types/Company";

export const get_companies = async () => request({
    method: "GET",
    url: "/company"
})

export const get_company = async (id: string) => request({
    method: "GET",
    url: `/company/${id}`
})

export const create_company = async (data: Company) => request({
    method: "POST",
    url: "/company",
    data: data
})

export const delete_company = async (id: string) => request({
    method: "DELETE",
    url: `/company/${id}`
})


export const update_company = async (data: Company, id: string) => request({
    method: "PATCH",
    url: `/company/${id}`,
    data: data
})