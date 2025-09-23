import Axios, { AxiosInstance } from "axios";
import { isOnVercelEnv } from "../utils/utils";

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

export default axios;