import { AxiosInstance, AxiosResponse } from 'axios';

export type Interceptor = (
    response: AxiosResponse,
    axios: AxiosInstance,
    attempt: number,
) => Promise<any> | false;
