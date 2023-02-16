import { Interceptor } from './Interceptor';
import { SuccessCallback } from './SuccessCallback';
import { ErrorCallback } from './ErrorCallback';

export type RequestConfig = {
    errorCallbacks?: ErrorCallback[],
    successCallbacks?: SuccessCallback[],
    interceptor?: Interceptor,
    headers?: { [key: string]: string },
    withCredentials?: boolean
};
