import Axios, { AxiosInstance } from "axios";

const baseURL: string = "http://localhost:4000/api";

const axios: AxiosInstance = Axios.create({
    baseURL: baseURL,
    headers: {
        "Content-Type": "application/json",
    },
});

export default axios;