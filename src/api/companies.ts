import request from "../utils/network";

export const get_companies = () => request({
    method: "GET",
    url: "/company"
})