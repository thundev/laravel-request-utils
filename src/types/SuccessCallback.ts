import { AxiosResponse } from 'axios';

export type SuccessCallback = {
    (response: AxiosResponse): void
};
