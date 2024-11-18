import axios from "axios"
export const apiUrl = import.meta.env.VITE_BASE_API_URL;


import {
    AxiosRequestConfig,
    AxiosResponse,
    AxiosError,
    InternalAxiosRequestConfig
} from "axios";

export const client = (() => {
    return axios.create({
        baseURL: apiUrl,
        headers: {
        Accept: "application/json, text/plain, */*",
        },
    });
})();

let isRefreshing = false;

client.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const tokens = localStorage.getItem("tokens");
        if (tokens && config.url !== "/auth/refresh_token") {
            const access_token = JSON.parse(tokens).access_token
            config.headers.Authorization = `Bearer ${access_token}`;
        }
        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    },
);


client.interceptors.response.use(
    (res: AxiosResponse) => {
        return res; // Simply return the response
    },
    async (error) => {
        const status = error.response ? error.response.status : null;

        if (status === 401 && !isRefreshing) {
            const saved_tokens = localStorage.getItem("tokens")
            if (saved_tokens){
                isRefreshing = true;
                const refresh_token = JSON.parse(saved_tokens).refresh_token
                try {
                    const response = await request({
                        method: "GET",
                        url: "/auth/refresh_token",
                        headers: {"Authorization": `Bearer ${refresh_token}`}
                    })
                    const tokens_to_save = {refresh_token: refresh_token, access_token: response.access_token}
                    localStorage.setItem("tokens", JSON.stringify(tokens_to_save))

                    isRefreshing = false
                    error.config.headers.Authorization = `Bearer ${tokens_to_save.access_token}`;
                    return client(error.config);
                } catch (error) {
                    isRefreshing = false
                    localStorage.removeItem("tokens")
                    localStorage.removeItem("user")
                    window.location.href = "/login"
                    return Promise.reject(error);
                }
            }
        }

        if (status === 403 && error.response.data) {
            return Promise.reject(error.response.data);
        }
        return Promise.reject(error);
    }
);


const request = async (options: AxiosRequestConfig) => {
    const onSuccess = (response: AxiosResponse) => {
        const { data } = response;
        return data;
    };

    const onError = function (error: AxiosError) {
        return Promise.reject({
            message: error.message,
            code: error.code,
            response: error.response,
        });
    };

    return client(options).then(onSuccess).catch(onError);
};

export default request;
