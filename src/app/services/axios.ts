import Axios, { AxiosInstance } from "axios";
import { isOnVercelEnv } from "../utils/utils";
import { supabase } from "./supabase/client";

let baseURL: string = "http://localhost:3000/api"; // Dev
if (isOnVercelEnv()) {
    baseURL = "https://my-portfolio-server-wirayut.vercel.app/api"; // Prod
}

const axios: AxiosInstance = Axios.create({
    baseURL: baseURL,
    headers: {
        "Content-Type": "application/json",
    },
});

const getAuthToken = async (): Promise<string | undefined> => {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token;
};

axios.interceptors.request.use(
    async (config) => {
        const token = await getAuthToken();
        // console.log(token)
        if (token) {
            config.headers["x-access-token"] = token;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default axios;