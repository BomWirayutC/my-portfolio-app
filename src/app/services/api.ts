import axios from "./axios";
import ApiResponse from "./response";
import Profile from "./models/profile";
import { Skill, Skills } from "./models/skills";
import { Certificate, Certificates } from "./models/certificates";
import { Project, Projects } from "./models/projects";
import FileResult from "./models/fileResult";

export const getProfile = async (): Promise<ApiResponse<Profile>> => {
    const response = await axios.get<ApiResponse<Profile>>("/getProfile");
    return response.data;
}

export const getSkills = async (): Promise<ApiResponse<Skills>> => {
    const response = await axios.get<ApiResponse<Skills>>("/getSkills");
    return response.data;
}

export const getCertificates = async (): Promise<ApiResponse<Certificates>> => {
    const response = await axios.get<ApiResponse<Certificates>>("/getCertificates");
    return response.data;
}

export const getProjects = async (): Promise<ApiResponse<Projects>> => {
    const response = await axios.get<ApiResponse<Projects>>("/getProjects");
    return response.data;
}

export const addSkill = async (request: Skill): Promise<ApiResponse<null>> => {
    const response = await axios.post<ApiResponse<null>>("/addSkill", request);
    return response.data;
}

export const updateSkillById = async (request: Skill): Promise<ApiResponse<null>> => {
    const response = await axios.post<ApiResponse<null>>("/updateSkillById", request);
    return response.data;
}

export const deleteSkillById = async (id: string): Promise<ApiResponse<null>> => {
    const response = await axios.post<ApiResponse<null>>("/deleteSkillById", { id });
    return response.data;
}

export const updateSkillDisplayOrder = async (request: Skills): Promise<ApiResponse<null>> => {
    const response = await axios.post<ApiResponse<null>>("/updateSkillDisplayOrder", request);
    return response.data;
}

export const updateProfile = async (request: Profile): Promise<ApiResponse<null>> => {
    const response = await axios.post<ApiResponse<null>>("/updateProfile", request);
    return response.data;
}

export const uploadFile = async (formData: FormData): Promise<ApiResponse<FileResult>> => {
    const response = await axios.post<ApiResponse<FileResult>>("/uploadFile", formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        }
    });
    return response.data;
}

export const addProject = async (request: Project): Promise<ApiResponse<null>> => {
    const response = await axios.post<ApiResponse<null>>("/addProject", request);
    return response.data;
}

export const updateProjectById = async (request: Project): Promise<ApiResponse<null>> => {
    const response = await axios.post<ApiResponse<null>>("/updateProjectById", request);
    return response.data;
}

export const deleteProjectById = async (id: string): Promise<ApiResponse<null>> => {
    const response = await axios.post<ApiResponse<null>>("/deleteProjectById", { id });
    return response.data;
}

export const updateProjectDisplayOrder = async (request: Projects): Promise<ApiResponse<null>> => {
    const response = await axios.post<ApiResponse<null>>("/updateProjectDisplayOrder", request);
    return response.data;
}

export const addCertificate = async (request: Certificate): Promise<ApiResponse<null>> => {
    const response = await axios.post<ApiResponse<null>>("/addCertificate", request);
    return response.data;
}

export const updateCertificateById = async (request: Certificate): Promise<ApiResponse<null>> => {
    const response = await axios.post<ApiResponse<null>>("/updateCertificateById", request);
    return response.data;
}

export const deleteCertificateById = async (id: string): Promise<ApiResponse<null>> => {
    const response = await axios.post<ApiResponse<null>>("/deleteCertificateById", { id });
    return response.data;
}

export const updateCertificateDisplayOrder = async (request: Certificates): Promise<ApiResponse<null>> => {
    const response = await axios.post<ApiResponse<null>>("/updateCertificateDisplayOrder", request);
    return response.data;
}