import axios from "./axios";
import AxiosResponse from "./response";
import Profile from "./models/profile";
import { Skill, Skills } from "./models/skills";
import { Certificate, Certificates } from "./models/certificates";
import { Project, Projects } from "./models/projects";
import FileResult from "./models/fileResult";

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

export const getProjects = async (): Promise<AxiosResponse<Projects>> => {
    const response = await axios.get<AxiosResponse<Projects>>("/getProjects");
    return response.data;
}

export const addSkill = async (request: Skill): Promise<AxiosResponse<null>> => {
    const response = await axios.post<AxiosResponse<null>>("/addSkill", request);
    return response.data;
}

export const updateSkillById = async (request: Skill): Promise<AxiosResponse<null>> => {
    const response = await axios.post<AxiosResponse<null>>("/updateSkillById", request);
    return response.data;
}

export const deleteSkillById = async (id: string): Promise<AxiosResponse<null>> => {
    const response = await axios.post<AxiosResponse<null>>("/deleteSkillById", { id });
    return response.data;
}

export const updateProfile = async (request: Profile): Promise<AxiosResponse<null>> => {
    const response = await axios.post<AxiosResponse<null>>("/updateProfile", request);
    return response.data;
}

export const uploadFile = async (accessToken: string, formData: FormData): Promise<AxiosResponse<FileResult>> => {
    const response = await axios.post<AxiosResponse<FileResult>>("/uploadFile", formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
            'x-access-token': accessToken || ''
        }
    });
    return response.data;
}

export const addProject = async (request: Project): Promise<AxiosResponse<null>> => {
    const response = await axios.post<AxiosResponse<null>>("/addProject", request);
    return response.data;
}

export const updateProjectById = async (request: Project): Promise<AxiosResponse<null>> => {
    const response = await axios.post<AxiosResponse<null>>("/updateProjectById", request);
    return response.data;
}

export const deleteProjectById = async (id: string): Promise<AxiosResponse<null>> => {
    const response = await axios.post<AxiosResponse<null>>("/deleteProjectById", { id });
    return response.data;
}

export const addCertificate = async (request: Certificate): Promise<AxiosResponse<null>> => {
    const response = await axios.post<AxiosResponse<null>>("/addCertificate", request);
    return response.data;
}

export const updateCertificateById = async (request: Certificate): Promise<AxiosResponse<null>> => {
    const response = await axios.post<AxiosResponse<null>>("/updateCertificateById", request);
    return response.data;
}

export const deleteCertificateById = async (id: string): Promise<AxiosResponse<null>> => {
    const response = await axios.post<AxiosResponse<null>>("/deleteCertificateById", { id });
    return response.data;
}