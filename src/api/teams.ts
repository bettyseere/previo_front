import request from "../utils/network";


export const get_teams = async () => request({
    method: "GET",
    url: `/team`
})