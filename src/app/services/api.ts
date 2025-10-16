import axios from "./axios";
import ApiResponse from "./response";
import { Profile, SocialLinks, Skill, Skills, Certificate, Certificates, Project, Projects, FileResult, SocialLink } from "./models";

export const getProfile = async (): Promise<ApiResponse<Profile>> => {
    const response = await axios.get<ApiResponse<Profile>>("/profile/getProfile");
    return response.data;
}

export const getSkills = async (): Promise<ApiResponse<Skills>> => {
    const response = await axios.get<ApiResponse<Skills>>("/skill/getSkills");
    return response.data;
}

export const getCertificates = async (): Promise<ApiResponse<Certificates>> => {
    const response = await axios.get<ApiResponse<Certificates>>("/certificate/getCertificates");
    return response.data;
}

export const getProjects = async (): Promise<ApiResponse<Projects>> => {
    const response = await axios.get<ApiResponse<Projects>>("/project/getProjects");
    return response.data;
}

export const addSkill = async (request: Skill): Promise<ApiResponse<null>> => {
    const response = await axios.post<ApiResponse<null>>("/skill/addSkill", request);
    return response.data;
}

export const updateSkillById = async (request: Skill): Promise<ApiResponse<null>> => {
    const response = await axios.post<ApiResponse<null>>("/skill/updateSkillById", request);
    return response.data;
}

export const deleteSkillById = async (id: string): Promise<ApiResponse<null>> => {
    const response = await axios.post<ApiResponse<null>>("/skill/deleteSkillById", { id });
    return response.data;
}

export const updateSkillDisplayOrder = async (request: Skills): Promise<ApiResponse<null>> => {
    const response = await axios.post<ApiResponse<null>>("/skill/updateSkillDisplayOrder", request);
    return response.data;
}

export const updateProfile = async (request: Profile): Promise<ApiResponse<null>> => {
    const response = await axios.post<ApiResponse<null>>("/profile/updateProfile", request);
    return response.data;
}

export const uploadFile = async (formData: FormData): Promise<ApiResponse<FileResult>> => {
    const response = await axios.post<ApiResponse<FileResult>>("/file/uploadFile", formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        }
    });
    return response.data;
}

export const addProject = async (request: Project): Promise<ApiResponse<null>> => {
    const response = await axios.post<ApiResponse<null>>("/project/addProject", request);
    return response.data;
}

export const updateProjectById = async (request: Project): Promise<ApiResponse<null>> => {
    const response = await axios.post<ApiResponse<null>>("/project/updateProjectById", request);
    return response.data;
}

export const deleteProjectById = async (id: string): Promise<ApiResponse<null>> => {
    const response = await axios.post<ApiResponse<null>>("/project/deleteProjectById", { id });
    return response.data;
}

export const updateProjectDisplayOrder = async (request: Projects): Promise<ApiResponse<null>> => {
    const response = await axios.post<ApiResponse<null>>("/project/updateProjectDisplayOrder", request);
    return response.data;
}

export const addCertificate = async (request: Certificate): Promise<ApiResponse<null>> => {
    const response = await axios.post<ApiResponse<null>>("/certificate/addCertificate", request);
    return response.data;
}

export const updateCertificateById = async (request: Certificate): Promise<ApiResponse<null>> => {
    const response = await axios.post<ApiResponse<null>>("/certificate/updateCertificateById", request);
    return response.data;
}

export const deleteCertificateById = async (id: string): Promise<ApiResponse<null>> => {
    const response = await axios.post<ApiResponse<null>>("/certificate/deleteCertificateById", { id });
    return response.data;
}

export const updateCertificateDisplayOrder = async (request: Certificates): Promise<ApiResponse<null>> => {
    const response = await axios.post<ApiResponse<null>>("/certificate/updateCertificateDisplayOrder", request);
    return response.data;
}

export const getSocialLinks = async (): Promise<ApiResponse<SocialLinks>> => {
    const response = await axios.get<ApiResponse<SocialLinks>>("/profile/getSocialLinks");
    return response.data;
}

export const addSocialLink = async (request: SocialLink): Promise<ApiResponse<null>> => {
    const response = await axios.post<ApiResponse<null>>("/profile/addSocialLink", request);
    return response.data;
}

export const updateSocialLinkById = async (request: SocialLink): Promise<ApiResponse<null>> => {
    const response = await axios.post<ApiResponse<null>>("/profile/updateSocialLinkById", request);
    return response.data;
}

export const deleteSocialLinkById = async (id: string): Promise<ApiResponse<null>> => {
    const response = await axios.post<ApiResponse<null>>("/profile/deleteSocialLinkById", { id });
    return response.data;
}

export const updateSocialLinkDisplayOrder = async (request: SocialLinks): Promise<ApiResponse<null>> => {
    const response = await axios.post<ApiResponse<null>>("/profile/updateSocialLinkDisplayOrder", request);
    return response.data;
}