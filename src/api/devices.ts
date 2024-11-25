import request from "../utils/network";


export const get_devices = () => request({
    method: "GET",
    url: "/devices"
})

export const get_single_devices = (device_id: string) => request({
    method: "GET",
    url: `/devices/${device_id}`
})


export const get_user_devices = (user_id: string) => request({
    method: "GET",
    url: "/devices",
    params: {user_id: user_id}
})

export const get_company_devices = (company_id: string) => request({
    method: "GET",
    url: "/devices",
    params: {company_id: company_id}
})
