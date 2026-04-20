import axios, { AxiosHeaders } from "axios";
import { getAuthToken } from "./auth";
import { BACKEND_URL } from "./config";

export const api = axios.create({
    baseURL: BACKEND_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

api.interceptors.request.use((config) => {
    const token = getAuthToken();
    const headers = AxiosHeaders.from(config.headers);
    if (token) {
        headers.set("Authorization", `Bearer ${token}`);
    } else {
        headers.delete("Authorization");
    }
    config.headers = headers;
    return config;
});
