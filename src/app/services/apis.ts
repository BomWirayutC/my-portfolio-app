import axios from "./axios";
import AxiosResponse from "./response";
import Profile from "./models/profile";
import { Skills } from "./models/skills";
import { Certificates } from "./models/certificates";

export const getProfile = async (): Promise<AxiosResponse<Profile>> => {
    const response = await axios.get<AxiosResponse<Profile>>("/getProfile");
    return response.data;
}

export const getSkills = async (): Promise<AxiosResponse<Skills>> => {
    const response = await axios.get<AxiosResponse<Skills>>("/getSkills");
    return response.data;
}

export const getCertificates = async (): Promise<AxiosResponse<Certificates>> => {
    const response = await axios.get<AxiosResponse<Certificates>>("/getCertificates");
    return response.data;
}