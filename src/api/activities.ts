import request from "../utils/network"

export const get_exercises = () => request({
    method: "GET",
    url: "/activities"
})


