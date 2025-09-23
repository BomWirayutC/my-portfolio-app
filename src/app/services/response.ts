export default interface AxiosResponse<T> {
    status: number;
    message: string;
    data: T;
}