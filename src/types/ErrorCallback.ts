import { AxiosError } from 'axios';

export type ErrorCallback = {
    errorCode: number | number[] | null,
    callback: { (error: AxiosError): void }
};
